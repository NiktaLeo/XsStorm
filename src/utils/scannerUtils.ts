
import { FormInfo, PageInfo, ScanConfig, ScanResults, Vulnerability, XSSType } from "@/types/scanner";
import { generateRandomPayload } from "./payloadUtils";

// Simulate crawling a URL
export const crawlUrl = async (url: string, config: ScanConfig): Promise<PageInfo[]> => {
  // This is a mock implementation - in a real implementation, we would:
  // 1. Fetch the URL content
  // 2. Parse the HTML to find links
  // 3. Extract forms and inputs
  // 4. Recursively crawl links up to the specified depth
  
  // For demonstration purposes, generate mock data
  // In production, this would be replaced with actual crawling logic
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockPages: PageInfo[] = [];
  const baseUrl = new URL(url).origin;
  
  // Generate mock pages
  const pageCount = Math.floor(Math.random() * 5) + 3; // 3-7 pages
  
  for (let i = 0; i < pageCount; i++) {
    const mockForms: FormInfo[] = [];
    const formCount = Math.floor(Math.random() * 3) + 1; // 1-3 forms per page
    
    for (let j = 0; j < formCount; j++) {
      mockForms.push({
        id: `form-${i}-${j}`,
        action: `${baseUrl}/submit`,
        method: Math.random() > 0.5 ? 'GET' : 'POST',
        inputs: [
          {
            name: 'search',
            type: 'text',
            value: ''
          },
          {
            name: 'username',
            type: 'text',
            value: ''
          },
          {
            name: 'comment',
            type: 'textarea',
            value: ''
          }
        ]
      });
    }
    
    mockPages.push({
      url: i === 0 ? url : `${baseUrl}/page${i}`,
      crawled: true,
      forms: mockForms
    });
  }
  
  return mockPages;
};

// Simulate scanning a page for XSS vulnerabilities
export const scanForVulnerabilities = async (
  pages: PageInfo[],
  config: ScanConfig
): Promise<Vulnerability[]> => {
  // This is a mock implementation
  // In a real scanner, we would:
  // 1. For each page and form, inject payloads into each input
  // 2. Submit the forms and analyze responses
  // 3. Detect successful XSS injections
  // 4. Return found vulnerabilities
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const vulnerabilities: Vulnerability[] = [];
  
  // For demonstration purposes, generate some mock vulnerabilities
  const vulnerabilityTypes: XSSType[] = ['Reflected', 'Stored', 'DOM-Based', 'Blind'];
  
  pages.forEach(page => {
    page.forms.forEach(form => {
      // Randomly decide if this form has vulnerabilities
      if (Math.random() > 0.7) {
        form.inputs.forEach(input => {
          // 30% chance of vulnerability per input
          if (Math.random() > 0.7) {
            const payload = generateRandomPayload();
            const vulnType = vulnerabilityTypes[Math.floor(Math.random() * vulnerabilityTypes.length)];
            
            vulnerabilities.push({
              id: `vuln-${vulnerabilities.length + 1}`,
              url: page.url,
              type: vulnType,
              parameter: input.name,
              payload: payload.value,
              context: payload.context[0],
              status: Math.random() > 0.3 ? 'confirmed' : 'potential',
              description: `${vulnType} XSS found in ${input.name} parameter using ${payload.name}`,
              timestamp: Date.now()
            });
          }
        });
      }
    });
  });
  
  return vulnerabilities;
};

// Start a scan with the provided configuration
export const startScan = async (config: ScanConfig): Promise<ScanResults> => {
  // 1. Start crawling
  const pages = await crawlUrl(config.targetUrl, config);
  
  // 2. Start scanning for vulnerabilities
  const vulnerabilities = await scanForVulnerabilities(pages, config);
  
  // 3. Return results
  return {
    vulnerabilities,
    crawledPages: pages.length,
    testedParameters: pages.reduce((sum, page) => 
      sum + page.forms.reduce((formSum, form) => 
        formSum + form.inputs.length, 0), 0),
    scanStartTime: Date.now() - 4000, // Simulate that scan started 4s ago
    scanEndTime: Date.now(),
    status: 'completed'
  };
};

// Generate a simple HTML report
export const generateReport = (results: ScanResults): string => {
  const vulnerabilitiesByType = results.vulnerabilities.reduce((acc, vuln) => {
    acc[vuln.type] = (acc[vuln.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>XSS Scan Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3 { color: #0f4c81; }
        .summary {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        th { background-color: #0f4c81; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .confirmed { color: #e53e3e; }
        .potential { color: #dd6b20; }
        .false-positive { color: #718096; }
        .payload { font-family: monospace; background-color: #f0f0f0; padding: 2px 4px; }
      </style>
    </head>
    <body>
      <h1>XSS Vulnerability Scan Report</h1>
      
      <div class="summary">
        <h2>Scan Summary</h2>
        <p><strong>Target URL:</strong> ${new URL(results.vulnerabilities[0]?.url || 'https://example.com').origin}</p>
        <p><strong>Scan Date:</strong> ${new Date(results.scanStartTime).toLocaleString()}</p>
        <p><strong>Total Pages Crawled:</strong> ${results.crawledPages}</p>
        <p><strong>Parameters Tested:</strong> ${results.testedParameters}</p>
        <p><strong>Vulnerabilities Found:</strong> ${results.vulnerabilities.length}</p>
        <ul>
          ${Object.entries(vulnerabilitiesByType).map(([type, count]) => 
            `<li><strong>${type} XSS:</strong> ${count}</li>`).join('')}
        </ul>
      </div>
      
      <h2>Detected Vulnerabilities</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>URL</th>
            <th>Parameter</th>
            <th>Context</th>
            <th>Payload</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${results.vulnerabilities.map(vuln => `
            <tr>
              <td>${vuln.type}</td>
              <td>${vuln.url}</td>
              <td>${vuln.parameter}</td>
              <td>${vuln.context}</td>
              <td class="payload">${vuln.payload.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
              <td class="${vuln.status}">${vuln.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <h2>Recommendations</h2>
      <ul>
        <li>Validate and sanitize all user inputs before displaying them on a page.</li>
        <li>Implement Content Security Policy (CSP) headers to restrict script execution sources.</li>
        <li>Use framework-specific output encoding for the correct context (HTML, JavaScript, CSS, URL).</li>
        <li>Consider using auto-escaping template systems that encode by default.</li>
        <li>For DOM-based XSS, avoid using unsafe JavaScript methods like innerHTML, document.write(), or eval().</li>
      </ul>
      
      <p><small>Generated by Context-Aware XSS Scanner - ${new Date().toLocaleString()}</small></p>
    </body>
    </html>
  `;
};
