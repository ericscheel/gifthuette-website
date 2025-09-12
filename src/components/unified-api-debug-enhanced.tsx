import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { AlertCircle, CheckCircle, Zap, RefreshCw, Activity, Settings } from 'lucide-react';
import { api } from '../services/api';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  strategy?: 'standard';
  duration?: number;
  data?: any;
}

export function UnifiedApiDebugEnhanced() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    {
      name: 'Health Check',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          const result = await api.healthCheck();
          return {
            name: 'Health Check',
            status: 'success',
            message: '✅ API is healthy',
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: result
          };
        } catch (error: any) {
          return {
            name: 'Health Check',
            status: 'error',
            message: `❌ ${error.message}`,
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: null
          };
        }
      }
    },
    {
      name: 'Server Status',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          const result = await api.getServerStatus();
          return {
            name: 'Server Status',
            status: 'success',
            message: '✅ Server status retrieved',
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: result
          };
        } catch (error: any) {
          return {
            name: 'Server Status',
            status: 'error',
            message: `❌ ${error.message}`,
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: null
          };
        }
      }
    },
    {
      name: 'Get Categories',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          const result = await api.getCategories();
          return {
            name: 'Get Categories',
            status: 'success',
            message: `✅ Got ${Array.isArray(result) ? result.length : 0} categories`,
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: result
          };
        } catch (error: any) {
          return {
            name: 'Get Categories',
            status: 'error',
            message: `❌ ${error.message}`,
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: null
          };
        }
      }
    },
    {
      name: 'Get Drinks (Enhanced)',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          const result = await api.getDrinksEnhanced({ page: 1, pageSize: 5 });
          return {
            name: 'Get Drinks (Enhanced)',
            status: 'success',
            message: `✅ Got ${Array.isArray(result) ? result.length : 0} enhanced drinks`,
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: result
          };
        } catch (error: any) {
          return {
            name: 'Get Drinks (Enhanced)',
            status: 'error',
            message: `❌ ${error.message}`,
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: null
          };
        }
      }
    },
    {
      name: 'Newsletter Subscribe',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          const testEmail = `test-${Date.now()}@example.com`;
          const result = await api.subscribeNewsletter(testEmail);
          return {
            name: 'Newsletter Subscribe',
            status: 'success',
            message: '✅ Newsletter subscription test successful',
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: result
          };
        } catch (error: any) {
          return {
            name: 'Newsletter Subscribe',
            status: 'error',
            message: `❌ ${error.message}`,
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: null
          };
        }
      }
    },
    {
      name: 'Instagram Feed',
      test: async (): Promise<TestResult> => {
        const startTime = Date.now();
        try {
          const result = await api.getInstagramFeed();
          return {
            name: 'Instagram Feed',
            status: 'success',
            message: `✅ Got ${Array.isArray(result) ? result.length : 0} Instagram posts`,
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: result
          };
        } catch (error: any) {
          return {
            name: 'Instagram Feed',
            status: 'error',
            message: `❌ ${error.message}`,
            strategy: 'standard',
            duration: Date.now() - startTime,
            data: null
          };
        }
      }
    }
  ];

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

  return (
    <div className="min-h-screen bg-background mystical-atmosphere p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="mystical-card">
          <CardHeader>
            <CardTitle className="mystical-text flex items-center gap-2">
              ⚡ Enhanced API Debug Center
            </CardTitle>
            <p className="text-muted-foreground">
              Advanced API testing with full feature coverage
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="mystical-glow"
              >
                {isRunning ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Running Enhanced Tests...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Run All Enhanced Tests
                  </>
                )}
              </Button>

              <Button 
                onClick={() => setResults([])} 
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Results
              </Button>
            </div>

            {results.length === 0 ? (
              <Card className="mystical-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Enhanced API Testing</h3>
                  <p className="text-muted-foreground text-center">
                    Click "Run All Enhanced Tests" to test advanced API features
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
                            {result.duration && (
                              <Badge variant="outline" className="text-xs">
                                {result.duration}ms
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm mb-2">{result.message}</div>
                        
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}