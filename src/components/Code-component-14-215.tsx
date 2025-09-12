import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Copy, Shield, Key, Server, Globe, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const CloudflareCertificateGuide: React.FC = () => {
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} kopiert!`);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const certificationSteps = [
    {
      title: "Origin Server Certificate",
      priority: "Hoch",
      description: "Verschlüsselt die Verbindung zwischen Cloudflare und Ihrem Backend",
      color: "bg-green-500 text-white",
      steps: [
        "Cloudflare Dashboard → SSL/TLS → Origin Server",
        "Create Certificate klicken",
        "Private key type: RSA (2048) wählen",
        "Hostnames: *.gifthuette.de, gifthuette.de eingeben",
        "Certificate Validity: 15 years wählen",
        "Create klicken und Zertifikat + Private Key kopieren",
        "Zertifikat auf Ihrem Origin Server installieren"
      ]
    },
    {
      title: "Client Certificate",
      priority: "Mittel",
      description: "Authentifiziert API-Clients gegenüber Cloudflare",
      color: "bg-blue-500 text-white",
      steps: [
        "Cloudflare Dashboard → SSL/TLS → Client Certificates",
        "Create Client Certificate klicken",
        "Certificate Validity: 1 year (oder länger)",
        "Private key type: RSA (2048)",
        "Certificate Name: 'Gifthuette API Client'",
        "Create klicken und herunterladen",
        "Zertifikat in der Frontend-Anwendung konfigurieren"
      ]
    },
    {
      title: "Mutual TLS (mTLS)",
      priority: "Niedrig",
      description: "Bidirektionale Authentifizierung für höchste Sicherheit",
      color: "bg-purple-500 text-white",
      steps: [
        "Client Certificate erstellen (siehe oben)",
        "Cloudflare Dashboard → SSL/TLS → Client Certificates",
        "mTLS Authentication aktivieren",
        "API-Hostname für mTLS konfigurieren",
        "Certificate Authority (CA) hochladen",
        "Client Certificate in Anwendung einbinden"
      ]
    }
  ];

  const sslTlsSettings = {
    encryption: "Full (strict)",
    edgeCertificates: "Aktiviert",
    alwaysUseHttps: "Ein",
    minimumTlsVersion: "1.2",
    hsts: "Aktiviert (max-age=31536000)",
    tlsVersion: "1.3 bevorzugt"
  };

  const originServerCommands = {
    nginx: `# /etc/nginx/sites-available/gifthuette.de
