import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner@2.0.3';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  data?: any;
  error?: string;
  duration?: number;
}

export function ApiTest() {
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testEndpoints = [
    { name: 'Health Check', test: () => api.healthCheck() },
    { name: 'Server Status', test: () => api.getServerStatus() },
    { name: 'Categories', test: () => api.getCategories() },
    { name: 'Highlights', test: () => api.getHighlights() },
    { name: 'Current Location', test: () => api.getCurrentLocation() },
    { name: 'All Locations', test: () => api.getLocations() },
    { name: 'Upcoming Locations', test: () => api.getUpcomingLocations() },
    { name: 'All Drinks', test: () => api.getAllDrinks() },
    { name: 'Drinks (paginated)', test: () => api.getDrinks({ page: 1, pageSize: 5 }) }
  ];

  const runSingleTest = async (endpoint: { name: string; test: () => Promise<any> }) => {
    const startTime = Date.now();
    
    setResults(prev => [
      ...prev.filter(r => r.endpoint !== endpoint.name),
      { endpoint: endpoint.name, status: 'pending' }
    ]);

    try {
      const data = await endpoint.test();
      const duration = Date.now() - startTime;
      
      setResults(prev => [
        ...prev.filter(r => r.endpoint !== endpoint.name),
        { 
          endpoint: endpoint.name, 
          status: 'success', 
          data, 
          duration 
        }
      ]);
      
      toast.success(`${endpoint.name}: Test erfolgreich (${duration}ms)`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      setResults(prev => [
        ...prev.filter(r => r.endpoint !== endpoint.name),
        { 
          endpoint: endpoint.name, 
          status: 'error', 
          error: error.message,
          duration 
        }
      ]);
      
      toast.error(`${endpoint.name}: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsTestingAll(true);
    setResults([]);
    
    for (const endpoint of testEndpoints) {
      await runSingleTest(endpoint);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsTestingAll(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variant = status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary';
    const label = status === 'success' ? 'OK' : status === 'error' ? 'Fehler' : 'Test läuft...';
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  return (
    <Card className="mystical-card wood-texture border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-primary" />
          API Endpunkt Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={runAllTests} 
            disabled={isTestingAll}
            size="sm"
            className="mystical-glow"
          >
            {isTestingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Teste alle...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Alle Tests ausführen
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => setResults([])} 
            variant="outline" 
            size="sm"
          >
            Ergebnisse löschen
          </Button>
        </div>

        <div className="space-y-2">
          {testEndpoints.map((endpoint) => {
            const result = results.find(r => r.endpoint === endpoint.name);
            
            return (
              <div key={endpoint.name} className="flex items-center justify-between p-2 bg-secondary/20 rounded border border-primary/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{endpoint.name}</span>
                  {result?.duration && (
                    <span className="text-xs text-muted-foreground">({result.duration}ms)</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {result ? (
                    getStatusBadge(result.status)
                  ) : (
                    <Button 
                      onClick={() => runSingleTest(endpoint)}
                      size="sm"
                      variant="outline"
                    >
                      Test
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {results.some(r => r.error) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-400">Fehlerdetails:</h4>
            {results
              .filter(r => r.error)
              .map((result, index) => (
                <div key={index} className="text-xs bg-red-900/20 p-2 rounded border border-red-500/20">
                  <strong>{result.endpoint}:</strong> {result.error}
                </div>
              ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t border-primary/20">
          <div>API Base URL: {(() => {
            try {
              return import.meta.env?.VITE_API_BASE_URL || 'https://api.gifthuette.de';
            } catch {
              return 'https://api.gifthuette.de';
            }
          })()}</div>
          <div>JWT Token: {(() => {
            try {
              return import.meta.env?.VITE_JWT_TOKEN ? '✓ Konfiguriert' : '✗ Nicht konfiguriert';
            } catch {
              return '✗ Nicht konfiguriert';
            }
          })()}</div>
        </div>
      </CardContent>
    </Card>
  );
}