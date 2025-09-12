import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { unifiedApi } from '../services/unified-api';

export function ApiQuickTest() {
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testUnifiedApi = async () => {
    setIsRunning(true);
    setResults([]);
    
    addResult('🚀 Starting Unified API Test...');

    try {
      // Test 1: Health Check
      addResult('Testing health check...');
      const healthResponse = await unifiedApi.smartRequest('/health');
      if (healthResponse.success) {
        addResult(`✅ Health check successful via ${healthResponse.strategy} API`);
      } else {
        addResult(`❌ Health check failed: ${healthResponse.error}`);
      }

      // Test 2: Categories
      addResult('Testing categories...');
      const categoriesResponse = await unifiedApi.getCategories();
      if (categoriesResponse.success) {
        addResult(`✅ Got ${Array.isArray(categoriesResponse.data) ? categoriesResponse.data.length : 0} categories via ${categoriesResponse.strategy} API`);
      } else {
        addResult(`❌ Categories failed: ${categoriesResponse.error}`);
      }

      // Test 3: Drinks
      addResult('Testing drinks...');
      const drinksResponse = await unifiedApi.getDrinks();
      if (drinksResponse.success) {
        addResult(`✅ Got ${Array.isArray(drinksResponse.data) ? drinksResponse.data.length : 0} drinks via ${drinksResponse.strategy} API`);
      } else {
        addResult(`❌ Drinks failed: ${drinksResponse.error}`);
      }

      addResult('✅ All tests completed!');
    } catch (error) {
      addResult(`❌ Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testDirectApis = async () => {
    setIsRunning(true);
    setResults([]);
    
    addResult('🧪 Testing both APIs directly...');

    try {
      const healthCheck = await unifiedApi.healthCheck();
      
      addResult('=== Standard API ===');
      if (healthCheck.standard.success) {
        addResult('✅ Standard API working');
      } else {
        addResult(`❌ Standard API failed: ${healthCheck.standard.error}`);
      }

      addResult('=== Cloudflare API ===');
      if (healthCheck.cloudflare.success) {
        addResult('✅ Cloudflare API working');
        if (healthCheck.cloudflare.cfRay) {
          addResult(`   Ray ID: ${healthCheck.cloudflare.cfRay}`);
        }
      } else {
        addResult(`❌ Cloudflare API failed: ${healthCheck.cloudflare.error}`);
      }

      addResult(`📊 Recommended API: ${healthCheck.recommended}`);
    } catch (error) {
      addResult(`❌ Direct API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background mystical-atmosphere p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="mystical-card">
          <CardHeader>
            <CardTitle className="mystical-text flex items-center gap-2">
              ⚡ API Quick Test
            </CardTitle>
            <p className="text-muted-foreground">
              Simple test for the Unified API system
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={testUnifiedApi} 
                disabled={isRunning}
                className="mystical-glow"
              >
                {isRunning ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Test Unified API
                  </>
                )}
              </Button>

              <Button 
                onClick={testDirectApis} 
                disabled={isRunning}
                variant="outline"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Test Both APIs
              </Button>

              <Button 
                onClick={() => setResults([])} 
                variant="outline"
              >
                Clear Log
              </Button>
            </div>

            <Card className="mystical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📋 Test Results
                  {results.length > 0 && (
                    <Badge variant="outline">{results.length} entries</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No test results yet. Click a test button to start.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.map((result, index) => (
                      <div 
                        key={index} 
                        className="p-3 bg-muted rounded text-sm font-mono"
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-muted rounded">
              <h4 className="font-medium mb-2">Current API Status</h4>
              <div className="text-sm space-y-1">
                <div>Prefer Cloudflare: {unifiedApi.getStatus().preferCloudflareApi ? 'Yes' : 'No'}</div>
                <div>Fallback Enabled: {unifiedApi.getStatus().fallbackToCloudflare ? 'Yes' : 'No'}</div>
                <div>Max Retries: {unifiedApi.getStatus().maxRetries}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}