server {
    listen 443 ssl http2;
    server_name api.gifthuette.de;
    
    ssl_certificate /path/to/cloudflare-origin.pem;
    ssl_certificate_key /path/to/cloudflare-origin-key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`,
    apache: `# /etc/apache2/sites-available/gifthuette.conf
<VirtualHost *:443>
    ServerName api.gifthuette.de
    
    SSLEngine on
    SSLCertificateFile /path/to/cloudflare-origin.pem
    SSLCertificateKeyFile /path/to/cloudflare-origin-key.pem
    
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ProxyPreserveHost On
</VirtualHost>`,
    docker: `# docker-compose.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./cloudflare-origin.pem:/etc/ssl/cloudflare-origin.pem
      - ./cloudflare-origin-key.pem:/etc/ssl/cloudflare-origin-key.pem
    depends_on:
      - api
  
  api:
    image: gifthuette/api:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production`
  };

  return (
    <div className="min-h-screen bg-background text-foreground mystical-atmosphere">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mystical-card mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle className="mystical-text">Cloudflare Zertifikat Setup Guide</CardTitle>
              </div>
              <CardDescription>
                Detaillierte Anleitung zur Einrichtung von SSL/TLS-Zertifikaten für die Gifthütte API
              </CardDescription>
            </CardHeader>
            <CardContent>
              
              <Alert className="mb-6 border-primary/20 bg-primary/5">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Wichtig:</strong> Ein Origin Server Certificate ist die wichtigste Maßnahme 
                  zur Behebung der aktuellen API-Probleme. Es stellt eine sichere Ende-zu-Ende-Verschlüsselung 
                  zwischen Cloudflare und Ihrem Backend sicher.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="priority" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="priority">Prioritäten</TabsTrigger>
                  <TabsTrigger value="origin">Origin Certificate</TabsTrigger>
                  <TabsTrigger value="client">Client Certificate</TabsTrigger>
                  <TabsTrigger value="config">Server Config</TabsTrigger>
                </TabsList>

                <TabsContent value="priority" className="space-y-4">
                  <h3 className="text-lg font-medium mb-4">Empfohlene Reihenfolge</h3>
                  
                  {certificationSteps.map((step, index) => (
                    <Card key={index} className="mystical-card">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-xl">{index + 1}.</span>
                            {step.title}
                          </CardTitle>
                          <Badge className={step.color}>
                            Priorität: {step.priority}
                          </Badge>
                        </div>
                        <CardDescription>{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {step.steps.map((substep, subIndex) => (
                            <div key={subIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{substep}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="origin" className="space-y-4">
                  <Card className="mystical-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        Origin Server Certificate
                      </CardTitle>
                      <CardDescription>
                        Schritt-für-Schritt Anleitung zur Erstellung des Origin Server Certificates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Dieses Zertifikat wird <strong>nur</strong> zwischen Cloudflare und Ihrem Origin Server verwendet. 
                          Es ist nicht für direkten Client-Zugriff gedacht.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">1. Cloudflare Dashboard öffnen</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Navigieren Sie zu: SSL/TLS → Origin Server
                          </p>
                          <div className="bg-muted p-3 rounded-md">
                            <code className="text-sm">
                              https://dash.cloudflare.com → gifthuette.de → SSL/TLS → Origin Server
                            </code>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2">2. Zertifikat erstellen</h4>
                          <div className="space-y-2 text-sm">
                            <div>• <strong>Private key type:</strong> RSA (2048)</div>
                            <div>• <strong>Hostnames:</strong> <code>*.gifthuette.de, gifthuette.de</code></div>
                            <div>• <strong>Certificate Validity:</strong> 15 years</div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2">3. Zertifikat herunterladen</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Sie erhalten zwei Dateien:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Certificate (PEM)</Label>
                              <div className="bg-muted p-3 rounded-md font-mono text-xs">
                                -----BEGIN CERTIFICATE-----<br/>
                                MIIEpDCCA4wCAQAwDQYJKoZIhvcNAQEL...<br/>
                                -----END CERTIFICATE-----
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Private Key (PEM)</Label>
                              <div className="bg-muted p-3 rounded-md font-mono text-xs">
                                -----BEGIN PRIVATE KEY-----<br/>
                                MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSj...<br/>
                                -----END PRIVATE KEY-----
                              </div>
                            </div>
                          </div>
                        </div>

                        <Alert className="border-green-500/20 bg-green-500/5">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Tipp:</strong> Speichern Sie die Zertifikatsdateien als 
                            <code className="mx-1">cloudflare-origin.pem</code> und 
                            <code className="mx-1">cloudflare-origin-key.pem</code>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="client" className="space-y-4">
                  <Card className="mystical-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Client Certificate Setup
                      </CardTitle>
                      <CardDescription>
                        Für erweiterte API-Authentifizierung (optional)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Client Certificates sind für mTLS (Mutual TLS) erforderlich und bieten 
                          zusätzliche Sicherheit für API-Calls.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">1. Client Certificate erstellen</h4>
                          <div className="bg-muted p-3 rounded-md">
                            <code className="text-sm">
                              Cloudflare Dashboard → SSL/TLS → Client Certificates → Create Client Certificate
                            </code>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">2. Integration in Frontend</h4>
                          <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-auto">
                            <pre>{`// JavaScript Integration
const clientCertPem = \`-----BEGIN CERTIFICATE-----
MIIEpDCCA4wCAQAwDQYJKoZIhvcNAQEL...
-----END CERTIFICATE-----\`;

const clientKeyPem = \`-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSj...
-----END PRIVATE KEY-----\`;

// In Ihrer Unified API konfigurieren
unifiedApi.configureCertificates({
  clientCert: clientCertPem,
  clientKey: clientKeyPem,
  enableMtls: true
});`}</pre>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => copyToClipboard(`// JavaScript Integration
const clientCertPem = \`-----BEGIN CERTIFICATE-----
MIIEpDCCA4wCAQAwDQYJKoZIhvcNAQEL...
-----END CERTIFICATE-----\`;

const clientKeyPem = \`-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSj...
-----END PRIVATE KEY-----\`;

// In Ihrer Unified API konfigurieren
unifiedApi.configureCertificates({
  clientCert: clientCertPem,
  clientKey: clientKeyPem,
  enableMtls: true
});`, 'Client Certificate Code')}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {copiedText === 'Client Certificate Code' ? 'Kopiert!' : 'Code kopieren'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                  <Card className="mystical-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Server Konfiguration
                      </CardTitle>
                      <CardDescription>
                        Beispielkonfigurationen für verschiedene Web-Server
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="nginx" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="nginx">Nginx</TabsTrigger>
                          <TabsTrigger value="apache">Apache</TabsTrigger>
                          <TabsTrigger value="docker">Docker</TabsTrigger>
                        </TabsList>

                        {Object.entries(originServerCommands).map(([server, config]) => (
                          <TabsContent key={server} value={server}>
                            <div className="space-y-4">
                              <div className="bg-muted p-4 rounded-md font-mono text-xs overflow-auto">
                                <pre>{config}</pre>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => copyToClipboard(config, `${server.charAt(0).toUpperCase() + server.slice(1)} Config`)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                {copiedText === `${server.charAt(0).toUpperCase() + server.slice(1)} Config` ? 'Kopiert!' : 'Konfiguration kopieren'}
                              </Button>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>

                  <Card className="mystical-card">
                    <CardHeader>
                      <CardTitle>SSL/TLS Einstellungen in Cloudflare</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(sslTlsSettings).map(([setting, value]) => (
                          <div key={setting} className="flex justify-between items-center p-3 bg-muted/20 rounded-md">
                            <span className="font-medium capitalize">{setting.replace(/([A-Z])/g, ' $1')}</span>
                            <Badge variant="outline">{value}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};