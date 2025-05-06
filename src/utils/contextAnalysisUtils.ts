import { ContextAnalysisResult, FilterInfo, HTMLContext, EncodingType, DOMSinkType, Payload } from "@/types/scanner";

// Enhanced context detection with deeper analysis
export const analyzeContext = (html: string, injectionPoint: string): ContextAnalysisResult => {
  const injectionIndex = html.indexOf(injectionPoint);
  
  if (injectionIndex === -1) return { primaryContext: 'html' }; // Default
  
  // Get a larger window around the injection point for better analysis
  const windowSize = 500; // Larger window for more accurate context detection
  const before = html.substring(Math.max(0, injectionIndex - windowSize), injectionIndex);
  const after = html.substring(injectionIndex + injectionPoint.length, 
                              Math.min(html.length, injectionIndex + injectionPoint.length + windowSize));
  
  // Detect primary context
  const primaryContext = detectPrimaryContext(before, after);
  
  // Detect secondary context if needed
  const secondaryContext = detectSecondaryContext(before, after, primaryContext);
  
  // Detect filters that might be in place
  const filters = detectFilters(before, after, primaryContext);
  
  // Detect encodings applied to the input
  const encodings = detectEncodings(injectionPoint);
  
  // Determine escape sequence needed
  const escapeSequence = determineEscapeSequence(primaryContext, secondaryContext, filters);
  
  return {
    primaryContext,
    secondaryContext,
    filters,
    encodings,
    escapeSequence
  };
};

