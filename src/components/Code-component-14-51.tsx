import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { AlertCircle, CheckCircle, Cloud, Globe, Shield, Zap, Eye, Bot } from 'lucide-react';

interface CloudflareTestResult {
  testName: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  cloudflareHeaders?: Record<string, string>;
  rayId?: string;
  country?: string;
  duration?: number;
}

export function CloudflareDebug() {
  const [results, setResults] = useState<CloudflareTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const API_BASE = 'https://api.gifthuette.de';
  const token = localStorage.getItem('gifthütte_token') || import.meta?.env?.VITE_JWT_TOKEN;

  const cloudflareTests = [
    {
      name: 'Cloudflare Detection',
      description: 'Detect if API is behind Cloudflare',
      test: async (): Promise<CloudflareTestResult> => {
        try {
          const response = await fetch(`${API_BASE}/health`, {
            method: 'OPTIONS',
            mode: 'cors',
          });

          const cfHeaders: Record<string, string> = {};
          const allHeaders: Record<string, string> = {};
          
          response.headers.forEach((value, key) => {
            allHeaders[key] = value;
            if (key.toLowerCase().startsWith('cf-') || 
                key.toLowerCase().includes('cloudflare') ||
                key.toLowerCase() === 'server' && value.includes('cloudflare')) {
              cfHeaders[key] = value;
            }
          });

          const isCloudflare = 
            response.headers.get('server')?.includes('cloudflare') ||
            response.headers.get('cf-ray') ||
            Object.keys(cfHeaders).length > 0;

          return {
            testName: 'Cloudflare Detection',
            status: isCloudflare ? 'warning' : 'success',
            message: isCloudflare ? 
              '⚠️ API is behind Cloudflare - may cause CORS issues' : 
              '✅ No Cloudflare detected',
            details: {
              isCloudflare,
              cloudflareHeaders: cfHeaders,
              allHeaders,
              server: response.headers.get('server')
            },
            cloudflareHeaders: cfHeaders,
            rayId: response.headers.get('cf-ray') || undefined,
            country: response.headers.get('cf-ipcountry') || undefined
          };
        } catch (error) {
          return {
            testName: 'Cloudflare Detection',
            status: 'error',
            message: `❌ Detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error }
          };
        }
      }
    },
    {
      name: 'Bot Protection Bypass',
      description: 'Test with different User-Agents to bypass bot protection',
      test: async (): Promise<CloudflareTestResult> => {
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (compatible; API-Client/1.0)',
          'curl/7.68.0',
          'PostmanRuntime/7.26.8'
        ];

        const results: any[] = [];

        for (const userAgent of userAgents) {
          try {
            const response = await fetch(`${API_BASE}/health`, {
              method: 'GET',
              headers: {
                'User-Agent': userAgent,
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
              },
              mode: 'cors',
            });

            results.push({
              userAgent: userAgent.substring(0, 50) + '...',
              status: response.status,
              success: response.ok,
              rayId: response.headers.get('cf-ray'),
              server: response.headers.get('server')
            });

            if (response.ok) {
              return {
                testName: 'Bot Protection Bypass',
                status: 'success',
                message: `✅ Bypassed with User-Agent: ${userAgent.substring(0, 30)}...`,
                details: { workingUserAgent: userAgent, results },
                rayId: response.headers.get('cf-ray') || undefined
              };
            }
          } catch (error) {
            results.push({
              userAgent: userAgent.substring(0, 50) + '...',
              error: error instanceof Error ? error.message : 'Unknown error',
              success: false
            });
          }
        }

        return {
          testName: 'Bot Protection Bypass',
          status: 'error',
          message: '❌ All User-Agents blocked',
          details: { results }
        };
      }
    },
    {
      name: 'CORS Preflight Analysis',
      description: 'Analyze CORS preflight response in detail',
      test: async (): Promise<CloudflareTestResult> => {
        try {
          const response = await fetch(`${API_BASE}/health`, {
            method: 'OPTIONS',
            headers: {
              'Access-Control-Request-Method': 'GET',
              'Access-Control-Request-Headers': 'authorization,content-type,accept',
              'Origin': window.location.origin
            },
            mode: 'cors',
          });

          const corsHeaders = {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
            'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
            'access-control-max-age': response.headers.get('access-control-max-age')
          };

          const hasValidCors = 
            corsHeaders['access-control-allow-origin'] === '*' ||
            corsHeaders['access-control-allow-origin'] === window.location.origin;

          return {
            testName: 'CORS Preflight Analysis',
            status: hasValidCors ? 'success' : 'error',
            message: hasValidCors ? 
              '✅ CORS properly configured' : 
              '❌ CORS configuration issues detected',
            details: {
              corsHeaders,
              currentOrigin: window.location.origin,
              hasValidCors,
              status: response.status
            },
            rayId: response.headers.get('cf-ray') || undefined
          };
        } catch (error) {
          return {
            testName: 'CORS Preflight Analysis',
            status: 'error',
            message: `❌ Preflight failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error }
          };
        }
      }
    },
    {
      name: 'Cloudflare WAF Bypass',
      description: 'Test different request patterns to bypass WAF',
      test: async (): Promise<CloudflareTestResult> => {
        const testPatterns = [
          // Standard request
          {
            name: 'Standard',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          },
          // Minimal headers
          {
            name: 'Minimal',
            headers: {
              'Accept': '*/*'
            }
          },
          // Browser-like headers
          {
            name: 'Browser-like',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'DNT': '1',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1'
            }
          },
          // API client headers
          {
            name: 'API Client',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              'X-API-Version': '1.0'
            }
          }
        ];

        const results: any[] = [];

        for (const pattern of testPatterns) {
          try {
            const response = await fetch(`${API_BASE}/health`, {
              method: 'GET',
              headers: pattern.headers,
              mode: 'cors',
            });

            const result = {
              pattern: pattern.name,
              status: response.status,
              success: response.ok,
              rayId: response.headers.get('cf-ray'),
              contentType: response.headers.get('content-type')
            };

            results.push(result);

            if (response.ok) {
              return {
                testName: 'Cloudflare WAF Bypass',
                status: 'success',
                message: `✅ WAF bypassed with ${pattern.name} headers`,
                details: { workingPattern: pattern, results },
                rayId: response.headers.get('cf-ray') || undefined
              };
            }
          } catch (error) {
            results.push({
              pattern: pattern.name,
              error: error instanceof Error ? error.message : 'Unknown error',
              success: false
            });
          }
        }

        return {
          testName: 'Cloudflare WAF Bypass',
          status: 'error',  
          message: '❌ All request patterns blocked by WAF',
          details: { results }
        };
      }
    },
    {
      name: 'Rate Limit Detection',
      description: 'Check for Cloudflare rate limiting',
      test: async (): Promise<CloudflareTestResult> => {
        const startTime = Date.now();
        const requests = [];

        // Send multiple rapid requests
        for (let i = 0; i < 5; i++) {
          try {
            const response = await fetch(`${API_BASE}/health?test=${i}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
              },
              mode: 'cors',
            });

            requests.push({
              requestNumber: i + 1,
              status: response.status,
              success: response.ok,
              rayId: response.headers.get('cf-ray'),
              rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
              rateLimitReset: response.headers.get('x-ratelimit-reset')
            });

            // Check for rate limit status codes
            if (response.status === 429 || response.status === 503) {
              return {
                testName: 'Rate Limit Detection',
                status: 'warning',
                message: `⚠️ Rate limited after ${i + 1} requests`,
                details: { requests, rateLimited: true },
                duration: Date.now() - startTime
              };
            }
          } catch (error) {
            requests.push({
              requestNumber: i + 1,
              error: error instanceof Error ? error.message : 'Unknown error',
              success: false
            });
          }

          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const duration = Date.now() - startTime;
        const successfulRequests = requests.filter(r => r.success).length;

        return {
          testName: 'Rate Limit Detection',
          status: successfulRequests > 0 ? 'success' : 'error',
          message: successfulRequests > 0 ? 
            `✅ No rate limiting detected (${successfulRequests}/5 successful)` :
            '❌ All requests failed',
          details: { requests, successfulRequests, totalRequests: 5 },
          duration
        };
      }
    },
    {
      name: 'Direct IP Test',
      description: 'Test if direct IP access bypasses Cloudflare',
      test: async (): Promise<CloudflareTestResult> => {
        // Note: This is just a demonstration - we can't easily get the real IP
        try {
          // Try to resolve the IP (this won't work in browser, but shows the concept)
          const response = await fetch(`${API_BASE}/health`, {
            method: 'GET',
            headers: {
              'Host': 'api.gifthuette.de', // Preserve host header
              'Accept': 'application/json'
            },
            mode: 'cors',
          });

          const cfRay = response.headers.get('cf-ray');
          const server = response.headers.get('server');

          return {
            testName: 'Direct IP Test',
            status: 'warning',
            message: '⚠️ Direct IP bypass not possible from browser',
            details: {
              note: 'Direct IP testing requires server-side implementation',
              currentResponse: {
                status: response.status,
                cfRay,
                server,
                stillThroughCloudflare: !!cfRay
              }
            },
            rayId: cfRay || undefined
          };
        } catch (error) {
          return {
            testName: 'Direct IP Test',
            status: 'error',
            message: `❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error }
          };
        }
      }
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const testCase of cloudflareTests) {
      // Add pending result
      setResults(prev => [...prev, {
        testName: testCase.name,
        status: 'pending',
        message: 'Running...'
      }]);

      try {
        const startTime = Date.now();
        const result = await testCase.test();
        const duration = Date.now() - startTime;

        setResults(prev => prev.map(r => 
          r.testName === testCase.name ? { ...result, duration } : r
        ));
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.testName === testCase.name ? {
            testName: testCase.name,
            status: 'error',
            message: `Test crashed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error }
          } : r
        ));
      }

      // Delay between tests to avoid triggering rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
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
              ☁️ Cloudflare Debug Laboratory
            </CardTitle>
            <p className="text-muted-foreground">
              Specialized diagnostics for Cloudflare-protected APIs
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
                    Running Cloudflare Tests...
                  </>
                ) : (
                  <>
                    <Cloud className="mr-2 h-4 w-4" />
                    Run All Cloudflare Tests
                  </>
                )}
              </Button>
            </div>

            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="results">Test Results</TabsTrigger>
                <TabsTrigger value="solutions">Solutions</TabsTrigger>
                <TabsTrigger value="info">Cloudflare Info</TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4">
                {results.length === 0 ? (
                  <Card className="mystical-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Cloud className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Ready for Cloudflare Diagnostics</h3>
                      <p className="text-muted-foreground text-center">
                        Click "Run All Cloudflare Tests" to analyze potential Cloudflare issues
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
                                <span className="font-medium">{result.testName}</span>
                                {result.rayId && (
                                  <Badge variant="outline" className="text-xs">
                                    Ray: {result.rayId}
                                  </Badge>
                                )}
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
                            
                            {result.details && (
                              <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-32">
                                <pre>{JSON.stringify(result.details, null, 2)}</pre>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="solutions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="mystical-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        CORS Fixes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>• <strong>Server-side:</strong> Add proper CORS headers</p>
                      <p>• <strong>Cloudflare:</strong> Enable CORS in Page Rules</p>
                      <p>• <strong>Alternative:</strong> Use proxy/JSONP</p>
                      <p>• <strong>Headers needed:</strong></p>
                      <div className="bg-muted p-2 rounded font-mono text-xs">
                        Access-Control-Allow-Origin: *<br/>
                        Access-Control-Allow-Methods: GET,POST,PUT,DELETE<br/>
                        Access-Control-Allow-Headers: Authorization,Content-Type
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mystical-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Bot Protection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>• <strong>Whitelist Origin:</strong> Add domain to whitelist</p>
                      <p>• <strong>Lower Security:</strong> Set to "Medium" or "Low"</p>
                      <p>• <strong>User-Agent:</strong> Use browser-like UA strings</p>
                      <p>• <strong>Rate Limiting:</strong> Implement request delays</p>
                    </CardContent>
                  </Card>

                  <Card className="mystical-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        WAF Bypass
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>• <strong>Firewall Rules:</strong> Whitelist your domain</p>
                      <p>• <strong>Custom Rules:</strong> Allow API endpoints</p>
                      <p>• <strong>IP Whitelist:</strong> Add server/client IPs</p>
                      <p>• <strong>Page Rules:</strong> Disable WAF for /api/*</p>
                    </CardContent>
                  </Card>

                  <Card className="mystical-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Network Solutions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>• <strong>Subdomain:</strong> Use api.domain.com</p>
                      <p>• <strong>Direct IP:</strong> Bypass Cloudflare entirely</p>
                      <p>• <strong>Proxy Server:</strong> Custom CORS proxy</p>
                      <p>• <strong>Different Port:</strong> Use non-standard ports</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="info" className="space-y-4">
                <Card className="mystical-card">
                  <CardHeader>
                    <CardTitle>Cloudflare & API Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Common Cloudflare Problems:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>CORS headers stripped or modified</li>
                        <li>Bot protection blocking legitimate requests</li>
                        <li>WAF rules blocking API calls</li>
                        <li>Rate limiting triggering too aggressively</li>
                        <li>SSL/TLS handshake issues</li>
                        <li>Geographic restrictions</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Cloudflare Headers to Check:</h4>
                      <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                        <div>cf-ray: Request ID for debugging</div>
                        <div>cf-ipcountry: Detected country</div>
                        <div>cf-visitor: Visitor info</div>
                        <div>server: cloudflare</div>
                        <div>cf-cache-status: Cache status</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Status Codes:</h4>
                      <div className="space-y-1 text-muted-foreground">
                        <div><span className="font-mono">403</span> - WAF/Bot protection block</div>
                        <div><span className="font-mono">429</span> - Rate limiting</div>
                        <div><span className="font-mono">503</span> - Service unavailable</div>
                        <div><span className="font-mono">520-527</span> - Cloudflare-specific errors</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Cloudflare Debug Info:</strong></p>
          <p>Target API: {API_BASE}</p>
          <p>Current Origin: {window.location.origin}</p>
          <p>Has Token: {token ? '✅' : '❌'}</p>
          <p>Browser: {navigator.userAgent.split(' ')[0]}</p>
        </div>
      </div>
    </div>
  );
}