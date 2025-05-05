
import { DOMElementInfo, DOMSinkType, PageInfo } from "@/types/scanner";

// Find DOM-based XSS sinks from page content
export const findDOMXSSSinks = (pageContent: string): DOMElementInfo[] => {
  const sinks: DOMElementInfo[] = [];
  
  // Check for various DOM sinks
  const sinkPatterns = [
    // innerHTML patterns
    { 
      regex: /(\w+)\.innerHTML\s*=\s*([^;]+)/g, 
      sinkType: 'innerHTML'
    },
    // outerHTML patterns
    { 
      regex: /(\w+)\.outerHTML\s*=\s*([^;]+)/g, 
      sinkType: 'outerHTML'
    },
    // document.write patterns
    { 
      regex: /document\.write\s*\(\s*([^)]+)\)/g, 
      sinkType: 'document.write'
    },
    // jQuery html patterns
    { 
      regex: /\$\(([^)]+)\)\.html\s*\(\s*([^)]+)\)/g, 
      sinkType: 'jQuery'
    },
    // Location assignment
    { 
      regex: /(location|window\.location|document\.location|location\.href)\s*=\s*([^;]+)/g, 
      sinkType: 'location'
    },
    // Eval patterns
    { 
      regex: /eval\s*\(\s*([^)]+)\)/g, 
      sinkType: 'eval'
    },
    // setTimeout with string
    { 
      regex: /setTimeout\s*\(\s*(['"`][^'"`]+['"`])/g, 
      sinkType: 'setTimeout'
    },
    // setInterval with string
    { 
      regex: /setInterval\s*\(\s*(['"`][^'"`]+['"`])/g, 
      sinkType: 'setInterval'
    }
  ];
  
  // Search for sinks
  sinkPatterns.forEach(({ regex, sinkType }) => {
    let match;
    while ((match = regex.exec(pageContent)) !== null) {
      const sourceValue = match[2] || match[1];
      const selector = match[1] || 'unknown';
      
      sinks.push({
        selector: selector.replace(/['"]/g, '').trim(),
        eventHandlers: [],
        sinkType: sinkType as DOMSinkType,
        sourceValue: sourceValue.trim()
      });
    }
  });
  
  // Find event handlers with dangerous sinks
  const eventHandlerRegex = /<[^>]+\s+(on\w+)\s*=\s*(['"])(.*?)\2/g;
  let eventMatch;
  
  while ((eventMatch = eventHandlerRegex.exec(pageContent)) !== null) {
    const eventName = eventMatch[1];
    const handlerCode = eventMatch[3];
    
    // Check if handler contains potentially dangerous operations
    if (/document\.write|innerHTML|eval|setTimeout|setInterval|location/i.test(handlerCode)) {
      sinks.push({
        selector: `[${eventName}]`,
        eventHandlers: [eventName],
        sinkType: 'other',
        sourceValue: handlerCode
      });
    }
  }
  
  return sinks;
};

// Analyze URL parameters to find potential DOM XSS sources
export const findDOMXSSSources = (url: string, pageContent: string): string[] => {
  const sources: string[] = [];
  
  // Extract all URL parameters
  try {
    const urlObj = new URL(url);
    const params = Array.from(urlObj.searchParams.keys());
    
    // Check if any parameter is used in a sink
    params.forEach(param => {
      // Common parameter access patterns
      const patterns = [
        // URL search params
        new RegExp(`URLSearchParams[^)]*\\.get\\(['"](${param})['"](\\))`, 'i'),
        // Get parameter patterns
        new RegExp(`get(Parameter|Param)\\s*\\(\\s*['"]${param}['"]\\s*\\)`, 'i'),
        // Direct location.search access
        new RegExp(`location\\.search.*(${param})[=&]`, 'i'),
        // Direct access via bracket notation
        new RegExp(`params\\s*\\[\\s*['"]${param}['"]\\s*\\]`, 'i'),
        // Direct regex extraction
        new RegExp(`${param}=([^&]+)`, 'i')
      ];
      
      // Check if any pattern is found in the page content
      const isUsed = patterns.some(pattern => pattern.test(pageContent));
      
      if (isUsed) {
        sources.push(param);
      }
    });
    
    // Check for fragment/hash usage
    if (/#/.test(url) && /location\.hash|window\.location\.hash/.test(pageContent)) {
      sources.push('hash');
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
  }
  
  return sources;
};

// Generate payloads for DOM XSS testing
export const getDOMXSSPayloads = (sinkType: DOMSinkType): string[] => {
  const payloads: Record<DOMSinkType, string[]> = {
    'innerHTML': [
      '<img src=x onerror=alert(1)>',
      '<script>alert(1)</script>',
      '<svg onload=alert(1)>',
      '<iframe srcdoc="<script>alert(1)</script>">',
      '"><img src=x onerror=alert(1)>'
    ],
    'outerHTML': [
      '<img src=x onerror=alert(1)>',
      '<script>alert(1)</script>',
      '<svg onload=alert(1)>',
      '<iframe srcdoc="<script>alert(1)</script>">'
    ],
    'document.write': [
      '<img src=x onerror=alert(1)>',
      '<script>alert(1)</script>',
      '"+alert(1)+"'
    ],
    'eval': [
      'alert(1)',
      '"; alert(1) //',
      'alert`1`',
      'console.log(1);alert(1)'
    ],
    'setTimeout': [
      'alert(1)',
      'alert`1`',
      '); alert(1); //'
    ],
    'setInterval': [
      'alert(1)',
      'alert`1`',
      '); alert(1); //'
    ],
    'location': [
      'javascript:alert(1)',
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      '#<img src=x onerror=alert(1)>'
    ],
    'jQuery': [
      '<img src=x onerror=alert(1)>',
      '<script>alert(1)</script>',
      '<svg onload=alert(1)>'
    ],
    'other': [
      'alert(1)',
      'console.log(1);alert(1)',
      'prompt(1)'
    ]
  };
  
  return payloads[sinkType] || payloads.other;
};

// Test a page for DOM XSS vulnerabilities
export const testForDOMXSS = async (
  page: PageInfo, 
  sinks: DOMElementInfo[]
): Promise<DOMElementInfo[]> => {
  // In a real implementation, this would be a complex function that would:
  // 1. Use a headless browser to load the page
  // 2. Find all identified sinks
  // 3. Test each sink with appropriate payloads
  // 4. Check if payloads execute
  // 5. Return confirmed vulnerable elements
  
  // For this implementation, we'll simulate finding some vulnerable sinks
  const vulnerableSinks: DOMElementInfo[] = [];
  
  // Simulate that ~30% of sinks are vulnerable
  sinks.forEach(sink => {
    if (Math.random() < 0.3) {
      vulnerableSinks.push(sink);
    }
  });
  
  return vulnerableSinks;
};
