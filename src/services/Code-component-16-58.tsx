// Vereinfachter API Service für Gifthütte - Nur Server Token
// Diese Version verwendet ausschließlich den Gifthütte Server Token

// Environment helper
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
};

const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'https://api.gifthuette.de');
const GIFTHUETTE_SERVER_TOKEN = getEnvVar('VITE_GIFTHUETTE_SERVER_TOKEN', '');
const DEBUG_MODE = getEnvVar('VITE_DEBUG') === 'true';

// Validate server token on startup
if (!GIFTHUETTE_SERVER_TOKEN) {
  console.error('❌ CRITICAL: Gifthütte Server Token missing!');
  console.error('   Please set VITE_GIFTHUETTE_SERVER_TOKEN in your .env file');
  console.error('   Expected format: gifthuette_frontend_...');
} else {
  console.log('✅ Gifthütte API Service Ready:', {
    baseUrl: API_BASE_URL,
    tokenType: 'server',
    tokenLength: GIFTHUETTE_SERVER_TOKEN.length,
    tokenPrefix: GIFTHUETTE_SERVER_TOKEN.substring(0, 25) + '...',
    debugMode: DEBUG_MODE
  });
}

// Types
export interface DrinkVariant {
  id: string;
  label: string;
  priceCents: number;
}

export interface DrinkMedia {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  altText?: string;
}

export interface Drink {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  categoryId: string;
  category?: Category;
  variants: DrinkVariant[];
  media: DrinkMedia[];
  isActive: boolean;
  tags: string[];
  alcoholContent?: number;
  ingredients: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  date: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Error
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Simple API Service
class GifthuetteApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!GIFTHUETTE_SERVER_TOKEN) {
      throw new ApiError(401, 'Server token not configured');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GIFTHUETTE_SERVER_TOKEN}`,
      ...options.headers,
    };

    if (DEBUG_MODE) {
      console.log('🚀 API Request:', {
        url,
        method: options.method || 'GET',
        endpoint
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (DEBUG_MODE) {
          console.error('❌ API Error:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            url
          });
        }

        throw new ApiError(
          response.status,
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (DEBUG_MODE) {
          console.log('✅ API Response:', { endpoint, data });
        }
        
        return data;
      }

      return response.text() as any;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('❌ Network Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url,
        endpoint
      });

      throw new ApiError(
        0,
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Drinks
  async getDrinks(params?: {
    q?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Drink>> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    const endpoint = `/drinks${searchParams.toString() ? `?${searchParams}` : ''}`;
    return this.request<PaginatedResponse<Drink>>(endpoint);
  }

  async getDrink(slug: string): Promise<Drink> {
    return this.request<Drink>(`/drinks/${slug}`);
  }

  async createDrink(data: {
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    categoryId: string;
  }): Promise<Drink> {
    return this.request<Drink>('/drinks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDrink(id: string, data: Partial<Drink>): Promise<Drink> {
    return this.request<Drink>(`/drinks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDrink(id: string): Promise<void> {
    return this.request<void>(`/drinks/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async getCategory(slug: string): Promise<Category & { drinks: Drink[] }> {
    return this.request<Category & { drinks: Drink[] }>(`/categories/${slug}`);
  }

  async createCategory(data: { slug: string; name: string }): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Locations
  async getUpcomingLocations(): Promise<Location[]> {
    return this.request<Location[]>('/locations/upcoming');
  }

  async getCurrentLocation(): Promise<Location | null> {
    try {
      return await this.request<Location>('/locations/current');
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createLocation(data: {
    name: string;
    address: string;
    city: string;
    date: string;
    isCurrent?: boolean;
  }): Promise<Location> {
    return this.request<Location>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLocation(id: string, data: Partial<Location>): Promise<Location> {
    return this.request<Location>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLocation(id: string): Promise<void> {
    return this.request<void>(`/locations/${id}`, {
      method: 'DELETE',
    });
  }

  async setCurrentLocation(id: string): Promise<void> {
    return this.request<void>(`/locations/${id}/set-current`, {
      method: 'POST',
    });
  }

  // Highlights
  async getHighlights(): Promise<Highlight[]> {
    return this.request<Highlight[]>('/highlights');
  }

  async createHighlight(data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }): Promise<Highlight> {
    return this.request<Highlight>('/highlights', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHighlight(id: string, data: Partial<Highlight>): Promise<Highlight> {
    return this.request<Highlight>(`/highlights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHighlight(id: string): Promise<void> {
    return this.request<void>(`/highlights/${id}`, {
      method: 'DELETE',
    });
  }
}

// Singleton instance
export const api = new GifthuetteApiService();

// Default export
export default api;