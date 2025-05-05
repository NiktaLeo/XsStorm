
import React, { useState, useEffect } from 'react';
import { ScanConfig, ScanResults, ScanStatus, PageInfo } from "@/types/scanner";
import { startScan, crawlUrl, scanForVulnerabilities } from "@/utils/scannerUtils";
import { toast } from "sonner";
import ScannerConfig from "./ScannerConfig";
import CrawlerPanel from "./CrawlerPanel";
import PayloadGenerator from "./PayloadGenerator";
import ResultsPanel from "./ResultsPanel";

const Dashboard = () => {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScanResults>({
    vulnerabilities: [],
    crawledPages: 0,
    testedParameters: 0,
    scanStartTime: 0,
    status: 'idle'
  });
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [payloadExpanded, setPayloadExpanded] = useState(false);
  
  // Handle starting a new scan
  const handleStartScan = async (config: ScanConfig) => {
    try {
      setScanStatus('crawling');
      setIsLoading(true);
      setResults({
        vulnerabilities: [],
        crawledPages: 0,
        testedParameters: 0,
        scanStartTime: Date.now(),
        status: 'crawling'
      });
      
      toast.success("Scan started");
      
      // Step 1: Crawl the target site
      const crawledPages = await crawlUrl(config.targetUrl, config);
      setPages(crawledPages);
      
      // Step 2: Scan for vulnerabilities
      setScanStatus('scanning');
      const vulnerabilities = await scanForVulnerabilities(crawledPages, config);
      
      // Step 3: Update results
      const finalResults: ScanResults = {
        vulnerabilities,
        crawledPages: crawledPages.length,
        testedParameters: crawledPages.reduce((sum, page) => 
          sum + page.forms.reduce((formSum, form) => 
            formSum + form.inputs.length, 0), 0),
        scanStartTime: results.scanStartTime,
        scanEndTime: Date.now(),
        status: 'completed'
      };
      
      setResults(finalResults);
      setScanStatus('completed');
      setIsLoading(false);
      
      if (vulnerabilities.length > 0) {
        toast.warning(`Found ${vulnerabilities.length} XSS vulnerabilities!`);
      } else {
        toast.success("Scan completed. No vulnerabilities found.");
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("An error occurred during scanning");
      setScanStatus('stopped');
      setIsLoading(false);
    }
  };
  
  // Handle stopping a scan
  const handleStopScan = () => {
    setScanStatus('stopped');
    setIsLoading(false);
    toast.info("Scan stopped by user");
    
    // Update the results with the current scan status
    setResults(prev => ({
      ...prev,
      status: 'stopped',
      scanEndTime: Date.now()
    }));
  };
  
  // Clear all results
  const handleClearResults = () => {
    setResults({
      vulnerabilities: [],
      crawledPages: 0,
      testedParameters: 0,
      scanStartTime: 0,
      status: 'idle'
    });
    setPages([]);
    setScanStatus('idle');
    toast.info("Scan results cleared");
  };
  
  // Toggle payload generator visibility
  const togglePayloadExpanded = () => {
    setPayloadExpanded(!payloadExpanded);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 space-y-4">
          <ScannerConfig
            startScan={handleStartScan}
            stopScan={handleStopScan}
            clearResults={handleClearResults}
            scanStatus={scanStatus}
          />
          <CrawlerPanel
            results={results}
            pages={pages}
            loading={isLoading}
          />
        </div>
        <div className="lg:w-2/3 space-y-4">
          <PayloadGenerator
            expanded={payloadExpanded}
            toggleExpand={togglePayloadExpanded}
          />
          <ResultsPanel results={results} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
