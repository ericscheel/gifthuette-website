// Cloudflare-optimized API service with specific workarounds

// Environment configuration
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
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

// Token Management
class TokenManager {
  private static readonly TOKEN_KEY = 'gifthütte_token';

  static getToken(): string | null {
    const dynamicToken = localStorage.getItem(this.TOKEN_KEY);
    if (dynamicToken) return dynamicToken;
    return getEnvVar('VITE_JWT_TOKEN') || null;
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

// Cloudflare-specific API error
export class CloudflareApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public cfRay?: string,
    public cfCountry?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'CloudflareApiError';
  }

  get isCloudflareError(): boolean {
    return this.status >= 520 && this.status <= 527;
  }

  get isBotProtection(): boolean {
    return this.status === 403 && this.message.includes('Forbidden');
  }

  get isRateLimit(): boolean {
    return this.status === 429;
  }
}

// Cloudflare-optimized request strategies
class CloudflareApiService {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async cloudflareRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    strategy: 'browser' | 'minimal' | 'xhr' = 'browser'
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();

    // Strategy 1: Browser-like request (bypasses most bot protection)
    if (strategy === 'browser') {
      return this.browserLikeRequest<T>(url, token, options);
    }

    // Strategy 2: Minimal headers (sometimes works when browser-like fails)
    if (strategy === 'minimal') {
      return this.minimalRequest<T>(url, token, options);
    }

    // Strategy 3: XMLHttpRequest (different network stack)
    if (strategy === 'xhr') {
      return this.xhrRequest<T>(url, token, options);
    }

    throw new CloudflareApiError(0, 'Invalid strategy');
  }

  private async browserLikeRequest<T>(
    url: string, 
    token: string | null, 
    options: RequestInit
  ): Promise<T> {
    const headers: HeadersInit = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'User-Agent': this.getRandomUserAgent(),
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Add referrer if it makes sense
    if (window.location.origin !== url) {
      (headers as any).Referer = window.location.origin;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });

    return this.handleCloudflareResponse<T>(response);
  }

  private async minimalRequest<T>(
    url: string, 
    token: string | null, 
    options: RequestInit
  ): Promise<T> {
    const headers: HeadersInit = {
      'Accept': '*/*',
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
    });

    return this.handleCloudflareResponse<T>(response);
  }

  private async xhrRequest<T>(
    url: string, 
    token: string | null, 
    options: RequestInit
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const method = (options.method || 'GET').toUpperCase();
      
      xhr.open(method, url, true);
      
      // Set cloudflare-friendly headers
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('User-Agent', this.getRandomUserAgent());
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // Add custom headers
      if (options.headers) {
        Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'user-agent') { // User-Agent is handled above
            xhr.setRequestHeader(key, value);
          }
        });
      }
      
      if (method !== 'GET' && options.body) {
        xhr.setRequestHeader('Content-Type', 'application/json');
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          const cfRay = xhr.getResponseHeader('cf-ray');
          const cfCountry = xhr.getResponseHeader('cf-ipcountry');
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
              resolve(data);
            } catch (e) {
              resolve(xhr.responseText as any);
            }
          } else {
            reject(new CloudflareApiError(
              xhr.status, 
              xhr.statusText || 'XHR request failed',
              cfRay || undefined,
              cfCountry || undefined
            ));
          }
        }
      };

      xhr.onerror = () => {
        reject(new CloudflareApiError(0, 'XHR Network Error'));
      };

      xhr.ontimeout = () => {
        reject(new CloudflareApiError(0, 'XHR Timeout'));
      };

      xhr.timeout = 15000; // 15 second timeout

      if (method !== 'GET' && options.body) {
        xhr.send(options.body as string);
      } else {
        xhr.send();
      }
    });
  }

  private async handleCloudflareResponse<T>(response: Response): Promise<T> {
    const cfRay = response.headers.get('cf-ray');
    const cfCountry = response.headers.get('cf-ipcountry');
    const server = response.headers.get('server');

    // Log Cloudflare detection
    if (server?.includes('cloudflare') || cfRay) {
      console.log('🌩️ Cloudflare detected:', {
        cfRay,
        cfCountry,
        server,
        status: response.status
      });
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText || 'Request failed' };
      }

      throw new CloudflareApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        cfRay || undefined,
        cfCountry || undefined,
        errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response.text() as any;
  }

  // Multi-strategy request with automatic fallback
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const strategies: Array<'browser' | 'minimal' | 'xhr'> = ['browser', 'minimal', 'xhr'];
    let lastError: CloudflareApiError | null = null;

    for (const strategy of strategies) {
      try {
        console.log(`🌩️ Trying ${strategy} strategy for ${endpoint}`);
        const result = await this.cloudflareRequest<T>(endpoint, options, strategy);
        console.log(`✅ ${strategy} strategy succeeded for ${endpoint}`);
        return result;
      } catch (error) {
        console.warn(`❌ ${strategy} strategy failed for ${endpoint}:`, error);
        
        if (error instanceof CloudflareApiError) {
          lastError = error;
          
          // If it's a rate limit, wait before trying next strategy
          if (error.isRateLimit) {
            console.log('⏳ Rate limited, waiting 2s before next strategy...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          // If it's bot protection, try a different user agent
          if (error.isBotProtection) {
            console.log('🤖 Bot protection detected, switching user agent...');
            // User agent is already randomized in the next attempt
          }
        } else {
          lastError = new CloudflareApiError(0, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    }

    // All strategies failed
    throw lastError || new CloudflareApiError(0, 'All request strategies failed');
  }

  // Public API methods with Cloudflare optimizations
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  async getMe(): Promise<any> {
    return this.request<any>('/auth/me');
  }

  async login(email: string, password: string): Promise<any> {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCategories(): Promise<any[]> {
    return this.request<any[]>('/categories');
  }

  async getDrinks(): Promise<any[]> {
    return this.request<any[]>('/drinks');
  }

  async getHighlights(): Promise<any[]> {
    return this.request<any[]>('/highlights');
  }

  async getCurrentLocation(): Promise<any> {
    return this.request<any>('/locations/current');
  }

  async getInstagramPosts(): Promise<any[]> {
    return this.request<any[]>('/social/instagram');
  }
}

// Export singleton instance
export const cloudflareApi = new CloudflareApiService();
export { TokenManager, CloudflareApiError };