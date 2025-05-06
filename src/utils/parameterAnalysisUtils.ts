import { InputField, ParameterAnalysisResult, ParameterType, HTMLContext } from "@/types/scanner";
import { analyzeContext } from "./contextAnalysisUtils";

// Analyze a parameter to determine its type and properties
export const analyzeParameter = (
  name: string,
  value: string,
  responseText: string
): ParameterAnalysisResult => {
  // Check if parameter is reflected in response
  const isReflected = responseText.includes(value) && value.length > 0;
  
  // Find where in the response the parameter value occurs
  const locations: string[] = [];
  if (isReflected) {
    // Find all occurrences
    let index = responseText.indexOf(value);
    while (index !== -1) {
      const context = analyzeContext(responseText, value);
      const location = `${context.primaryContext}${context.secondaryContext ? '->' + context.secondaryContext : ''}`;
      
      // Only add unique locations
      if (!locations.includes(location)) {
        locations.push(location);
      }
      
      index = responseText.indexOf(value, index + 1);
    }
  }
  
  // Determine parameter type based on name and value
  const type = determineParameterType(name, value);
  
  // Check for signs of sanitization
  const sanitization = checkForSanitization(value, responseText);
  
  return {
    name,
    type,
    reflection: isReflected,
    locations,
    context: locations.map(loc => loc.split('->')[0]) as any[], // Extract primary contexts
    sanitization
  };
};

// Determine parameter type based on name and value
const determineParameterType = (name: string, value: string): ParameterType => {
  // Check for common identifier parameter names
  if (/^(?:id|user_?id|account_?id|uuid|guid)$/i.test(name)) {
    return 'identifier';
  }
  
  // Check for path-like parameters
  if (/^(?:path|url|redirect|return_?url|next|back)$/i.test(name)) {
    return 'path';
  }
  
  // Check for command parameters
  if (/^(?:cmd|command|exec|do|action|func|callback)$/i.test(name)) {
    return 'command';
  }
  
  // Check for file parameters
  if (/^(?:file|upload|document|attachment)$/i.test(name) || 
      /\.(jpe?g|png|gif|svg|pdf|docx?|xlsx?|txt|zip)$/i.test(value)) {
    return 'file';
  }
  
  // Check for JSON data
  if ((name === 'json' || name === 'data') && 
      (value.startsWith('{') || value.startsWith('['))) {
    return 'json';
  }
  
  // Check for XML data
  if ((name === 'xml' || name === 'data') && 
      (value.startsWith('<') && value.includes('>'))) {
    return 'xml';
  }
  
  // Default to user input
  return 'user-input';
};

// Check if parameter value shows signs of sanitization in the response
const checkForSanitization = (value: string, responseText: string): boolean => {
  if (!responseText.includes(value)) return false;
  
  const testChars = '<>"\'&';
  const hasSpecialChars = testChars.split('').some(char => value.includes(char));
  
  // If original value has no special chars, we can't easily determine sanitization
  if (!hasSpecialChars) return false;
  
  // Check if HTML entities are present instead of raw characters
  const htmlEntities = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '&': '&amp;'
  };
  
  // For each special character in the value, check if it's encoded in the response
  for (const char of testChars) {
    if (value.includes(char)) {
      const encodedChar = htmlEntities[char as keyof typeof htmlEntities];
      const rawCharPosition = responseText.indexOf(value);
      
      if (rawCharPosition !== -1) {
        const encodedValue = value.replace(new RegExp(char, 'g'), encodedChar);
        if (responseText.includes(encodedValue)) {
          return true; // Found encoded version, suggests sanitization
        }
      }
    }
  }
  
  return false;
};

// Analyze all input fields in a form
export const analyzeFormParameters = (
  inputs: InputField[],
  responseText: string
): ParameterAnalysisResult[] => {
  return inputs.map(input => analyzeParameter(input.name, input.value, responseText));
};

// Get high-risk parameters that should be prioritized for testing
export const getHighRiskParameters = (
  results: ParameterAnalysisResult[]
): ParameterAnalysisResult[] => {
  return results.filter(result => {
    // Parameters that are reflected without sanitization are high risk
    if (result.reflection && !result.sanitization) return true;
    
    // Command parameters are high risk
    if (result.type === 'command') return true;
    
    // Path/URL parameters are high risk
    if (result.type === 'path') return true;
    
    // Parameters reflected in script context
    if (result.context.includes('script')) return true;
    
    // Parameters that appear in multiple contexts
    if (result.context.length > 1) return true;
    
    return false;
  });
};
