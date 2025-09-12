import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function EnvCheck() {
  const getEnvVar = (key: string) => {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
      }
      if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
      }
      return undefined;
    } catch (error) {
      return `Error: ${error}`;
    }
  };

  const envVars = [
    { 
      key: 'VITE_API_BASE_URL', 
      value: getEnvVar('VITE_API_BASE_URL'),
      expected: 'https://api.gifthuette.de'
    },
    { 
      key: 'VITE_GIFTHUETTE_SERVER_TOKEN', 
      value: getEnvVar('VITE_GIFTHUETTE_SERVER_TOKEN'),
      expected: 'gifthuette_frontend_...'
    },
    { 
      key: 'VITE_DEBUG', 
      value: getEnvVar('VITE_DEBUG'),
      expected: 'true'
    },
    { 
      key: 'VITE_NODE_ENV', 
      value: getEnvVar('VITE_NODE_ENV'),
      expected: 'development'
    }
  ];

  const getStatus = (value: any, expected: string) => {
    if (!value) return 'missing';
    if (expected.includes('...') && typeof value === 'string' && value.startsWith(expected.split('...')[0])) {
      return 'valid';
    }
    if (value === expected) return 'valid';
    return 'invalid';
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'missing': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'valid': return 'default';
      case 'invalid': return 'secondary';
      case 'missing': return 'destructive';
      default: return 'destructive';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Environment Variables Check
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {envVars.map((env) => {
            const status = getStatus(env.value, env.expected);
            return (
              <div key={env.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getIcon(status)}
                  <div>
                    <div className="font-medium">{env.key}</div>
                    <div className="text-sm text-muted-foreground">
                      Expected: {env.expected}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getBadgeVariant(status)}>
                    {status}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                    {env.value ? 
                      (env.key.includes('TOKEN') ? 
                        `${String(env.value).substring(0, 25)}...` : 
                        String(env.value)
                      ) : 
                      'undefined'
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <div className="text-sm space-y-1">
            <div>import.meta available: {typeof import.meta !== 'undefined' ? 'Yes' : 'No'}</div>
            <div>import.meta.env available: {typeof import.meta !== 'undefined' && import.meta.env ? 'Yes' : 'No'}</div>
            <div>process available: {typeof process !== 'undefined' ? 'Yes' : 'No'}</div>
            <div>process.env available: {typeof process !== 'undefined' && process.env ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}