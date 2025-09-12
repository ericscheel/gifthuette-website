import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Globe, Zap } from 'lucide-react';

interface CorsTestResult {
  method: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

export function CorsTest() {
  const [results, setResults] = useState<CorsTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const API_BASE = 'https://api.gifthuette.de';
  const token = localStorage.getItem('gifthütte_token') || import.meta?.env?.VITE_JWT_TOKEN;

  const corsTests = [
    {
      name: 'Simple CORS Check',
      test: async (): Promise<CorsTestResult> => {
        try {
          const response = await fetch(`${API_BASE}/health`, {
            method: 'GET',
            mode: 'cors',
          });
          
          return {
            method: 'Simple CORS',
            status: 'success',
            message: `✅ CORS allowed - Status: ${response.status}`,
            details: {
              status: response.status,
              headers: Object.fromEntries([...response.headers.entries()])
            }
          };
        } catch (error) {
          return {
            method: 'Simple CORS',
            status: 'error',
            message: `❌ CORS blocked: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error: error instanceof Error ? error.stack : error }
          };
        }
      }
    },
    {
      name: 'No-CORS Mode',
      test: async (): Promise<CorsTestResult> => {
        try {
          const response = await fetch(`${API_BASE}/health`, {
            method: 'GET',
            mode: 'no-cors',
          });
          
          return {
            method: 'No-CORS Mode',
            status: 'success',
            message: `✅ No-CORS request completed - Type: ${response.type}`,
            details: {
              type: response.type,
              status: response.status // Will be 0 in no-cors mode
            }
          };
        } catch (error) {
          return {
            method: 'No-CORS Mode',
            status: 'error',
            message: `❌ No-CORS failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error: error instanceof Error ? error.stack : error }
          };
        }
      }
    },
    {
      name: 'XMLHttpRequest Test',
      test: async (): Promise<CorsTestResult> => {
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          
          xhr.open('GET', `${API_BASE}/health`, true);
          xhr.setRequestHeader('Accept', 'application/json');
          
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }

          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve({
                  method: 'XMLHttpRequest',
                  status: 'success',
                  message: `✅ XHR succeeded - Status: ${xhr.status}`,
                  details: {
                    status: xhr.status,
                    response: xhr.responseText,
                    readyState: xhr.readyState
                  }
                });
              } else {
                resolve({
                  method: 'XMLHttpRequest',
                  status: 'error',
                  message: `❌ XHR failed - Status: ${xhr.status}`,
                  details: {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    response: xhr.responseText
                  }
                });
              }
            }
          };

          xhr.onerror = () => {
            resolve({
              method: 'XMLHttpRequest',
              status: 'error',
              message: '❌ XHR network error',
              details: { error: 'Network error' }
            });
          };

          xhr.ontimeout = () => {
            resolve({
              method: 'XMLHttpRequest',
              status: 'error',
              message: '❌ XHR timeout',
              details: { error: 'Timeout after 5s' }
            });
          };

          xhr.timeout = 5000;
          xhr.send();
        });
      }
    },
    {
      name: 'Preflight Options Check',
      test: async (): Promise<CorsTestResult> => {
        try {
          const response = await fetch(`${API_BASE}/health`, {
            method: 'OPTIONS',
            mode: 'cors',
            headers: {
              'Access-Control-Request-Method': 'GET',
              'Access-Control-Request-Headers': 'authorization,content-type'
            }
          });
          
          const corsHeaders = {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
            'access-control-allow-credentials': response.headers.get('access-control-allow-credentials')
          };
          
          return {
            method: 'Preflight Check',
            status: 'success',
            message: `✅ Preflight response - Status: ${response.status}`,
            details: {
              status: response.status,
              corsHeaders,
              allHeaders: Object.fromEntries([...response.headers.entries()])
            }
          };
        } catch (error) {
          return {
            method: 'Preflight Check',
            status: 'error',
            message: `❌ Preflight failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error: error instanceof Error ? error.stack : error }
          };
        }
      }
    },
    {
      name: 'Browser Capability Check',
      test: async (): Promise<CorsTestResult> => {
        const capabilities = {
          fetch: typeof fetch !== 'undefined',
          xhr: typeof XMLHttpRequest !== 'undefined',
          cors: 'cors' in new Request(''),
          credentials: 'credentials' in new Request(''),
          mode: 'mode' in new Request(''),
          cache: 'cache' in new Request(''),
          localStorage: typeof localStorage !== 'undefined',
          importMeta: typeof import.meta !== 'undefined',
          viteEnv: typeof import.meta !== 'undefined' && !!import.meta.env,
          hasToken: !!token,
          tokenLength: token?.length || 0
        };
        
        return {
          method: 'Browser Capabilities',
          status: 'success',
          message: '✅ Browser capability check completed',
          details: capabilities
        };
      }
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    for (const testCase of corsTests) {
      setResults(prev => [...prev, {
        method: testCase.name,
        status: 'pending',
        message: 'Running...'
      }]);
      
      try {
        const result = await testCase.test();
        setResults(prev => prev.map(r => 
          r.method === testCase.name ? result : r
        ));
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.method === testCase.name ? {
            method: testCase.name,
            status: 'error',
            message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error }
          } : r
        ));
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />;
    }
  };

  return (
    <div className="min-h-screen bg-background mystical-atmosphere p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="mystical-card">
          <CardHeader>
            <CardTitle className="mystical-text flex items-center gap-2">
              🌐 CORS & Network Diagnostics
            </CardTitle>
            <p className="text-muted-foreground">
              Comprehensive CORS, network connectivity, and browser capability testing
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="mystical-glow"
              >
                {isRunning ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Run All CORS Tests
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index} className="mystical-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.method}</span>
                      </div>
                      <Badge className={
                        result.status === 'success' ? 'bg-green-500 text-white' :
                        result.status === 'error' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-black'
                      }>
                        {result.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm mb-2">{result.message}</div>
                    
                    {result.details && (
                      <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-32">
                        <pre>{JSON.stringify(result.details, null, 2)}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {results.length === 0 && (
              <Card className="mystical-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready for CORS Testing</h3>
                  <p className="text-muted-foreground text-center">
                    Click "Run All CORS Tests" to diagnose network and CORS issues
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>CORS Test Info:</strong></p>
          <p>Target API: {API_BASE}</p>
          <p>Token Available: {token ? '✅ Yes' : '❌ No'}</p>
          <p>Browser: {navigator.userAgent}</p>
          <p>Current Origin: {window.location.origin}</p>
        </div>
      </div>
    </div>
  );
}