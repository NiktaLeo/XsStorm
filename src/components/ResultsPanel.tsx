
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import VulnerabilityCard from "./VulnerabilityCard";
import { ScanResults, Vulnerability, XSSType } from "@/types/scanner";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  Pie, PieChart, Legend 
} from 'recharts';
import { Download, FilterX, Filter } from "lucide-react";
import { generateReport } from "@/utils/scannerUtils";
import { toast } from "sonner";

interface ResultsPanelProps {
  results: ScanResults;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
  const [filter, setFilter] = React.useState<XSSType | 'all'>('all');
  const [showStats, setShowStats] = React.useState<boolean>(true);
  
  // Create data for pie chart
  const typeData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    results.vulnerabilities.forEach(vuln => {
      counts[vuln.type] = (counts[vuln.type] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [results.vulnerabilities]);
  
  // Create data for context bar chart
  const contextData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    results.vulnerabilities.forEach(vuln => {
      counts[vuln.context] = (counts[vuln.context] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [results.vulnerabilities]);
  
  // Color map for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Filter vulnerabilities
  const filteredVulnerabilities = React.useMemo(() => {
    if (filter === 'all') return results.vulnerabilities;
    return results.vulnerabilities.filter(vuln => vuln.type === filter);
  }, [results.vulnerabilities, filter]);
  
  // Export report
  const handleExportReport = () => {
    const reportHtml = generateReport(results);
    const blob = new Blob([reportHtml], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xss-scan-report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report exported successfully!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-semibold">Results</h2>
          <span className="text-sm text-muted-foreground">
            {results.vulnerabilities.length} vulnerabilities found
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setFilter(filter === 'all' ? 'Reflected' : 'all')}
          >
            {filter === 'all' ? <Filter className="h-4 w-4 mr-1" /> : <FilterX className="h-4 w-4 mr-1" />}
            {filter === 'all' ? 'Filter' : `Filtered: ${filter}`}
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={handleExportReport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
        </div>
      </div>
      
      {showStats && results.vulnerabilities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Vulnerability Types</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Injection Contexts</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contextData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0bc5ea">
                      {contextData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {results.vulnerabilities.length > 0 ? (
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVulnerabilities.map(vulnerability => (
              <VulnerabilityCard key={vulnerability.id} vulnerability={vulnerability} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Card className="border border-dashed border-muted bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-center">
              No vulnerabilities found yet. Start a scan to detect XSS issues.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsPanel;
