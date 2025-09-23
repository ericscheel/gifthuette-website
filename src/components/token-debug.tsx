import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function TokenDebug() {
  const runTokenTest = () => {
    console.log('🔐 Token Debug Test:');
    
    // Test 1: Direkte import.meta.env Abfrage
    console.log('1. Direct import.meta.env access:');
    console.log('   import.meta:', typeof import.meta);
    console.log('   import.meta.env:', import.meta?.env);
    console.log('   VITE_JWT_TOKEN:', import.meta?.env?.VITE_JWT_TOKEN);
    
    // Test 2: Process.env
    console.log('2. Process.env access:');
    console.log('   process:', typeof process);
    console.log('   process.env:', typeof process !== 'undefined' ? process.env : 'undefined');
    
    // Test 3: Alle Vite Env Variablen
    console.log('3. All Vite env vars:');
    if (import.meta?.env) {
      Object.keys(import.meta.env).forEach(key => {
        if (key.startsWith('VITE_')) {
          console.log(`   ${key}:`, import.meta.env[key]);
        }
      });
    }
    
    // Test 4: localStorage
    console.log('4. localStorage:');
    console.log('   gifthütte_token:', localStorage.getItem('gifthütte_token'));
    
    // Test 5: Manually set token for testing
    const testToken = 'TTbTXQbkwMzUt8GVwHnuGhARRcB9rqr8GEog2lesqbYPZwStKxzv0miZ3qLODMR/';
    localStorage.setItem('gifthütte_token', testToken);
    console.log('5. Set test token in localStorage');
    console.log('   New value:', localStorage.getItem('gifthütte_token'));
  };

  const clearToken = () => {
    localStorage.removeItem('gifthütte_token');
    console.log('🧹 Token cleared from localStorage');
  };

  return (
    <Card className="max-w-2xl mx-auto m-6">
      <CardHeader>
        <CardTitle>🔐 Token Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Environment Variables</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>import.meta.env:</span>
                <Badge variant={import.meta?.env ? 'default' : 'destructive'}>
                  {import.meta?.env ? 'Available' : 'Missing'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>VITE_JWT_TOKEN:</span>
                <Badge variant={import.meta?.env?.VITE_JWT_TOKEN ? 'default' : 'destructive'}>
                  {import.meta?.env?.VITE_JWT_TOKEN ? 'Present' : 'Missing'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Length:</span>
                <span className="font-mono text-xs">
                  {import.meta?.env?.VITE_JWT_TOKEN?.length || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">localStorage</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>gifthütte_token:</span>
                <Badge variant={localStorage.getItem('gifthütte_token') ? 'default' : 'destructive'}>
                  {localStorage.getItem('gifthütte_token') ? 'Present' : 'Missing'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Length:</span>
                <span className="font-mono text-xs">
                  {localStorage.getItem('gifthütte_token')?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Token Values (First 20 chars)</h3>
          <div className="bg-muted p-2 rounded text-xs font-mono space-y-1">
            <div>Env Token: {import.meta?.env?.VITE_JWT_TOKEN?.substring(0, 20) || 'None'}...</div>
            <div>LocalStorage: {localStorage.getItem('gifthütte_token')?.substring(0, 20) || 'None'}...</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={runTokenTest}>
            Run Full Debug Test
          </Button>
          <Button variant="outline" onClick={clearToken}>
            Clear localStorage Token
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const token = 'TTbTXQbkwMzUt8GVwHnuGhARRcB9rqr8GEog2lesqbYPZwStKxzv0miZ3qLODMR/';
              localStorage.setItem('gifthütte_token', token);
              window.location.reload();
            }}
          >
            Set Test Token & Reload
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Check the browser console for detailed output after clicking "Run Full Debug Test"
        </div>
      </CardContent>
    </Card>
  );
}