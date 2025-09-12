// Unified API service that intelligently switches between standard and Cloudflare-optimized calls

import { apiService } from './api';
import { cloudflareApi, CloudflareApiError } from './cloudflare-api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  strategy?: 'standard' | 'cloudflare';
  cfRay?: string;
  retryCount?: number;
}

class UnifiedApiService {
  private preferCloudflareApi = false;
  private fallbackToCloudflare = true;
  private maxRetries = 2;

  /**
   * Smart API request that tries standard API first, then falls back to Cloudflare-optimized
   */
  async smartRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    let attempts = 0;
    let lastError: any = null;

    // Strategy 1: Try standard API first (unless we know Cloudflare is needed)
    if (!this.preferCloudflareApi) {
      try {
        console.log(`🔄 Attempting standard API for ${endpoint} (attempt ${attempts + 1})`);
        const data = await apiService.request<T>(endpoint, options);
        
        return {
          success: true,
          data,
          strategy: 'standard',
          retryCount: attempts
        };
      } catch (error) {
        console.warn(`❌ Standard API failed for ${endpoint}:`, error);
        lastError = error;
        attempts++;

        // If it's a CORS/Network error, immediately try Cloudflare strategy
        if (error instanceof Error && 
            (error.message.includes('Failed to fetch') || 
             error.message.includes('CORS') ||
             error.message.includes('Network'))) {
          console.log('🌩️ Detected CORS/Network error, switching to Cloudflare strategy');
          this.preferCloudflareApi = true; // Remember for next time
        }
      }
    }

    // Strategy 2: Try Cloudflare-optimized API
    if (this.fallbackToCloudflare) {
      try {
        console.log(`🌩️ Attempting Cloudflare API for ${endpoint} (attempt ${attempts + 1})`);
        const data = await cloudflareApi.request<T>(endpoint, options);
        
        return {
          success: true,
          data,
          strategy: 'cloudflare',
          retryCount: attempts
        };
      } catch (error) {
        console.error(`❌ Cloudflare API also failed for ${endpoint}:`, error);
        lastError = error;
        attempts++;

        if (error instanceof CloudflareApiError) {
          return {
            success: false,
            error: error.message,
            strategy: 'cloudflare',
            cfRay: error.cfRay,
            retryCount: attempts
          };
        }
      }
    }

    // All strategies failed
    return {
      success: false,
      error: lastError instanceof Error ? lastError.message : 'All API strategies failed',
      retryCount: attempts
    };
  }

  /**
   * Force use of Cloudflare-optimized API
   */
  async cloudflareRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const data = await cloudflareApi.request<T>(endpoint, options);
      return {
        success: true,
        data,
        strategy: 'cloudflare'
      };
    } catch (error) {
      if (error instanceof CloudflareApiError) {
        return {
          success: false,
          error: error.message,
          strategy: 'cloudflare',
          cfRay: error.cfRay
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cloudflare API request failed',
        strategy: 'cloudflare'
      };
    }
  }

  /**
   * Health check with both APIs
   */
  async healthCheck(): Promise<{
    standard: ApiResponse;
    cloudflare: ApiResponse;
    recommended: 'standard' | 'cloudflare';
  }> {
    console.log('🔍 Running health check on both APIs...');

    // Test standard API
    const standardResult = await this.testStandardApi();
    
    // Test Cloudflare API
    const cloudflareResult = await this.testCloudflareApi();

    // Determine recommendation
    const recommended = standardResult.success ? 'standard' : 'cloudflare';

    // Update preference
    if (!standardResult.success && cloudflareResult.success) {
      this.preferCloudflareApi = true;
      console.log('🌩️ Setting preference to Cloudflare API due to standard API failure');
    }

    return {
      standard: standardResult,
      cloudflare: cloudflareResult,
      recommended
    };
  }

  private async testStandardApi(): Promise<ApiResponse> {
    try {
      const data = await apiService.healthCheck();
      return {
        success: true,
        data,
        strategy: 'standard'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Standard API health check failed',
        strategy: 'standard'
      };
    }
  }

  private async testCloudflareApi(): Promise<ApiResponse> {
    try {
      const data = await cloudflareApi.healthCheck();
      return {
        success: true,
        data,
        strategy: 'cloudflare'
      };
    } catch (error) {
      if (error instanceof CloudflareApiError) {
        return {
          success: false,
          error: error.message,
          strategy: 'cloudflare',
          cfRay: error.cfRay
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cloudflare API health check failed',
        strategy: 'cloudflare'
      };
    }
  }

  // Convenience methods that use smart request
  async getMe() {
    return this.smartRequest('/auth/me');
  }

  async login(email: string, password: string) {
    return this.smartRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCategories() {
    return this.smartRequest('/categories');
  }

  async getDrinks() {
    return this.smartRequest('/drinks');
  }

  async getHighlights() {
    return this.smartRequest('/highlights');
  }

  async getCurrentLocation() {
    return this.smartRequest('/locations/current');
  }

  async getInstagramPosts() {
    return this.smartRequest('/social/instagram');
  }

  // Admin methods
  async createDrink(drinkData: any) {
    return this.smartRequest('/drinks', {
      method: 'POST',
      body: JSON.stringify(drinkData),
    });
  }

  async updateDrink(id: string, drinkData: any) {
    return this.smartRequest(`/drinks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(drinkData),
    });
  }

  async deleteDrink(id: string) {
    return this.smartRequest(`/drinks/${id}`, {
      method: 'DELETE',
    });
  }

  async createCategory(categoryData: any) {
    return this.smartRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: any) {
    return this.smartRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string) {
    return this.smartRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings
  setPreferCloudflare(prefer: boolean) {
    this.preferCloudflareApi = prefer;
    console.log(`🌩️ API preference set to: ${prefer ? 'Cloudflare' : 'Standard'}`);
  }

  setFallbackEnabled(enabled: boolean) {
    this.fallbackToCloudflare = enabled;
    console.log(`🔄 API fallback ${enabled ? 'enabled' : 'disabled'}`);
  }

  getStatus() {
    return {
      preferCloudflareApi: this.preferCloudflareApi,
      fallbackToCloudflare: this.fallbackToCloudflare,
      maxRetries: this.maxRetries
    };
  }
}

// Export singleton
export const unifiedApi = new UnifiedApiService();
export default unifiedApi;