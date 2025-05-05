
export type XSSType = 'Reflected' | 'Stored' | 'DOM-Based' | 'Blind';

export type ScanStatus = 'idle' | 'crawling' | 'scanning' | 'completed' | 'stopped';

export type VulnerabilityStatus = 'confirmed' | 'potential' | 'false-positive';

export type PageInfo = {
  url: string;
  crawled: boolean;
  forms: FormInfo[];
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
};

export type Payload = {
  id: string;
  value: string;
  name: string;
  category: PayloadCategory;
  description: string;
  context: HTMLContext[];
};

export type HTMLContext = 
  | 'html'
  | 'attribute'
  | 'script'
  | 'style'
  | 'url'
  | 'comment';

export type PayloadCategory = 
  | 'basic'
  | 'advanced'
  | 'waf-bypass'
  | 'blind'
  | 'dom';

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
};

export type ScanResults = {
  vulnerabilities: Vulnerability[];
  crawledPages: number;
  testedParameters: number;
  scanStartTime: number;
  scanEndTime?: number;
  status: ScanStatus;
};
