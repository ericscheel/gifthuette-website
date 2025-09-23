import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Settings, Eye, EyeOff } from 'lucide-react';

export function EnvDebug() {
  const [showToken, setShowToken] = React.useState(false);
  
  const getEnvVar = (key: string, defaultValue: string = '') => {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key] || defaultValue;
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const env = {
    API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://api.gifthuette.de'),
    SERVER_TOKEN: getEnvVar('VITE_GIFTHUETTE_SERVER_TOKEN', ''),
    NODE_ENV: getEnvVar('VITE_NODE_ENV', 'development'),
    DEBUG: getEnvVar('VITE_DEBUG', 'false')
  };

  return (
    <Card className="mystical-card wood-texture border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings className="h-4 w-4 text-primary" />
          Environment Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">API Base URL:</span>
            <Badge variant="outline" className="text-xs">
              {env.API_BASE_URL}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Node Environment:</span>
            <Badge variant={env.NODE_ENV === 'production' ? 'default' : 'secondary'} className="text-xs">
              {env.NODE_ENV}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Debug Mode:</span>
            <Badge variant={env.DEBUG === 'true' ? 'default' : 'secondary'} className="text-xs">
              {env.DEBUG === 'true' ? 'ON' : 'OFF'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Server Token:</span>
            <div className="flex items-center gap-2">
              <Badge variant={env.SERVER_TOKEN ? 'default' : 'destructive'} className="text-xs">
                {env.SERVER_TOKEN ? 'Available' : 'Missing'}
              </Badge>
              {env.SERVER_TOKEN && (
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              )}
            </div>
          </div>
          
          {showToken && env.SERVER_TOKEN && (
            <div className="col-span-full">
              <div className="text-muted-foreground text-xs mb-1">Server Token Value:</div>
              <div className="bg-secondary/50 p-2 rounded text-xs break-all font-mono">
                {env.SERVER_TOKEN.substring(0, 25)}...{env.SERVER_TOKEN.substring(env.SERVER_TOKEN.length - 10)}
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-primary/20 pt-2">
          <div className="text-xs text-muted-foreground">
            🧪 Gifthütte Development Environment
          </div>
        </div>
      </CardContent>
    </Card>
  );
}