// Detect the primary HTML context of the injection point
const detectPrimaryContext = (before: string, after: string): HTMLContext => {
  // Improved context detection with regex patterns
  
  // Check for script context
  if (/<script[^>]*>(?:\s|\/\/.*|\/\*[\s\S]*?\*\/)*$/.test(before) || 
      /^(?:\s|\/\/.*|\/\*[\s\S]*?\*\/)*<\/script>/i.test(after)) {
    return 'script';
  }
  
  // Check for JSON context (often in script tags or response bodies)
  if (/[\[{]\s*["'][\w-]*["']\s*:\s*["']?$/.test(before) && /^["']?\s*[,}\]]/.test(after)) {
    return 'json';
  }
  
  // Check for style context
  if (/<style[^>]*>[^<]*$/.test(before) || /^[^<]*<\/style>/i.test(after)) {
    return 'style';
  }
  
  // Check for comment context
  if (/<!--[^<]*$/.test(before) || /^[^<]*-->/i.test(after)) {
    return 'comment';
  }
  
  // Check for Angular binding context
  if (/\{\{[^}]*$/.test(before) || /^[^{]*\}\}/.test(after)) {
    return 'angular';
  }
  
  // Check for React JSX context
  if (/\{[^}]*$/.test(before) && /^[^{]*\}/.test(after) && 
      (/<[A-Za-z][A-Za-z0-9]*/.test(before) || /<\/[A-Za-z][A-Za-z0-9]*/.test(after))) {
    return 'react';
  }
  
  // Check for Vue binding context
  if (/v-[a-z]+="[^"]*$/.test(before) || /^[^"]*"/.test(after)) {
    return 'vue';
  }
  
  // Check for URL context
  if (/\s(?:src|href|action|formaction|location|url|content)=['"][^'"]*$/.test(before)) {
    return 'url';
  }
  
  // Check for tag name context
  if (/\/?[a-zA-Z0-9-]*$/.test(before)) {
    return 'tag-name';
  }
  
  // Check for attribute name context
  if (/<[^>]+\s+[a-zA-Z0-9-]*$/.test(before) && /^[a-zA-Z0-9-]*=/.test(after)) {
    return 'attribute-name';
  }
  
  // Check for attribute value context
  if (/\s[a-zA-Z0-9-]+=(['"])[^'"]*$/.test(before) || /^[^'"]*(['"])/.test(after)) {
    return 'attribute';
  }
  
  // Default is HTML context
  return 'html';
};

// Detect any secondary context that might affect payload selection
const detectSecondaryContext = (
  before: string, 
  after: string, 
  primaryContext: HTMLContext
): HTMLContext | undefined => {
  // If primary context is script, check if it's within JSON
  if (primaryContext === 'script' && 
      (/JSON\.parse\(\s*['"]$/.test(before) || /^\s*['"]\s*\)/.test(after))) {
    return 'json';
  }
  
  // If primary context is attribute, check if it's an event handler
  if (primaryContext === 'attribute' && 
      /\s(?:on[a-z]+)=(['"])[^'"]*$/.test(before)) {
    return 'script';
  }
  
  // If primary context is url, check if it's javascript: protocol
  if (primaryContext === 'url' && 
      /=['"](?:javascript|data):$/.test(before)) {
    return 'script';
  }
  
  return undefined;
};

// Detect filters that might be applied to the input
const detectFilters = (
  before: string, 
  after: string, 
  context: HTMLContext
): FilterInfo[] => {
  const filters: FilterInfo[] = [];
  
  // Look for signs of tag stripping
  if (/<[^>]*>\s*$/.test(before) && /^\s*[^<]*>/.test(after)) {
    filters.push({ type: 'strip-tags' });
  }
  
  // Look for signs of quote escaping
  if (/=(?:'|")[^'"]*\\'/.test(before) || /\\"[^'"]*(?:'|")/.test(after)) {
    filters.push({ type: 'escape-quotes' });
  }
  
  // Look for signs of HTML encoding
  if (/&(?:lt|gt|quot|apos|amp);/.test(before + after)) {
    filters.push({ type: 'html-encode' });
  }
  
  // Check for keyword filtering (basic check, would need to be refined with testing)
  const suspiciousKeywords = ['script', 'alert', 'eval', 'javascript', 'onerror'];
  const content = before.slice(-20) + after.slice(0, 20).toLowerCase();
  
  if (suspiciousKeywords.some(keyword => 
    content.includes(keyword.replace(/[i]/g, 'i').replace(/[a]/g, 'a')))) {
    filters.push({ 
      type: 'keyword-filter',
      pattern: 'script|alert|eval|javascript|onerror'
    });
  }
  
  return filters;
};

// Detect encodings applied to the input
const detectEncodings = (input: string): EncodingType[] => {
  const encodings: EncodingType[] = [];
  
  // Check for URL encoding
  if (/%[0-9A-Fa-f]{2}/.test(input)) {
    encodings.push('url');
    
    // Check for double URL encoding
    if (/%25[0-9A-Fa-f]{2}/.test(input)) {
      encodings.push('double-url');
    }
  }
  
  // Check for HTML encoding
  if (/&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/.test(input)) {
    encodings.push('html');
  }
  
  // Check for Base64 encoding (simplified check)
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(input) && input.length % 4 === 0) {
    encodings.push('base64');
  }
  
  // Check for JavaScript Unicode escapes
  if (/\\u[0-9a-fA-F]{4}/.test(input)) {
    encodings.push('javascript');
  }
  
  // Check for hex encoding
  if (/\\x[0-9a-fA-F]{2}/.test(input)) {
    encodings.push('hex');
  }
  
  // Check for Unicode encoding
  if (/\\u[0-9a-fA-F]{4}/.test(input)) {
    encodings.push('unicode');
  }
  
  return encodings.length > 0 ? encodings : ['none'];
};

// Determine the escape sequence needed based on context
const determineEscapeSequence = (
  primaryContext: HTMLContext,
  secondaryContext?: HTMLContext,
  filters?: FilterInfo[]
): string => {
  switch (primaryContext) {
    case 'script':
      return '"; ';
    case 'attribute':
      return '">';
    case 'style':
      return '</style>';
    case 'comment':
      return '-->';
    case 'json':
      return '","injected":true,"x":"';
    case 'angular':
      return '{{constructor.constructor(\'alert(1)\')()}}';
    case 'react':
      return '}; alert(1); {';
    case 'vue':
      return '"><img src onerror="alert(1)">';
    case 'url':
      return 'javascript:alert(1)//';
    default:
      return '';
  }
};

// Analyze DOM structure to find potential XSS sinks
export const analyzeDOMSinks = (domContent: string): DOMSinkInfo[] => {
  const sinks: DOMSinkInfo[] = [];
  
  // Look for dangerous DOM patterns (this is simplified, real implementation would be more comprehensive)
  const patterns = [
    { pattern: /\.innerHTML\s*=/, sinkType: 'innerHTML' },
    { pattern: /\.outerHTML\s*=/, sinkType: 'outerHTML' },
    { pattern: /document\.write\s*\(/, sinkType: 'document.write' },
    { pattern: /eval\s*\(/, sinkType: 'eval' },
    { pattern: /setTimeout\s*\(["'](.*?)["']\)/, sinkType: 'setTimeout' },
    { pattern: /setInterval\s*\(["'](.*?)["']\)/, sinkType: 'setInterval' },
    { pattern: /location(?:\.href|\[["']href["']\])\s*=/, sinkType: 'location' },
    { pattern: /\$\(.*?\)\.html\(/, sinkType: 'jQuery' },
    { pattern: /\$\(.*?\)\.append\(/, sinkType: 'jQuery' }
  ];
  
  // Search for each pattern
  patterns.forEach(({ pattern, sinkType }) => {
    const matches = domContent.match(new RegExp(pattern, 'g'));
    if (matches) {
      sinks.push({
        sinkType: sinkType as DOMSinkType,
        count: matches.length,
        pattern: pattern.toString()
      });
    }
  });
  
  return sinks;
};

export interface DOMSinkInfo {
  sinkType: DOMSinkType;
  count: number;
  pattern: string;
}

// Get the best payload for a specific context
export const getBestPayloadForContext = (
  analysis: ContextAnalysisResult,
  payloads: Payload[]
): Payload | null => {
  // Filter by primary context
  let candidates = payloads.filter(p => 
    p.context.includes(analysis.primaryContext)
  );
  
  // If no matches, try more generic payloads
  if (candidates.length === 0) {
    candidates = payloads.filter(p => p.category === 'polyglot');
  }
  
  // If still no matches, use basic payloads
  if (candidates.length === 0) {
    candidates = payloads.filter(p => p.category === 'basic');
  }
  
  // If filters detected, prefer filter bypass payloads
  if (analysis.filters && analysis.filters.length > 0) {
    const filterBypassPayloads = candidates.filter(p => 
      p.category === 'filter-bypass' || p.category === 'waf-bypass'
    );
    
    if (filterBypassPayloads.length > 0) {
      candidates = filterBypassPayloads;
    }
  }
  
  // If secondary context exists, prefer payloads that work in both contexts
  if (analysis.secondaryContext) {
    const dualContextPayloads = candidates.filter(p => 
      p.context.includes(analysis.secondaryContext as HTMLContext)
    );
    
    if (dualContextPayloads.length > 0) {
      candidates = dualContextPayloads;
    }
  }
  
  // Sort by effectiveness if available
  candidates.sort((a, b) => 
    (b.effectiveness || 5) - (a.effectiveness || 5)
  );
  
  return candidates.length > 0 ? candidates[0] : null;
};
