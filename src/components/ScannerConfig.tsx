
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ScanConfig, ScanStatus } from "@/types/scanner";
import { 
  Play, PauseCircle, StopCircle, RotateCcw, Settings2, Lock
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
            <div className="space-y-3 border-t pt-3">
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
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableWafBypass" className="text-sm">WAF Bypass</Label>
                  <p className="text-xs text-muted-foreground">Use techniques to bypass Web Application Firewalls</p>
                </div>
                <Switch
                  id="enableWafBypass"
                  checked={config.enableWafBypass}
                  onCheckedChange={(checked) => handleChange('enableWafBypass', checked)}
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
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ScannerConfig;
