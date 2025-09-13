import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function DrinksDebug() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDrinksAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🧪 Testing Drinks API...');
      
      const result = await api.getDrinksEnhanced({ page: 1, pageSize: 10 });
      console.log('✅ API Response:', result);
      setResponse(result);
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testRawAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🧪 Testing Raw Drinks API...');
      
      // Use the direct request method to see raw response
      const result = await api.request('/drinks?page=1&pageSize=10');
      console.log('✅ Raw API Response:', result);
      setResponse(result);
    } catch (err) {
      console.error('❌ Raw API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Drinks API Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testDrinksAPI} disabled={loading}>
            Test getDrinksEnhanced()
          </Button>
          <Button onClick={testRawAPI} disabled={loading} variant="outline">
            Test Raw API
          </Button>
        </div>

        {loading && <p className="text-blue-500">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {response && (
          <div className="space-y-2">
            <h3 className="font-semibold">API Response:</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 text-black">
              {JSON.stringify(response, null, 2)}
            </pre>
            
            {response.drinks && (
              <div>
                <h4 className="font-medium">Drinks Count: {response.drinks.length}</h4>
                {response.drinks.map((drink: any, index: number) => (
                  <div key={index} className="border p-2 rounded mt-2">
                    <p><strong>Name:</strong> {drink.name}</p>
                    <p><strong>Slug:</strong> {drink.slug}</p>
                    <p><strong>Price:</strong> {drink.priceCents}¢</p>
                    <p><strong>Ingredients:</strong> {drink.ingredients?.length || 0}</p>
                    <p><strong>Tags:</strong> {drink.tags?.length || 0}</p>
                    <p><strong>Media:</strong> {drink.media?.length || 0}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}