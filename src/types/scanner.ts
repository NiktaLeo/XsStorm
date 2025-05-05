
export type XSSType = 'Reflected' | 'Stored' | 'DOM-Based' | 'Blind';

export type ScanStatus = 'idle' | 'crawling' | 'scanning' | 'completed' | 'stopped';

export type VulnerabilityStatus = 'confirmed' | 'potential' | 'false-positive';

export type PageInfo = {
  url: string;
  crawled: boolean;
  forms: FormInfo[];
  domElements?: DOMElementInfo[]; // New: for DOM XSS detection
};

export type FormInfo = {
  id: string;
  action: string;
  method: string;
  inputs: InputField[];
};

export type InputField = {
  name: string;
  type: string;
  value: string;
  parameterType?: ParameterType; // New: classification of parameter
};

// New: Parameter classification for more targeted testing
export type ParameterType = 
  | 'user-input'  // User-controlled input like search terms
  | 'identifier'  // IDs, usernames, etc.
  | 'command'     // Parameters that trigger actions
  | 'path'        // URL path components
  | 'file'        // File uploads or references
  | 'json'        // JSON data
  | 'xml'         // XML data
  | 'unknown';    // Unclassified

export type DOMElementInfo = {
  selector: string;
  eventHandlers: string[];
  sinkType: DOMSinkType;
  sourceValue?: string;
};

// New: DOM XSS sink categories
export type DOMSinkType = 
  | 'innerHTML'
  | 'outerHTML'
  | 'document.write'
  | 'eval'
  | 'setTimeout'
  | 'setInterval'
  | 'location'
  | 'jQuery'
  | 'other';

export type HTMLContext = 
  | 'html'
  | 'attribute'
  | 'script'
  | 'style'
  | 'url'
  | 'comment'
  | 'json'          // New: JSON context 
  | 'angular'       // New: Angular template
  | 'react'         // New: React JSX
  | 'vue'           // New: Vue template
  | 'attribute-name' // New: For attributes name injection
  | 'tag-name';      // New: For tag name injection

export type PayloadCategory = 
  | 'basic'
  | 'advanced'
  | 'waf-bypass'
  | 'blind'
  | 'dom'
  | 'polyglot'       // New: Works in multiple contexts
  | 'framework'      // New: Framework-specific (Angular, React, Vue)
  | 'filter-bypass'  // New: Bypasses common filters
  | 'encoding-based' // New: Uses various encodings
  | 'mutation-based'; // New: Uses DOM mutations

// New: Interface for advanced context analysis
export type ContextAnalysisResult = {
  primaryContext: HTMLContext;
  secondaryContext?: HTMLContext;
  escapeSequence?: string;
  filters?: FilterInfo[];
  encodings?: EncodingType[];
};

// New: Information about detected filters
export type FilterInfo = {
  type: FilterType;
  pattern?: string;
  replacement?: string;
};

export type FilterType =
  | 'strip-tags'
  | 'escape-quotes'
  | 'html-encode'
  | 'url-encode'
  | 'javascript-encode'
  | 'keyword-filter'
  | 'length-limit';

// New: Types of encoding detected
export type EncodingType =
  | 'none'
  | 'html'
  | 'url'
  | 'double-url'
  | 'base64'
  | 'javascript'
  | 'hex'
  | 'unicode';

export type Payload = {
  id: string;
  value: string;
  name: string;
  category: PayloadCategory;
  description: string;
  context: HTMLContext[];
  encodings?: EncodingType[];  // New: Suggested encodings for this payload
  effectiveness?: number;      // New: Effectiveness score (0-10)
  size?: number;               // New: Size in bytes (for size constraints)
};

export type Vulnerability = {
  id: string;
  url: string;
  type: XSSType;
  parameter: string;
  payload: string;
  context: HTMLContext;
  status: VulnerabilityStatus;
  description: string;
  timestamp: number;
  parameterType?: ParameterType; // New: Parameter classification
  evidence?: string; // New: Evidence of exploitation
  severity?: 'low' | 'medium' | 'high' | 'critical'; // New: Severity rating
  impact?: string[]; // New: Potential impact
  wafBypassed?: boolean; // New: Whether WAF was bypassed
};

export type ScanConfig = {
  targetUrl: string;
  depth: number;
  threads: number;
  followSubdomains: boolean;
  enableWafBypass: boolean;
  enableBlindXss: boolean;
  authCookies?: string;
  callbackUrl?: string;
  domXssDetection?: boolean; // New: Enable DOM XSS detection
  parameterAnalysis?: boolean; // New: Enable parameter analysis
  timeout?: number; // New: Request timeout in ms
  maxPayloadTests?: number; // New: Maximum number of payloads to test
  excludePaths?: string[]; // New: Paths to exclude from scanning
  headers?: Record<string, string>; // New: Custom headers for requests
};

export type ScanResults = {
  vulnerabilities: Vulnerability[];
  crawledPages: number;
  testedParameters: number;
  scanStartTime: number;
  scanEndTime?: number;
  status: ScanStatus;
  wafDetected?: boolean; // New: Whether WAF was detected
  wafType?: string; // New: Type of WAF detected
  domSinks?: number; // New: Number of DOM sinks found
  parametersAnalyzed?: ParameterAnalysisResult[]; // New: Parameter analysis results
};

// New: Results of parameter analysis
export type ParameterAnalysisResult = {
  name: string;
  type: ParameterType;
  reflection: boolean; // Whether parameter is reflected in response
  locations: string[]; // Where parameter is reflected
  context: HTMLContext[];
  sanitization: boolean; // Whether parameter is sanitized
};
