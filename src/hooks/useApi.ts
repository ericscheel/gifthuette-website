import { useState, useEffect, useCallback } from 'react';
import { api, ApiError, tokenManager, type User, type Drink, type Category, type Highlight, type Location } from '../services/api';

// Generic hook for API calls with loading and error states
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Ein unerwarteter Fehler ist aufgetreten';
      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch };
}

// Hook for manual API calls (e.g., form submissions)
export function useApiMutation<TData, TVariables = void>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (
    apiCall: (variables: TVariables) => Promise<TData>,
    variables: TVariables
  ): Promise<TData | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(variables);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Ein unerwarteter Fehler ist aufgetreten';
      setError(errorMessage);
      console.error('API Mutation Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, reset };
}

// Specialized hooks for common operations
export function useDrinks(searchParams?: {
  q?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  return useApi(
    async () => {
      const response = await api.getDrinks(searchParams);
      return response.drinks; // Extract drinks array from new API response
    },
    [searchParams?.q, searchParams?.category, searchParams?.page, searchParams?.pageSize]
  );
}

export function useCategories() {
  return useApi(async () => {
    return await api.getCategories();
  });
}

export function useHighlights() {
  return useApi(async () => {
    return await api.getHighlights(true); // Only active highlights
  });
}

export function useUpcomingLocations() {
  return useApi(() => api.getUpcomingLocations());
}

export function useCurrentLocation() {
  return useApi(async () => {
    return await api.getCurrentLocation();
  });
}

export function useInstagramFeed() {
  return useApi(async () => {
    try {
      const instagramPosts = await api.getInstagramFeed();
      return instagramPosts.map(post => ({
        id: post.id,
        url: post.media_url,
        caption: post.caption,
        timestamp: post.timestamp,
        permalink: post.permalink
      }));
    } catch (error) {
      // Fallback zu Mock-Daten wenn Instagram API nicht verfügbar
      console.warn('Instagram API not available, using mock data:', error);
      return [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400',
          caption: 'Mystische Cocktails in der Gifthütte 🧪✨',
          timestamp: new Date().toISOString(),
          permalink: '#'
        },
        {
          id: '2', 
          url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
          caption: 'Grüne Zaubertränke für mutige Gäste 🌿💚',
          timestamp: new Date().toISOString(),
          permalink: '#'
        }
      ];
    }
  });
}

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if we have a user token first (separate from server token)
      const userToken = tokenManager.getToken();
      if (!userToken) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Check if token is valid before making API call
      if (!tokenManager.isAuthenticated()) {
        tokenManager.removeToken();
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const user = await api.getMe();
      setUser(user);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      tokenManager.removeToken(); // Remove invalid token
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      if (response.accessToken) {
        // If user data was fetched, use it; otherwise fetch it separately
        if (response.user) {
          setUser(response.user);
        } else {
          // Fetch user data after successful login
          try {
            const user = await api.getMe();
            setUser(user);
          } catch (userErr) {
            console.error('Failed to fetch user after login:', userErr);
            // Still consider login successful if token is valid
          }
        }
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      // Clear any invalid tokens
      tokenManager.removeToken();
      setUser(null);
      setIsAuthenticated(false);
      
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
        ? err.message 
        : 'Anmeldung fehlgeschlagen';
      setError(errorMessage);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    logout,
    refetch: checkAuth
  };
}