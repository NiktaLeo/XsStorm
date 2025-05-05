
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert, AlertCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">XSS Pro Scanner</h1>
            <Badge variant="outline" className="ml-2">BETA</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 flex items-center">
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs">Professional Edition</span>
            </Badge>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="rounded-lg border border-dashed border-security-warning p-4 bg-security-warning/10 mb-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-security-warning shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-security-warning">Warning: Authorized Use Only</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              This tool should only be used on websites you own or have explicit permission to test. 
              Unauthorized scanning may be illegal in your jurisdiction.
            </p>
          </div>
        </div>

        <Dashboard />
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <div className="container flex justify-between items-center text-sm text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} XSS Pro Scanner
          </div>
          <div className="text-xs">
            Built for security professionals and penetration testers
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
