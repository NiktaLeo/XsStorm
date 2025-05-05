
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RefreshCcw, ChevronDown, ChevronUp } from "lucide-react";
import { getDefaultPayloads, getPayloadsByContext, applyWafBypass } from "@/utils/payloadUtils";
import { HTMLContext, Payload } from "@/types/scanner";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PayloadGeneratorProps {
  expanded: boolean;
  toggleExpand: () => void;
}

const PayloadGenerator: React.FC<PayloadGeneratorProps> = ({ expanded, toggleExpand }) => {
  const [context, setContext] = React.useState<HTMLContext>('html');
  const [currentPayload, setCurrentPayload] = React.useState<Payload | null>(null);
  const [customPayload, setCustomPayload] = React.useState<string>('');
  const [wafBypassEnabled, setWafBypassEnabled] = React.useState<boolean>(false);
  const [wafBypassPayloads, setWafBypassPayloads] = React.useState<string[]>([]);
  
  // Get all payloads for the current context
  const payloads = React.useMemo(() => {
    return getPayloadsByContext(context);
  }, [context]);
  
  // Handle payload selection
  const handleSelectPayload = (payload: Payload) => {
    setCurrentPayload(payload);
    setCustomPayload(payload.value);
    
    if (wafBypassEnabled) {
      setWafBypassPayloads(applyWafBypass(payload.value));
    }
  };
  
  // Generate random payload
  const handleGenerateRandom = () => {
    const contextPayloads = getPayloadsByContext(context);
    if (contextPayloads.length > 0) {
      const randomIndex = Math.floor(Math.random() * contextPayloads.length);
      handleSelectPayload(contextPayloads[randomIndex]);
    }
  };
  
  // Toggle WAF bypass mode
  const handleToggleWafBypass = () => {
    setWafBypassEnabled(!wafBypassEnabled);
    if (!wafBypassEnabled && currentPayload) {
      setWafBypassPayloads(applyWafBypass(currentPayload.value));
    }
  };
  
  // Copy payload to clipboard
  const handleCopyPayload = (payload: string) => {
    navigator.clipboard.writeText(payload);
    toast.success("Payload copied to clipboard");
  };
  
  // Select a context-specific payload on initial render
  React.useEffect(() => {
    if (payloads.length > 0) {
      handleSelectPayload(payloads[0]);
    }
  }, [context]);

  if (!expanded) {
    return (
      <Card className="border-dashed cursor-pointer hover:border-primary transition-colors" onClick={toggleExpand}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-security-accent flex items-center justify-center">
              <span className="text-xs font-bold text-white">&gt;&lt;</span>
            </div>
            <span className="font-medium">Payload Generator</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3 flex flex-row items-center justify-between cursor-pointer" onClick={toggleExpand}>
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-security-accent flex items-center justify-center">
            <span className="text-xs font-bold text-white">&gt;&lt;</span>
          </div>
          Payload Generator
        </CardTitle>
        <ChevronUp className="h-4 w-4 opacity-70" />
      </CardHeader>
      <CardContent className="pb-4">
        <Tabs defaultValue="library">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="library" className="flex-1">Payload Library</TabsTrigger>
            <TabsTrigger value="custom" className="flex-1">Custom Payloads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Injection Context</label>
                <Select value={context} onValueChange={(val) => setContext(val as HTMLContext)}>
                  <SelectTrigger className="font-mono text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML Body</SelectItem>
                    <SelectItem value="attribute">HTML Attribute</SelectItem>
                    <SelectItem value="script">JavaScript</SelectItem>
                    <SelectItem value="style">CSS</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleToggleWafBypass}
                  className={wafBypassEnabled ? "border-security-accent text-security-accent" : ""}
                >
                  WAF Bypass: {wafBypassEnabled ? "ON" : "OFF"}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateRandom}
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Random
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {payloads.map(payload => (
                <Card 
                  key={payload.id} 
                  className={`cursor-pointer transition-all border-2 overflow-hidden ${
                    currentPayload?.id === payload.id ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => handleSelectPayload(payload)}
                >
                  <CardContent className="p-2 text-xs font-mono break-all">
                    <div className="flex justify-between items-center mb-1">
                      <Badge variant="outline" className="text-[10px] px-1">
                        {payload.category}
                      </Badge>
                    </div>
                    <div className="bg-muted p-1 rounded max-h-12 overflow-hidden">
                      {payload.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {currentPayload && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{currentPayload.name}</h4>
                    <p className="text-xs text-muted-foreground">{currentPayload.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyPayload(currentPayload.value)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                
                <div className="bg-secondary p-2 rounded">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">{currentPayload.value}</pre>
                </div>
                
                {wafBypassEnabled && wafBypassPayloads.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">WAF Bypass Variants</h4>
                    <div className="space-y-1">
                      {wafBypassPayloads.map((payload, index) => (
                        <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded">
                          <pre className="text-xs font-mono flex-1 whitespace-pre-wrap break-all">{payload}</pre>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyPayload(payload)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">Custom Payload</label>
              <div className="flex gap-2">
                <Textarea 
                  className="font-mono text-sm flex-1"
                  placeholder="Enter custom XSS payload..."
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  rows={4}
                />
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleCopyPayload(customPayload)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {wafBypassEnabled && customPayload && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm flex items-center justify-between">
                  <span>WAF Bypass Variants</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setWafBypassPayloads(applyWafBypass(customPayload))}
                  >
                    <RefreshCcw className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                </h4>
                
                <div className="space-y-1">
                  {applyWafBypass(customPayload).map((payload, index) => (
                    <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded">
                      <pre className="text-xs font-mono flex-1 whitespace-pre-wrap break-all">{payload}</pre>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyPayload(payload)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PayloadGenerator;
