
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ScanResults, PageInfo, FormInfo } from "@/types/scanner";
import { ChevronRight, ChevronDown, FileText, FolderOpen, AlertCircle } from "lucide-react";

interface CrawlerPanelProps {
  results: ScanResults;
  pages: PageInfo[];
  loading: boolean;
}

const CrawlerPanel: React.FC<CrawlerPanelProps> = ({ results, pages, loading }) => {
  const [expandedPages, setExpandedPages] = React.useState<Record<string, boolean>>({});
  const [expandedForms, setExpandedForms] = React.useState<Record<string, boolean>>({});

  const togglePage = (url: string) => {
    setExpandedPages(prev => ({
      ...prev,
      [url]: !prev[url]
    }));
  };

  const toggleForm = (formId: string) => {
    setExpandedForms(prev => ({
      ...prev,
      [formId]: !prev[formId]
    }));
  };

  const isVulnerable = (url: string, formId?: string, paramName?: string) => {
    return results.vulnerabilities.some(vuln => {
      if (paramName) {
        return vuln.url === url && vuln.parameter === paramName;
      }
      if (formId) {
        const form = pages.find(p => p.url === url)?.forms.find(f => f.id === formId);
        return vuln.url === url && form?.inputs.some(input => input.name === vuln.parameter);
      }
      return vuln.url === url;
    });
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Crawler Results</CardTitle>
          {loading && <Badge variant="outline" className="animate-pulse">Scanning...</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {loading && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>Crawling...</span>
            </div>
            <Progress value={45} className="h-1.5" />
          </div>
        )}
        
        {pages.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-1 pr-4">
              {pages.map((page) => (
                <div key={page.url} className="font-mono text-sm">
                  <div 
                    className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer hover:bg-secondary/50 ${
                      isVulnerable(page.url) ? 'text-security-warning font-medium' : ''
                    }`}
                    onClick={() => togglePage(page.url)}
                  >
                    {expandedPages[page.url] ? (
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3 w-3 shrink-0" />
                    )}
                    <FolderOpen className="h-3.5 w-3.5 shrink-0 mr-1" />
                    <span className="truncate flex-1">{page.url}</span>
                    {isVulnerable(page.url) && (
                      <AlertCircle className="h-3.5 w-3.5 text-security-warning shrink-0" />
                    )}
                    <Badge variant="outline" className="ml-auto text-[10px] px-1 pointer-events-none">{page.forms.length}</Badge>
                  </div>
                  
                  {expandedPages[page.url] && (
                    <div className="pl-6 space-y-1 mt-1">
                      {page.forms.map((form) => (
                        <div key={form.id}>
                          <div 
                            className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer hover:bg-secondary/50 ${
                              isVulnerable(page.url, form.id) ? 'text-security-warning font-medium' : ''
                            }`}
                            onClick={() => toggleForm(form.id)}
                          >
                            {expandedForms[form.id] ? (
                              <ChevronDown className="h-3 w-3 shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 shrink-0" />
                            )}
                            <FileText className="h-3.5 w-3.5 shrink-0 mr-1" />
                            <span className="text-xs">Form {form.method}</span>
                            {isVulnerable(page.url, form.id) && (
                              <AlertCircle className="h-3.5 w-3.5 text-security-warning shrink-0" />
                            )}
                          </div>
                          
                          {expandedForms[form.id] && (
                            <div className="pl-6 space-y-0.5 mt-1 mb-2">
                              {form.inputs.map((input) => (
                                <div 
                                  key={input.name}
                                  className={`text-xs px-2 py-1 flex items-center ${
                                    isVulnerable(page.url, form.id, input.name) 
                                      ? 'text-security-danger font-medium' 
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  <span className="w-24 truncate">{input.name}</span>
                                  <span className="text-[10px] text-muted-foreground">[{input.type}]</span>
                                  {isVulnerable(page.url, form.id, input.name) && (
                                    <AlertCircle className="h-3 w-3 ml-auto text-security-danger" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            {loading ? 'Crawling target website...' : 'No pages crawled yet'}
          </div>
        )}
        
        {pages.length > 0 && (
          <div className="text-xs text-muted-foreground mt-4 border-t pt-2 flex justify-between">
            <span>{pages.length} pages crawled</span>
            <span>
              {results.testedParameters} parameters tested
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrawlerPanel;
