
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ScanConfig, ScanStatus } from "@/types/scanner";
import { 
  Play, PauseCircle, StopCircle, RotateCcw, Settings2, Lock, 
  Bug, Shield, Database, ArrowRight
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ScannerConfigProps {
  startScan: (config: ScanConfig) => void;
  stopScan: () => void;
  clearResults: () => void;
  scanStatus: ScanStatus;
}

const ScannerConfig: React.FC<ScannerConfigProps> = ({ 
  startScan, 
  stopScan, 
  clearResults,
  scanStatus 
}) => {
  const [advancedOptions, setAdvancedOptions] = React.useState(false);
  
  const [config, setConfig] = React.useState<ScanConfig>({
    targetUrl: '',
    depth: 3,
    threads: 5,
    followSubdomains: false,
    enableWafBypass: false,
    enableBlindXss: false,
    // New options
    domXssDetection: true,
    parameterAnalysis: true,
    maxPayloadTests: 15,
    timeout: 5000,
  });
  
  const handleChange = (key: keyof ScanConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // URL Validation
    try {
      new URL(config.targetUrl);
      startScan(config);
    } catch {
      alert('Please enter a valid URL including http:// or https://');
    }
  };
  
  const isRunning = scanStatus === 'crawling' || scanStatus === 'scanning';
  const isCompleted = scanStatus === 'completed';
  
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="h-4 w-4" /> 
          Scanner Configuration
        </CardTitle>
        <CardDescription>Configure target URL and scan options</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="targetUrl">Target URL</Label>
            <div className="flex gap-2">
              <Input
                id="targetUrl"
                placeholder="https://example.com"
                value={config.targetUrl}
                onChange={(e) => handleChange('targetUrl', e.target.value)}
                disabled={isRunning}
                className="flex-1"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" type="button" disabled={isRunning}>
                      <Lock className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Use cookies from current session</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="depth">Crawl Depth</Label>
              <RadioGroup
                value={config.depth.toString()}
                onValueChange={(value) => handleChange('depth', parseInt(value))}
                className="flex space-x-2"
                disabled={isRunning}
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="2" id="depth-2" />
                  <Label htmlFor="depth-2" className="text-sm">2</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="3" id="depth-3" />
                  <Label htmlFor="depth-3" className="text-sm">3</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="4" id="depth-4" />
                  <Label htmlFor="depth-4" className="text-sm">4</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="threads">Threads</Label>
              <RadioGroup
                value={config.threads.toString()}
                onValueChange={(value) => handleChange('threads', parseInt(value))}
                className="flex space-x-2"
                disabled={isRunning}
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="3" id="threads-3" />
                  <Label htmlFor="threads-3" className="text-sm">3</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="5" id="threads-5" />
                  <Label htmlFor="threads-5" className="text-sm">5</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="10" id="threads-10" />
                  <Label htmlFor="threads-10" className="text-sm">10</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t pt-3">
            <div>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setAdvancedOptions(!advancedOptions)}
              >
                {advancedOptions ? 'Hide' : 'Show'} Advanced Options
              </Button>
            </div>
            
            <div className="flex space-x-2">
              {(isCompleted || scanStatus === 'stopped') && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearResults}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
              
              {isRunning ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={stopScan}
                >
                  <StopCircle className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              ) : (
                <Button type="submit" size="sm" disabled={!config.targetUrl}>
                  <Play className="h-4 w-4 mr-1" />
                  Start Scan
                </Button>
              )}
            </div>
          </div>
          
          {advancedOptions && (
            <Accordion type="single" collapsible className="w-full border-t pt-3">
              <AccordionItem value="detection-options" className="border-0">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Detection Options
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="domXssDetection" className="text-sm">DOM XSS Detection</Label>
                        <p className="text-xs text-muted-foreground">Find client-side injection vectors</p>
                      </div>
                      <Switch
                        id="domXssDetection"
                        checked={config.domXssDetection ?? true}
                        onCheckedChange={(checked) => handleChange('domXssDetection', checked)}
                        disabled={isRunning}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="parameterAnalysis" className="text-sm">Parameter Analysis</Label>
                        <p className="text-xs text-muted-foreground">Analyze parameters for contextual testing</p>
                      </div>
                      <Switch
                        id="parameterAnalysis"
                        checked={config.parameterAnalysis ?? true}
                        onCheckedChange={(checked) => handleChange('parameterAnalysis', checked)}
                        disabled={isRunning}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableBlindXss" className="text-sm">Blind XSS Detection</Label>
                        <p className="text-xs text-muted-foreground">Use callbacks to detect blind XSS vulnerabilities</p>
                      </div>
                      <Switch
                        id="enableBlindXss"
                        checked={config.enableBlindXss}
                        onCheckedChange={(checked) => handleChange('enableBlindXss', checked)}
                        disabled={isRunning}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="maxPayloadTests" className="text-sm">Max Payloads Per Target</Label>
                      <RadioGroup
                        value={(config.maxPayloadTests || 15).toString()}
                        onValueChange={(value) => handleChange('maxPayloadTests', parseInt(value))}
                        className="flex space-x-2"
                        disabled={isRunning}
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="5" id="payloads-5" />
                          <Label htmlFor="payloads-5" className="text-sm">5</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="15" id="payloads-15" />
                          <Label htmlFor="payloads-15" className="text-sm">15</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="30" id="payloads-30" />
                          <Label htmlFor="payloads-30" className="text-sm">30</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {config.enableBlindXss && (
                      <div className="space-y-1">
                        <Label htmlFor="callbackUrl" className="text-sm">Callback URL</Label>
                        <Input
                          id="callbackUrl"
                          placeholder="https://yourserver.xsshunter.com"
                          value={config.callbackUrl || ''}
                          onChange={(e) => handleChange('callbackUrl', e.target.value)}
                          disabled={isRunning}
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          URL that will be notified when blind XSS is triggered
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="waf-options" className="border-0">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    WAF Bypass Options
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableWafBypass" className="text-sm">WAF Bypass Techniques</Label>
                        <p className="text-xs text-muted-foreground">Use techniques to bypass Web Application Firewalls</p>
                      </div>
                      <Switch
                        id="enableWafBypass"
                        checked={config.enableWafBypass}
                        onCheckedChange={(checked) => handleChange('enableWafBypass', checked)}
                        disabled={isRunning}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="timeout" className="text-sm">Request Timeout (ms)</Label>
                      <RadioGroup
                        value={(config.timeout || 5000).toString()}
                        onValueChange={(value) => handleChange('timeout', parseInt(value))}
                        className="flex space-x-2"
                        disabled={isRunning}
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="3000" id="timeout-3000" />
                          <Label htmlFor="timeout-3000" className="text-sm">3000</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="5000" id="timeout-5000" />
                          <Label htmlFor="timeout-5000" className="text-sm">5000</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="10000" id="timeout-10000" />
                          <Label htmlFor="timeout-10000" className="text-sm">10000</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="crawl-options" className="border-0">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Crawling Options
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="followSubdomains" className="text-sm">Follow Subdomains</Label>
                        <p className="text-xs text-muted-foreground">Scan pages on subdomains of the target</p>
                      </div>
                      <Switch
                        id="followSubdomains"
                        checked={config.followSubdomains}
                        onCheckedChange={(checked) => handleChange('followSubdomains', checked)}
                        disabled={isRunning}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="excludePaths" className="text-sm">Exclude Paths (optional)</Label>
                      <Input
                        id="excludePaths"
                        placeholder="logout, admin, profile"
                        value={config.excludePaths?.join(', ') || ''}
                        onChange={(e) => handleChange('excludePaths', 
                          e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        )}
                        disabled={isRunning}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Comma-separated paths to exclude from crawling
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="headers" className="text-sm">Custom Headers (optional)</Label>
                      <Input
                        id="headers"
                        placeholder="X-Token: value, X-Custom: value"
                        value={config.headers ? Object.entries(config.headers).map(([k,v]) => `${k}: ${v}`).join(', ') : ''}
                        onChange={(e) => {
                          const headerObj: Record<string, string> = {};
                          e.target.value.split(',').forEach(pair => {
                            const [key, value] = pair.split(':').map(s => s.trim());
                            if (key && value) headerObj[key] = value;
                          });
                          handleChange('headers', Object.keys(headerObj).length > 0 ? headerObj : undefined);
                        }}
                        disabled={isRunning}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Custom headers for all requests (format: Name: Value)
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ScannerConfig;
