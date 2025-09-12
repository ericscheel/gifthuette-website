import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../services/api';
import { unifiedApi } from '../services/unified-api';

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
      const response = await unifiedApi.getDrinks();
      return response.success ? response.data : [];
    },
    [searchParams?.q, searchParams?.category, searchParams?.page, searchParams?.pageSize]
  );
}

export function useCategories() {
  return useApi(async () => {
    const response = await unifiedApi.getCategories();
    return response.success ? response.data : [];
  });
}

export function useHighlights() {
  return useApi(async () => {
    const response = await unifiedApi.getHighlights();
    return response.success ? response.data : [];
  });
}

export function useUpcomingLocations() {
  return useApi(() => api.getUpcomingLocations());
}

export function useCurrentLocation() {
  return useApi(async () => {
    const response = await unifiedApi.getCurrentLocation();
    return response.success ? response.data : null;
  });
}

export function useInstagramFeed() {
  return useApi(async () => {
    const response = await unifiedApi.getInstagramPosts();
    return response.success ? response.data : [];
  });
}

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await unifiedApi.getMe();
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await unifiedApi.login(email, password);
      if (response.success && response.data?.accessToken) {
        localStorage.setItem('gifthütte_token', response.data.accessToken);
        await checkAuth();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('gifthütte_token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refetch: checkAuth
  };
}