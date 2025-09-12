import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { AlertCircle, CheckCircle, Zap, RefreshCw, Settings, Activity } from 'lucide-react';
import { unifiedApi } from '../services/unified-api';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  strategy?: 'standard' | 'cloudflare';
  cfRay?: string;
  retryCount?: number;
  duration?: number;
  data?: any;
}

export function UnifiedApiDebug() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState(unifiedApi.getStatus());

  const tests = [
    {
      name: 'Health Check',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        const result = await unifiedApi.smartRequest('/health');
        return {
          name: 'Health Check',
          status: result.success ? 'success' : 'error',
          message: result.success ? '✅ API is healthy' : `❌ ${result.error}`,
          strategy: result.strategy,
          cfRay: result.cfRay,
          retryCount: result.retryCount,
          duration: Date.now() - startTime,
          data: result.data
        };
      }
    },
    {
      name: 'Get Categories',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        const result = await unifiedApi.getCategories();
        return {
          name: 'Get Categories',
          status: result.success ? 'success' : 'error',
          message: result.success ? 
            `✅ Got ${Array.isArray(result.data) ? result.data.length : 0} categories` : 
            `❌ ${result.error}`,
          strategy: result.strategy,
          cfRay: result.cfRay,
          retryCount: result.retryCount,
          duration: Date.now() - startTime,
          data: result.data
        };
      }
    },
    {
      name: 'Get Drinks',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        const result = await unifiedApi.getDrinks();
        return {
          name: 'Get Drinks',
          status: result.success ? 'success' : 'error',
          message: result.success ? 
            `✅ Got ${Array.isArray(result.data) ? result.data.length : 0} drinks` : 
            `❌ ${result.error}`,
          strategy: result.strategy,
          cfRay: result.cfRay,
          retryCount: result.retryCount,
          duration: Date.now() - startTime,
          data: result.data
        };
      }
    },
    {
      name: 'Get Highlights',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        const result = await unifiedApi.getHighlights();
        return {
          name: 'Get Highlights',
          status: result.success ? 'success' : 'error',
          message: result.success ? 
            `✅ Got ${Array.isArray(result.data) ? result.data.length : 0} highlights` : 
            `❌ ${result.error}`,
          strategy: result.strategy,
          cfRay: result.cfRay,
          retryCount: result.retryCount,
          duration: Date.now() - startTime,
          data: result.data
        };
      }
    },
    {
      name: 'Get Current Location',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        const result = await unifiedApi.getCurrentLocation();
        return {
          name: 'Get Current Location',
          status: result.success ? 'success' : 'error',
          message: result.success ? 
            '✅ Got current location' : 
            `❌ ${result.error}`,
          strategy: result.strategy,
          cfRay: result.cfRay,
          retryCount: result.retryCount,
          duration: Date.now() - startTime,
          data: result.data
        };
      }
    },
    {
      name: 'Get Instagram Posts',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        const result = await unifiedApi.getInstagramPosts();
        return {
          name: 'Get Instagram Posts',
          status: result.success ? 'success' : 'error',
          message: result.success ? 
            `✅ Got ${Array.isArray(result.data) ? result.data.length : 0} posts` : 
            `❌ ${result.error}`,
          strategy: result.strategy,
          cfRay: result.cfRay,
          retryCount: result.retryCount,
          duration: Date.now() - startTime,
          data: result.data
        };
      }
    }
  ];

  const runHealthCheck = async () => {
    try {
      console.log('🔍 Running comprehensive health check...');
      const health = await unifiedApi.healthCheck();
      setHealthStatus(health);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({
        standard: { success: false, error: 'Health check failed' },
        cloudflare: { success: false, error: 'Health check failed' },
        recommended: 'unknown'
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const testCase of tests) {
      // Add pending result
      setResults(prev => [...prev, {
        name: testCase.name,
        status: 'pending',
        message: 'Running...'
      }]);

      try {
        const result = await testCase.test();
        setResults(prev => prev.map(r => 
          r.name === testCase.name ? result : r
        ));
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.name === testCase.name ? {
            name: testCase.name,
            status: 'error',
            message: `Test crashed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      default: return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStrategyColor = (strategy?: string) => {
    switch (strategy) {
      case 'standard': return 'bg-blue-500 text-white';
      case 'cloudflare': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background mystical-atmosphere p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="mystical-card">
          <CardHeader>
            <CardTitle className="mystical-text flex items-center gap-2">
              ⚡ Unified API Debug Center
            </CardTitle>
            <p className="text-muted-foreground">
              Intelligent API testing with automatic fallback strategies
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button 
                onClick={runHealthCheck} 
                variant="outline"
                className="mystical-glow"
              >
                <Activity className="mr-2 h-4 w-4" />
                Health Check
              </Button>
              
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
                    <Zap className="mr-2 h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>

              <Button 
                onClick={() => {
                  setResults([]);
                  setHealthStatus(null);
                }} 
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Results
              </Button>
            </div>

            <Tabs defaultValue="tests" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tests">Test Results</TabsTrigger>
                <TabsTrigger value="health">Health Status</TabsTrigger>
                <TabsTrigger value="settings">API Settings</TabsTrigger>
                <TabsTrigger value="info">Debug Info</TabsTrigger>
              </TabsList>

              <TabsContent value="tests" className="space-y-4">
                {results.length === 0 ? (
                  <Card className="mystical-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Ready for API Testing</h3>
                      <p className="text-muted-foreground text-center">
                        Click "Run All Tests" to test all API endpoints with intelligent fallback
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {results.map((result, index) => (
                        <Card key={index} className="mystical-card">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result.status)}
                                <span className="font-medium">{result.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(result.status)}>
                                  {result.status}
                                </Badge>
                                {result.strategy && (
                                  <Badge className={getStrategyColor(result.strategy)}>
                                    {result.strategy}
                                  </Badge>
                                )}
                                {result.duration && (
                                  <Badge variant="outline" className="text-xs">
                                    {result.duration}ms
                                  </Badge>
                                )}
                                {result.retryCount !== undefined && (
                                  <Badge variant="outline" className="text-xs">
                                    Retries: {result.retryCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-sm mb-2">{result.message}</div>
                            
                            {result.cfRay && (
                              <div className="text-xs text-muted-foreground mb-2">
                                Cloudflare Ray ID: {result.cfRay}
                              </div>
                            )}
                            
                            {result.data && (
                              <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-32">
                                <pre>{JSON.stringify(result.data, null, 2)}</pre>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="health" className="space-y-4">
                {healthStatus ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="mystical-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            🔧 Standard API
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(healthStatus.standard.success ? 'success' : 'error')}
                            <Badge className={getStatusColor(healthStatus.standard.success ? 'success' : 'error')}>
                              {healthStatus.standard.success ? 'Working' : 'Failed'}
                            </Badge>
                          </div>
                          {healthStatus.standard.error && (
                            <p className="text-sm text-red-400">{healthStatus.standard.error}</p>
                          )}
                          {healthStatus.standard.data && (
                            <div className="bg-muted p-2 rounded text-xs font-mono mt-2">
                              <pre>{JSON.stringify(healthStatus.standard.data, null, 2)}</pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="mystical-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            ☁️ Cloudflare API
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(healthStatus.cloudflare.success ? 'success' : 'error')}
                            <Badge className={getStatusColor(healthStatus.cloudflare.success ? 'success' : 'error')}>
                              {healthStatus.cloudflare.success ? 'Working' : 'Failed'}
                            </Badge>
                            {healthStatus.cloudflare.cfRay && (
                              <Badge variant="outline" className="text-xs">
                                {healthStatus.cloudflare.cfRay}
                              </Badge>
                            )}
                          </div>
                          {healthStatus.cloudflare.error && (
                            <p className="text-sm text-red-400">{healthStatus.cloudflare.error}</p>
                          )}
                          {healthStatus.cloudflare.data && (
                            <div className="bg-muted p-2 rounded text-xs font-mono mt-2">
                              <pre>{JSON.stringify(healthStatus.cloudflare.data, null, 2)}</pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="mystical-card">
                      <CardHeader>
                        <CardTitle>📊 Recommendation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <span>Recommended API strategy:</span>
                          <Badge className={getStrategyColor(healthStatus.recommended)}>
                            {healthStatus.recommended}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="mystical-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Health Check Data</h3>
                      <p className="text-muted-foreground text-center">
                        Click "Health Check" to test both API strategies
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="mystical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      API Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Prefer Cloudflare API</h4>
                        <p className="text-sm text-muted-foreground">
                          Try Cloudflare-optimized API first instead of standard API
                        </p>
                      </div>
                      <Switch
                        checked={apiStatus.preferCloudflareApi}
                        onCheckedChange={(checked) => {
                          unifiedApi.setPreferCloudflare(checked);
                          setApiStatus(unifiedApi.getStatus());
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Enable Fallback</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically try alternative API if primary fails
                        </p>
                      </div>
                      <Switch
                        checked={apiStatus.fallbackToCloudflare}
                        onCheckedChange={(checked) => {
                          unifiedApi.setFallbackEnabled(checked);
                          setApiStatus(unifiedApi.getStatus());
                        }}
                      />
                    </div>

                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium mb-2">Current Settings</h4>
                      <div className="text-sm space-y-1">
                        <div>Prefer Cloudflare: {apiStatus.preferCloudflareApi ? 'Yes' : 'No'}</div>
                        <div>Fallback Enabled: {apiStatus.fallbackToCloudflare ? 'Yes' : 'No'}</div>
                        <div>Max Retries: {apiStatus.maxRetries}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="space-y-4">
                <Card className="mystical-card">
                  <CardHeader>
                    <CardTitle>🔍 Debug Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Environment</h4>
                      <div className="bg-muted p-3 rounded font-mono text-xs">
                        <div>Current Origin: {window.location.origin}</div>
                        <div>API Base URL: https://api.gifthuette.de</div>
                        <div>Has Token: {localStorage.getItem('gifthütte_token') ? '✅' : '❌'}</div>
                        <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">API Strategy Flow</h4>
                      <div className="space-y-2 text-xs">
                        <div>1. Check API preference setting</div>
                        <div>2. Try preferred API strategy first</div>
                        <div>3. If failed and fallback enabled, try alternative</div>
                        <div>4. Return best available result with metadata</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Error Handling</h4>
                      <div className="space-y-1 text-xs">
                        <div>• CORS errors → Auto-switch to Cloudflare</div>
                        <div>• Network errors → Multi-strategy retry</div>
                        <div>• Bot protection → User-agent rotation</div>
                        <div>• Rate limiting → Automatic delays</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}