import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, CheckCircle, Zap, RefreshCw, Settings, Activity, Shield, Key, Upload } from 'lucide-react';
import { unifiedApi } from '../services/unified-api';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  strategy?: 'standard' | 'cloudflare' | 'mtls';
  cfRay?: string;
  retryCount?: number;
  duration?: number;
  data?: any;
}

export const UnifiedApiDebugEnhanced: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [apiSettings, setApiSettings] = useState(() => unifiedApi.getStatus());
  
  // Certificate states
  const [clientCert, setClientCert] = useState('');
  const [clientKey, setClientKey] = useState('');
  const [caCert, setCaCert] = useState('');
  const [mtlsEnabled, setMtlsEnabled] = useState(false);
  const [certTestResult, setCertTestResult] = useState<TestResult | null>(null);

  const testEndpoints = [
    { name: 'Health Check', endpoint: '/health' },
    { name: 'Get Me', endpoint: '/auth/me' },
    { name: 'Categories', endpoint: '/categories' },
    { name: 'Drinks', endpoint: '/drinks' },
    { name: 'Highlights', endpoint: '/highlights' },
    { name: 'Current Location', endpoint: '/locations/current' },
    { name: 'Instagram Posts', endpoint: '/social/instagram' }
  ];

  const runHealthCheck = async () => {
    const result = await unifiedApi.healthCheck();
    setHealthStatus(result);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const test of testEndpoints) {
      const startTime = Date.now();
      
      try {
        const result = await unifiedApi.smartRequest(test.endpoint);
        const duration = Date.now() - startTime;
        
        setResults(prev => [...prev, {
          name: test.name,
          status: result.success ? 'success' : 'error',
          message: result.success ? '✅ Request successful' : `❌ ${result.error}`,
          strategy: result.strategy,
          cfRay: result.cfRay,
          retryCount: result.retryCount,
          duration,
          data: result.data
        }]);
      } catch (error) {
        const duration = Date.now() - startTime;
        
        setResults(prev => [...prev, {
          name: test.name,
          status: 'error',
          message: `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`,
          duration
        }]);
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const testCertificateAuth = async () => {
    setCertTestResult({ name: 'Certificate Test', status: 'pending', message: 'Testing...' });
    
    try {
      const result = await unifiedApi.testCertificateAuth();
      setCertTestResult({
        name: 'Certificate Test',
        status: result.success ? 'success' : 'error',
        message: result.success ? '✅ Certificate authentication successful' : `❌ ${result.error}`,
        strategy: result.strategy,
        data: result.data
      });
    } catch (error) {
      setCertTestResult({
        name: 'Certificate Test',
        status: 'error',
        message: `❌ Certificate test failed: ${error instanceof Error ? error.message : 'Unknown'}`
      });
    }
  };

  const configureCertificates = () => {
    unifiedApi.configureCertificates({
      clientCert,
      clientKey,
      caCert,
      enableMtls: mtlsEnabled
    });
    
    setApiSettings(unifiedApi.getStatus());
  };

  const updateApiSettings = (key: string, value: any) => {
    switch (key) {
      case 'preferCloudflare':
        unifiedApi.setPreferCloudflare(value);
        break;
      case 'fallbackEnabled':
        unifiedApi.setFallbackEnabled(value);
        break;
    }
    setApiSettings(unifiedApi.getStatus());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
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
      case 'mtls': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
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
              Advanced API testing with certificate support and intelligent fallback strategies
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
                  setCertTestResult(null);
                }} 
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Results
              </Button>
            </div>

            <Tabs defaultValue="tests" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="tests">Test Results</TabsTrigger>
                <TabsTrigger value="health">Health Status</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
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
                              {healthStatus.standard.success ? 'Healthy' : 'Error'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {healthStatus.standard.success ? 'API is responding normally' : healthStatus.standard.error}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="mystical-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            🌩️ Cloudflare API
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(healthStatus.cloudflare.success ? 'success' : 'error')}
                            <Badge className={getStatusColor(healthStatus.cloudflare.success ? 'success' : 'error')}>
                              {healthStatus.cloudflare.success ? 'Healthy' : 'Error'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {healthStatus.cloudflare.success ? 'Cloudflare-optimized API is working' : healthStatus.cloudflare.error}
                          </p>
                          {healthStatus.cloudflare.cfRay && (
                            <p className="text-xs text-muted-foreground mt-1">
                              CF-Ray: {healthStatus.cloudflare.cfRay}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="mystical-card">
                      <CardHeader>
                        <CardTitle>🎯 Recommendation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge className={getStrategyColor(healthStatus.recommended)} size="lg">
                          Recommended: {healthStatus.recommended} API
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          The system recommends using the {healthStatus.recommended} API strategy for optimal performance.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="mystical-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Run Health Check</h3>
                      <p className="text-muted-foreground text-center">
                        Click "Health Check" to test both API strategies
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="certificates" className="space-y-4">
                <Card className="mystical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Certificate Configuration
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure client certificates for mTLS authentication
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientCert">Client Certificate (PEM)</Label>
                      <Textarea
                        id="clientCert"
                        placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                        value={clientCert}
                        onChange={(e) => setClientCert(e.target.value)}
                        rows={4}
                        className="font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientKey">Client Private Key (PEM)</Label>
                      <Textarea
                        id="clientKey"
                        placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                        value={clientKey}
                        onChange={(e) => setClientKey(e.target.value)}
                        rows={4}
                        className="font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caCert">CA Certificate (Optional)</Label>
                      <Textarea
                        id="caCert"
                        placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                        value={caCert}
                        onChange={(e) => setCaCert(e.target.value)}
                        rows={3}
                        className="font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mtls"
                        checked={mtlsEnabled}
                        onCheckedChange={setMtlsEnabled}
                      />
                      <Label htmlFor="mtls">Enable mTLS (Mutual TLS)</Label>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        onClick={configureCertificates}
                        className="mystical-glow"
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Configure Certificates
                      </Button>

                      <Button 
                        onClick={testCertificateAuth}
                        variant="outline"
                        disabled={!clientCert}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Test Certificate Auth
                      </Button>
                    </div>

                    {certTestResult && (
                      <Card className="mystical-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(certTestResult.status)}
                            <span className="font-medium">{certTestResult.name}</span>
                            <Badge className={getStatusColor(certTestResult.status)}>
                              {certTestResult.status}
                            </Badge>
                            {certTestResult.strategy && (
                              <Badge className={getStrategyColor(certTestResult.strategy)}>
                                {certTestResult.strategy}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{certTestResult.message}</p>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="mystical-card bg-muted/10">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Current Certificate Status
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div>mTLS Enabled: {apiSettings.mtlsEnabled ? '✅' : '❌'}</div>
                          <div>Client Certificate: {apiSettings.hasCertificates?.clientCert ? '✅' : '❌'}</div>
                          <div>Client Key: {apiSettings.hasCertificates?.clientKey ? '✅' : '❌'}</div>
                          <div>CA Certificate: {apiSettings.hasCertificates?.caCert ? '✅' : '❌'}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="mystical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      API Strategy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="prefer-cloudflare">Prefer Cloudflare API</Label>
                        <p className="text-sm text-muted-foreground">Use Cloudflare-optimized API as first choice</p>
                      </div>
                      <Switch
                        id="prefer-cloudflare"
                        checked={apiSettings.preferCloudflareApi}
                        onCheckedChange={(value) => updateApiSettings('preferCloudflare', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="fallback-enabled">Enable Fallback</Label>
                        <p className="text-sm text-muted-foreground">Automatically try alternative API if primary fails</p>
                      </div>
                      <Switch
                        id="fallback-enabled"
                        checked={apiSettings.fallbackToCloudflare}
                        onCheckedChange={(value) => updateApiSettings('fallbackEnabled', value)}
                      />
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Current Settings</h4>
                      <div className="space-y-1 text-sm">
                        <div>Max Retries: {apiSettings.maxRetries}</div>
                        <div>Prefer Cloudflare: {apiSettings.preferCloudflareApi ? 'Yes' : 'No'}</div>
                        <div>Fallback Enabled: {apiSettings.fallbackToCloudflare ? 'Yes' : 'No'}</div>
                        <div>mTLS Enabled: {apiSettings.mtlsEnabled ? 'Yes' : 'No'}</div>
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
                        <div>1. Check mTLS configuration (if enabled)</div>
                        <div>2. Check API preference setting</div>
                        <div>3. Try preferred API strategy first</div>
                        <div>4. If failed and fallback enabled, try alternative</div>
                        <div>5. Return best available result with metadata</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Error Handling</h4>
                      <div className="space-y-1 text-xs">
                        <div>• CORS errors → Auto-switch to Cloudflare</div>
                        <div>• Network errors → Multi-strategy retry</div>
                        <div>• Certificate errors → Fall back to standard auth</div>
                        <div>• Bot protection → User-agent rotation</div>
                        <div>• Rate limiting → Automatic delays</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Certificate Support</h4>
                      <div className="space-y-1 text-xs">
                        <div>• Client certificates für mTLS</div>
                        <div>• Cloudflare Origin Server certificates</div>
                        <div>• Custom CA certificate validation</div>
                        <div>• Automatic certificate rotation</div>
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
};