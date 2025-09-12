import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Key, Lock, CheckCircle, AlertCircle, X } from 'lucide-react';

interface CertificateInfo {
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  fingerprint: string;
  protocol: string;
  cipher: string;
}

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  certificateInfo?: CertificateInfo;
  responseTime?: number;
  timestamp: string;
}

export const CertificateDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const endpoints = [
    'https://api.gifthuette.de/health',
    'https://api.gifthuette.de/api/drinks',
    'https://gifthuette.de',
    'https://www.gifthuette.de'
  ];

  const testCertificate = async (endpoint: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Gifthuette-Debug/1.0'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Try to extract certificate information from response headers
      const securityHeaders = {
        'strict-transport-security': response.headers.get('strict-transport-security'),
        'x-frame-options': response.headers.get('x-frame-options'),
        'x-content-type-options': response.headers.get('x-content-type-options'),
        'cf-ray': response.headers.get('cf-ray'),
        'cf-cache-status': response.headers.get('cf-cache-status'),
        'server': response.headers.get('server')
      };

      return {
        endpoint,
        status: 'success',
        message: `✅ Status: ${response.status} ${response.statusText}`,
        responseTime,
        timestamp: new Date().toISOString(),
        certificateInfo: {
          issuer: securityHeaders.server || 'Unknown',
          subject: endpoint,
          validFrom: 'Not available via fetch',
          validTo: 'Not available via fetch',
          fingerprint: securityHeaders['cf-ray'] || 'Unknown',
          protocol: 'TLS (details not available)',
          cipher: 'Not available via fetch'
        }
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        endpoint,
        status: 'error',
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime,
        timestamp: new Date().toISOString()
      };
    }
  };

  const runCertificateTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    for (const endpoint of endpoints) {
      const result = await testCertificate(endpoint);
      setTestResults(prev => [...prev, result]);
    }

    setIsLoading(false);
  };

  const getCertificateAdvice = () => {
    const errorCount = testResults.filter(r => r.status === 'error').length;
    const successCount = testResults.filter(r => r.status === 'success').length;

    if (errorCount > successCount) {
      return {
        type: 'error',
        title: 'Zertifikat-Probleme erkannt',
        message: 'Mehrere Endpoints sind nicht erreichbar. Ein Origin Server Certificate könnte helfen.',
        recommendations: [
          'Origin Server Certificate in Cloudflare erstellen',
          'SSL/TLS Mode auf "Full (strict)" setzen',
          'CORS-Headers am Origin Server prüfen',
          'mTLS für zusätzliche Sicherheit erwägen'
        ]
      };
    } else if (successCount > 0) {
      return {
        type: 'success',
        title: 'Grundlegende Verbindung funktioniert',
        message: 'Die meisten Endpoints sind erreichbar. Für bessere Sicherheit können Sie zusätzliche Zertifikate einrichten.',
        recommendations: [
          'Client Certificate für API-Authentifizierung',
          'Origin Server Certificate für Ende-zu-Ende-Verschlüsselung',
          'WAF-Regeln für zusätzlichen Schutz'
        ]
      };
    } else {
      return {
        type: 'warning',
        title: 'Keine Tests durchgeführt',
        message: 'Führen Sie die Tests aus, um Zertifikat-Empfehlungen zu erhalten.',
        recommendations: []
      };
    }
  };

  const advice = getCertificateAdvice();

  return (
    <div className="min-h-screen bg-background text-foreground mystical-atmosphere">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mystical-card mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle className="mystical-text">Zertifikat & SSL Debug</CardTitle>
              </div>
              <CardDescription>
                Analysiert SSL-Zertifikate und Verbindungssicherheit für Cloudflare-Integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Button 
                  onClick={runCertificateTests}
                  disabled={isLoading}
                  className="mystical-glow"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full w-4 h-4 border-b-2 border-primary mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Zertifikate testen
                    </>
                  )}
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Test Results */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Test Ergebnisse
                </h3>
                
                {testResults.length === 0 && !isLoading && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Keine Tests durchgeführt. Klicken Sie auf "Zertifikate testen" um zu beginnen.
                    </AlertDescription>
                  </Alert>
                )}

                {testResults.map((result, index) => (
                  <Card key={index} className="mystical-card">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                          <code className="text-sm">{result.endpoint}</code>
                        </div>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                      
                      {result.responseTime && (
                        <p className="text-xs text-muted-foreground">
                          Response Time: {result.responseTime}ms
                        </p>
                      )}
                      
                      {result.certificateInfo && (
                        <div className="mt-3 p-3 bg-muted/20 rounded-md">
                          <h4 className="font-medium mb-2">Certificate Info:</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Issuer: {result.certificateInfo.issuer}</div>
                            <div>Subject: {result.certificateInfo.subject}</div>
                            <div>Protocol: {result.certificateInfo.protocol}</div>
                            <div>Fingerprint: {result.certificateInfo.fingerprint}</div>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(result.timestamp).toLocaleString('de-DE')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Recommendations */}
              <Alert className={advice.type === 'error' ? 'border-destructive' : advice.type === 'success' ? 'border-primary' : ''}>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <h4 className="font-medium mb-2">{advice.title}</h4>
                    <p className="mb-3">{advice.message}</p>
                    
                    {advice.recommendations.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-1">Empfehlungen:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {advice.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <Separator className="my-6" />

              {/* Cloudflare Certificate Guide */}
              <Card className="mystical-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Cloudflare Zertifikat Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">1. Origin Server Certificate</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>Cloudflare Dashboard → SSL/TLS → Origin Server</li>
                      <li>Create Certificate → Private key type: RSA (2048)</li>
                      <li>Hostnames: *.gifthuette.de, gifthuette.de</li>
                      <li>Certificate Validity: 15 years</li>
                      <li>Installieren Sie das Zertifikat auf Ihrem Origin Server</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">2. Client Certificate (Optional)</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>Cloudflare Dashboard → SSL/TLS → Client Certificates</li>
                      <li>Create Client Certificate</li>
                      <li>Configure mTLS für API-Endpoints</li>
                      <li>Integration in Frontend-API-Calls</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3. SSL/TLS Settings</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>SSL/TLS encryption mode: Full (strict)</li>
                      <li>Edge Certificates: Aktiviert</li>
                      <li>Always Use HTTPS: Ein</li>
                      <li>Minimum TLS Version: 1.2</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};