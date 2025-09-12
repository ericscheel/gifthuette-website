// Alternative API Service with better CORS handling and fallbacks

// Environment configuration helper - inline to avoid circular dependencies
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    // Check if import.meta.env is available (Vite environment)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    
    // Fallback for other environments
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    
    return defaultValue;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
};

const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'https://api.gifthuette.de');
const STATIC_JWT_TOKEN = getEnvVar('VITE_JWT_TOKEN', '');

// Enhanced API error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
    public isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token Management (same as before)
class TokenManager {
  private static readonly TOKEN_KEY = 'gifthütte_token';

  static getToken(): string | null {
    const dynamicToken = localStorage.getItem(this.TOKEN_KEY);
    if (dynamicToken) {
      return dynamicToken;
    }
    return STATIC_JWT_TOKEN || null;
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

// Enhanced request function with multiple strategies
class ApiServiceAlternative {
  private async requestWithFallback<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();

    // Strategy 1: Standard fetch with CORS
    try {
      return await this.standardFetch<T>(url, token, options);
    } catch (error) {
      console.warn('Standard fetch failed, trying alternative methods:', error);
      
      // Strategy 2: Try without credentials
      try {
        return await this.simpleFetch<T>(url, token, options);
      } catch (error2) {
        console.warn('Simple fetch failed:', error2);
        
        // Strategy 3: Try with XMLHttpRequest (sometimes works when fetch doesn't)
        try {
          return await this.xhrRequest<T>(url, token, options);
        } catch (error3) {
          console.error('All request methods failed:', { error, error2, error3 });
          throw new ApiError(0, 'All connection methods failed - server may be unreachable', null, true);
        }
      }
    }
  }

  private async standardFetch<T>(url: string, token: string | null, options: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });

    return this.handleResponse<T>(response, url);
  }

  private async simpleFetch<T>(url: string, token: string | null, options: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'no-cors', // This might help with CORS issues but limits response access
    });

    return this.handleResponse<T>(response, url);
  }

  private async xhrRequest<T>(url: string, token: string | null, options: RequestInit): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const method = (options.method || 'GET').toUpperCase();
      
      xhr.open(method, url, true);
      
      // Set headers
      xhr.setRequestHeader('Accept', 'application/json');
      if (options.headers) {
        Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type' || method !== 'GET') {
            xhr.setRequestHeader(key, value);
          }
        });
      }
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      if (method !== 'GET' && options.body) {
        xhr.setRequestHeader('Content-Type', 'application/json');
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
              resolve(data);
            } catch (e) {
              resolve(xhr.responseText as any);
            }
          } else {
            reject(new ApiError(xhr.status, xhr.statusText || 'Request failed'));
          }
        }
      };

      xhr.onerror = () => {
        reject(new ApiError(0, 'Network error (XHR)', null, true));
      };

      xhr.ontimeout = () => {
        reject(new ApiError(0, 'Request timeout', null, true));
      };

      xhr.timeout = 10000; // 10 second timeout

      if (method !== 'GET' && options.body) {
        xhr.send(options.body as string);
      } else {
        xhr.send();
      }
    });
  }

  private async handleResponse<T>(response: Response, url: string): Promise<T> {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText || 'Request failed' };
      }
      
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response.text() as any;
  }

  // Public API methods
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.requestWithFallback<{ status: string; timestamp: string }>('/health');
  }

  async getMe(): Promise<any> {
    return this.requestWithFallback<any>('/auth/me');
  }

  async login(email: string, password: string): Promise<any> {
    return this.requestWithFallback<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCategories(): Promise<any[]> {
    return this.requestWithFallback<any[]>('/categories');
  }

  async getDrinks(): Promise<any[]> {
    return this.requestWithFallback<any[]>('/drinks');
  }

  async getHighlights(): Promise<any[]> {
    return this.requestWithFallback<any[]>('/highlights');
  }

  async getCurrentLocation(): Promise<any> {
    return this.requestWithFallback<any>('/locations/current');
  }

  async getInstagramPosts(): Promise<any[]> {
    return this.requestWithFallback<any[]>('/social/instagram');
  }
}

// Export singleton instance
export const apiAlternative = new ApiServiceAlternative();
export { TokenManager };