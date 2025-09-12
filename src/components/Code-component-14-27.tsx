import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  response?: any;
  error?: string;
  duration?: number;
  headers?: Record<string, string>;
  strategy?: 'fetch' | 'xhr' | 'alternative-api';
}

export function ApiDebugEnhanced() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  const API_BASE = 'https://api.gifthuette.de';

  const testEndpoints = [
    { endpoint: '/health', method: 'GET', requiresAuth: false },
    { endpoint: '/categories', method: 'GET', requiresAuth: false },
    { endpoint: '/drinks', method: 'GET', requiresAuth: false },
    { endpoint: '/highlights', method: 'GET', requiresAuth: false },
    { endpoint: '/locations/current', method: 'GET', requiresAuth: false },
    { endpoint: '/social/instagram', method: 'GET', requiresAuth: false },
    { endpoint: '/auth/me', method: 'GET', requiresAuth: true },
  ];

  const getAuthHeaders = () => {
    let token = localStorage.getItem('gifthütte_token');
    
    if (!token) {
      try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
          token = import.meta.env.VITE_JWT_TOKEN;
        }
      } catch (error) {
        console.warn('Error accessing environment variables:', error);
      }
    }
    
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Standard Fetch Strategy
  const testWithFetch = async (endpoint: string, method: string, requiresAuth: boolean): Promise<TestResult> => {
    const startTime = Date.now();
    const fullUrl = `${API_BASE}${endpoint}`;
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(requiresAuth ? getAuthHeaders() : {})
      };

      const response = await fetch(fullUrl, {
        method,
        headers,
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache',
      });

      const duration = Date.now() - startTime;
      let responseData;
      
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      if (!response.ok) {
        return {
          endpoint,
          method,
          status: 'error',
          statusCode: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
          response: responseData,
          duration,
          strategy: 'fetch'
        };
      }

      return {
        endpoint,
        method,
        status: 'success',
        statusCode: response.status,
        response: responseData,
        duration,
        strategy: 'fetch',
        headers: Object.fromEntries([...response.headers.entries()]),
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        endpoint,
        method,
        status: 'error',
        error: `Fetch Error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration,
        strategy: 'fetch'
      };
    }
  };

  // XMLHttpRequest Strategy
  const testWithXHR = async (endpoint: string, method: string, requiresAuth: boolean): Promise<TestResult> => {
    const startTime = Date.now();
    const fullUrl = `${API_BASE}${endpoint}`;
    
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open(method, fullUrl, true);
      xhr.setRequestHeader('Accept', 'application/json');
      
      if (method !== 'GET') {
        xhr.setRequestHeader('Content-Type', 'application/json');
      }
      
      if (requiresAuth) {
        const authHeaders = getAuthHeaders();
        Object.entries(authHeaders).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value as string);
        });
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          const duration = Date.now() - startTime;
          
          if (xhr.status >= 200 && xhr.status < 300) {
            let response: any;
            try {
              response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            } catch {
              response = xhr.responseText;
            }
            
            resolve({
              endpoint,
              method,
              status: 'success',
              statusCode: xhr.status,
              response,
              duration,
              strategy: 'xhr'
            });
          } else {
            resolve({
              endpoint,
              method,
              status: 'error',
              statusCode: xhr.status,
              error: `XHR ${xhr.status}: ${xhr.statusText || 'Request failed'}`,
              duration,
              strategy: 'xhr'
            });
          }
        }
      };

      xhr.onerror = () => {
        const duration = Date.now() - startTime;
        resolve({
          endpoint,
          method,
          status: 'error',
          error: 'XHR Network Error',
          duration,
          strategy: 'xhr'
        });
      };

      xhr.ontimeout = () => {
        const duration = Date.now() - startTime;
        resolve({
          endpoint,
          method,
          status: 'error',
          error: 'XHR Timeout (10s)',
          duration,
          strategy: 'xhr'
        });
      };

      xhr.timeout = 10000;
      xhr.send();
    });
  };

  // Multi-Strategy Test
  const testEndpoint = async (endpoint: string, method: string, requiresAuth: boolean): Promise<TestResult> => {
    // Try Fetch first
    const fetchResult = await testWithFetch(endpoint, method, requiresAuth);
    
    if (fetchResult.status === 'success') {
      return fetchResult;
    }
    
    console.warn(`Fetch failed for ${endpoint}, trying XHR...`);
    
    // If fetch fails, try XHR
    const xhrResult = await testWithXHR(endpoint, method, requiresAuth);
    
    if (xhrResult.status === 'success') {
      return { ...xhrResult, error: `Fetch failed, XHR succeeded: ${fetchResult.error}` };
    }
    
    // Return the fetch result with additional XHR error info
    return {
      ...fetchResult,
      error: `Both methods failed - Fetch: ${fetchResult.error} | XHR: ${xhrResult.error}`
    };
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    // Initialize with pending results
    const pendingResults = testEndpoints.map(({ endpoint, method }) => ({
      endpoint,
      method,
      status: 'pending' as const,
    }));
    setResults(pendingResults);

    // Run tests sequentially to avoid overwhelming the server
    for (let i = 0; i < testEndpoints.length; i++) {
      const { endpoint, method, requiresAuth } = testEndpoints[i];
      
      try {
        const result = await testEndpoint(endpoint, method, requiresAuth);
        
        setResults(prev => prev.map(r => 
          r.endpoint === endpoint && r.method === method ? result : r
        ));
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.endpoint === endpoint && r.method === method 
            ? {
                ...r,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Test failed',
              }
            : r
        ));
      }
    }
    
    setIsRunning(false);
  };

  const runSingleTest = async (endpoint: string, method: string, requiresAuth: boolean) => {
    const result = await testEndpoint(endpoint, method, requiresAuth);
    setResults(prev => {
      const newResults = prev.filter(r => !(r.endpoint === endpoint && r.method === method));
      return [...newResults, result];
    });
  };

  const toggleDetails = (endpoint: string) => {
    setShowDetails(prev => ({
      ...prev,
      [endpoint]: !prev[endpoint]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStrategyIcon = (strategy?: string) => {
    switch (strategy) {
      case 'fetch': return <Globe className="h-3 w-3" />;
      case 'xhr': return <Zap className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background mystical-atmosphere p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <Card className="mystical-card">
          <CardHeader>
            <CardTitle className="mystical-text flex items-center gap-2">
              🧪 Enhanced API Debug Laboratory
            </CardTitle>
            <p className="text-muted-foreground">
              Multi-strategy API testing with Fetch and XHR fallbacks
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="mystical-glow"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setResults([])}
                disabled={isRunning}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Results
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {testEndpoints.map(({ endpoint, method, requiresAuth }) => {
                const result = results.find(r => r.endpoint === endpoint && r.method === method);
                
                return (
                  <Card key={`${method}-${endpoint}`} className="mystical-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={method === 'GET' ? 'secondary' : 'default'}>
                            {method}
                          </Badge>
                          {result?.strategy && getStrategyIcon(result.strategy)}
                        </div>
                        <Badge className={getStatusColor(result?.status || 'pending')}>
                          {result?.status || 'pending'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm font-mono mb-2">{endpoint}</div>
                      
                      {requiresAuth && (
                        <Badge variant="outline" className="text-xs mb-2">
                          🔐 Auth Required
                        </Badge>
                      )}
                      
                      {result && result.status !== 'pending' && (
                        <div className="text-xs text-muted-foreground mb-2">
                          {result.duration}ms {result.statusCode && `• ${result.statusCode}`}
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSingleTest(endpoint, method, requiresAuth)}
                        disabled={isRunning}
                        className="w-full"
                      >
                        Test This Endpoint
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card className="mystical-card">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-card/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{result.method}</Badge>
                          <span className="font-mono text-sm">{result.endpoint}</span>
                          {result.strategy && (
                            <Badge variant="secondary" className="text-xs">
                              {result.strategy}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                          
                          {result.status !== 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDetails(result.endpoint)}
                            >
                              {showDetails[result.endpoint] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {result.error && (
                        <div className="text-sm text-red-400 mb-2">
                          {result.error}
                        </div>
                      )}
                      
                      {result.duration && (
                        <div className="text-xs text-muted-foreground mb-2">
                          Duration: {result.duration}ms
                          {result.statusCode && ` • Status: ${result.statusCode}`}
                        </div>
                      )}
                      
                      {showDetails[result.endpoint] && result.response && (
                        <div className="mt-3">
                          <Separator className="my-2" />
                          <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-48">
                            <pre>{JSON.stringify(result.response, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Debug Info:</strong></p>
          <p>API Base URL: {API_BASE}</p>
          <p>Auth Token: {getAuthHeaders().Authorization ? '✅ Available' : '❌ Missing'}</p>
          <p>Environment: {typeof import.meta !== 'undefined' ? 'Vite' : 'Other'}</p>
          <p>Local Storage Token: {localStorage.getItem('gifthütte_token') ? '✅' : '❌'}</p>
          <p>Env Token: {import.meta?.env?.VITE_JWT_TOKEN ? '✅' : '❌'}</p>
          <p>Strategy: Fetch first, XHR fallback, detailed error reporting</p>
        </div>
      </motion.div>
    </div>
  );
}