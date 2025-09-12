import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Activity, 
  Shield, 
  Key, 
  Zap, 
  Globe, 
  Settings, 
  Bug,
  Server,
  Cloud,
  Lock
} from 'lucide-react';

interface DebugTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
  category: 'API' | 'Security' | 'Network' | 'General';
  status: 'Verfügbar' | 'Neu' | 'Beta';
}

interface DebugOverviewProps {
  setCurrentPage: (page: string) => void;
}

export const DebugOverview: React.FC<DebugOverviewProps> = ({ setCurrentPage }) => {
  const debugTools: DebugTool[] = [
    {
      id: 'unified-api-enhanced',
      title: 'Enhanced API Debug Center',
      description: 'Erweiterte API-Tests mit Zertifikat-Support und intelligenten Fallback-Strategien',
      icon: <Zap className="h-5 w-5" />,
      priority: 'Hoch',
      category: 'API',
      status: 'Neu'
    },
    {
      id: 'cloudflare-cert-guide',
      title: 'Cloudflare Zertifikat Guide',
      description: 'Detaillierte Anleitung zur Einrichtung von SSL/TLS-Zertifikaten',
      icon: <Shield className="h-5 w-5" />,
      priority: 'Hoch',
      category: 'Security',
      status: 'Neu'
    },
    {
      id: 'certificate-debug',
      title: 'Certificate Debug Tool',
      description: 'Analysiert SSL-Zertifikate und Verbindungssicherheit',
      icon: <Key className="h-5 w-5" />,
      priority: 'Hoch',
      category: 'Security',
      status: 'Neu'
    },
    {
      id: 'unified-api-debug',
      title: 'Unified API Debug',
      description: 'Intelligent API testing mit automatischen Fallback-Strategien',
      icon: <Activity className="h-5 w-5" />,
      priority: 'Mittel',
      category: 'API',
      status: 'Verfügbar'
    },
    {
      id: 'cloudflare-debug',
      title: 'Cloudflare Debug Tool',
      description: 'Spezielle Tests für Cloudflare-Proxy-Probleme',
      icon: <Cloud className="h-5 w-5" />,
      priority: 'Mittel',
      category: 'Network',
      status: 'Verfügbar'
    },
    {
      id: 'api-quick-test',
      title: 'API Quick Test',
      description: 'Schnelle API-Verbindungstests mit verschiedenen Strategien',
      icon: <Zap className="h-5 w-5" />,
      priority: 'Mittel',
      category: 'API',
      status: 'Verfügbar'
    },
    {
      id: 'cors-test',
      title: 'CORS Test Tool',
      description: 'Tests für Cross-Origin Resource Sharing Probleme',
      icon: <Globe className="h-5 w-5" />,
      priority: 'Niedrig',
      category: 'Network',
      status: 'Verfügbar'
    },
    {
      id: 'token-debug',
      title: 'Token Debug Tool',
      description: 'Analyse und Verwaltung von Authentifizierungs-Tokens',
      icon: <Lock className="h-5 w-5" />,
      priority: 'Niedrig',
      category: 'Security',
      status: 'Verfügbar'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-500 text-white';
      case 'Mittel': return 'bg-yellow-500 text-white';
      case 'Niedrig': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'API': return 'bg-blue-500 text-white';
      case 'Security': return 'bg-purple-500 text-white';
      case 'Network': return 'bg-orange-500 text-white';
      case 'General': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Neu': return 'bg-green-100 text-green-800 border-green-200';
      case 'Beta': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Verfügbar': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupedTools = debugTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, DebugTool[]>);

  return (
    <div className="min-h-screen bg-background text-foreground mystical-atmosphere">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mystical-card mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bug className="h-6 w-6 text-primary" />
                <CardTitle className="mystical-text">Debug Tools Übersicht</CardTitle>
              </div>
              <CardDescription>
                Alle verfügbaren Debug- und Analyse-Tools für die Gifthütte API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card className="mystical-card bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <h3 className="font-medium text-red-700">Hohe Priorität</h3>
                    <p className="text-sm text-muted-foreground">
                      {debugTools.filter(t => t.priority === 'Hoch').length} Tools
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="mystical-card bg-yellow-500/10 border-yellow-500/20">
                  <CardContent className="p-4 text-center">
                    <Activity className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-medium text-yellow-700">Mittlere Priorität</h3>
                    <p className="text-sm text-muted-foreground">
                      {debugTools.filter(t => t.priority === 'Mittel').length} Tools
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="mystical-card bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-medium text-green-700">Niedrige Priorität</h3>
                    <p className="text-sm text-muted-foreground">
                      {debugTools.filter(t => t.priority === 'Niedrig').length} Tools
                    </p>
                  </CardContent>
                </Card>
              </div>

              {Object.entries(groupedTools).map(([category, tools]) => (
                <div key={category} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={getCategoryColor(category)}>
                      {category}
                    </Badge>
                    <h2 className="text-xl font-medium">{category} Tools</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {tools.map((tool) => (
                      <Card key={tool.id} className="mystical-card hover:border-primary/50 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {tool.icon}
                              <CardTitle className="text-lg">{tool.title}</CardTitle>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(tool.priority)} variant="outline">
                                {tool.priority}
                              </Badge>
                              <Badge className={getStatusColor(tool.status)} variant="outline">
                                {tool.status}
                              </Badge>
                            </div>
                          </div>
                          <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button 
                            onClick={() => setCurrentPage(tool.id)}
                            className="w-full mystical-glow"
                            variant={tool.priority === 'Hoch' ? 'default' : 'outline'}
                          >
                            Tool öffnen
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

              <Card className="mystical-card bg-primary/5 border-primary/20 mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Empfohlenes Vorgehen für Zertifikat-Probleme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500 text-white">1</Badge>
                      <span>Cloudflare Zertifikat Guide befolgen → Origin Server Certificate erstellen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500 text-white">2</Badge>
                      <span>Certificate Debug Tool verwenden → SSL-Status prüfen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500 text-white">3</Badge>
                      <span>Enhanced API Debug Center → Umfassende Tests durchführen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500 text-white">4</Badge>
                      <span>Optional: Client Certificate für mTLS einrichten</span>
                    </div>
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