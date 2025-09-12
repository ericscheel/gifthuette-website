import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Eye,
  EyeOff,
  RefreshCw
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
}

export function ApiDebug() {
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
    // Try localStorage first, then environment variables
    let token = localStorage.getItem('gifthütte_token');
    
    if (!token) {
      // Try different environment variable access methods
      try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
          token = import.meta.env.VITE_JWT_TOKEN;
        } else if (typeof process !== 'undefined' && process.env) {
          token = process.env.VITE_JWT_TOKEN;
        }
      } catch (error) {
        console.warn('Error accessing environment variables:', error);
      }
    }
    
    console.log('🔐 Token Debug:', {
      hasLocalStorage: !!localStorage.getItem('gifthütte_token'),
      hasEnvToken: !!token,
      tokenStart: token ? token.substring(0, 10) + '...' : 'none',
      envCheck: typeof import.meta !== 'undefined' ? 'vite' : 'other'
    });
    
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const testSingleEndpoint = async (endpoint: string, method: string, requiresAuth: boolean): Promise<TestResult> => {
    const startTime = Date.now();
    const fullUrl = `${API_BASE}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(requiresAuth ? getAuthHeaders() : {})
    };

    try {
      console.log(`🔄 Testing: ${method} ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method,
        headers,
        mode: 'cors', // Explicit CORS mode
      });

      const duration = Date.now() - startTime;
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        endpoint,
        method,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        response: responseData,
        duration,
        headers: responseHeaders,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Error testing ${fullUrl}:`, error);
      
      return {
        endpoint,
        method,
        status: 'error',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: null
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    // Initialize results with pending status
    const initialResults = testEndpoints.map(({ endpoint, method }) => ({
      endpoint,
      method,
      status: 'pending' as const
    }));
    setResults(initialResults);

    // Run tests sequentially to avoid overwhelming the server
    for (let i = 0; i < testEndpoints.length; i++) {
      const { endpoint, method, requiresAuth } = testEndpoints[i];
      
      const result = await testSingleEndpoint(endpoint, method, requiresAuth);
      
      setResults(prev => prev.map((r, index) => 
        index === i ? result : r
      ));
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
  };

  const toggleDetails = (endpoint: string) => {
    setShowDetails(prev => ({
      ...prev,
      [endpoint]: !prev[endpoint]
    }));
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mystical-text">API Debug Tool</h1>
            <p className="text-muted-foreground">Teste alle API-Endpunkte von {API_BASE}</p>
          </div>
          
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-primary hover:bg-primary/90"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Alle Tests starten
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <Card className="mystical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Test Ergebnisse
                <Badge variant="outline" className="ml-auto">
                  {results.filter(r => r.status === 'success').length} / {results.length} erfolgreich
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <motion.div
                      key={`${result.endpoint}-${result.method}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="font-medium">
                              <Badge variant="outline" className="mr-2 font-mono text-xs">
                                {result.method}
                              </Badge>
                              {result.endpoint}
                            </div>
                            {result.duration && (
                              <div className="text-sm text-muted-foreground">
                                {result.duration}ms
                                {result.statusCode && ` • ${result.statusCode}`}
                              </div>
                            )}
                          </div>
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
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}

                      {showDetails[result.endpoint] && result.status !== 'pending' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 space-y-3"
                        >
                          <Separator />
                          
                          {result.headers && Object.keys(result.headers).length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Response Headers:</h4>
                              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                                {JSON.stringify(result.headers, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {result.response && (
                            <div>
                              <h4 className="font-medium mb-2">Response Data:</h4>
                              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
                                {typeof result.response === 'string' 
                                  ? result.response 
                                  : JSON.stringify(result.response, null, 2)
                                }
                              </pre>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {results.length === 0 && (
          <Card className="mystical-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Play className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Bereit zum Testen</h3>
              <p className="text-muted-foreground text-center mb-4">
                Klicke auf "Alle Tests starten" um alle API-Endpunkte zu testen
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Debug Info:</strong></p>
          <p>API Base URL: {API_BASE}</p>
          <p>Auth Token: {getAuthHeaders().Authorization ? '✅ Vorhanden' : '❌ Nicht vorhanden'}</p>
          <p>Environment: {typeof import.meta !== 'undefined' ? 'Vite' : 'Other'}</p>
          <p>Local Storage Token: {localStorage.getItem('gifthütte_token') ? '✅' : '❌'}</p>
          <p>Env Token: {import.meta?.env?.VITE_JWT_TOKEN ? '✅' : '❌'}</p>
        </div>
      </motion.div>
    </div>
  );
}