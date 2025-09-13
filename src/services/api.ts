/**
 * ==========================================
 * GIFTHÜTTE API SERVICE
 * ==========================================
 *
 * Einheitlicher API Service für die Gifthütte Website
 * - Server Token Authentication (DE-GH-FRONTEND)
 * - Saubere Typisierung mit TypeScript
 * - Strukturierte Fehlerbehandlung
 * - Debug-Funktionalität
 *
 * @version 2.0.0
 * @author Gifthütte Team
 */

// ==========================================
// ENVIRONMENT & CONFIGURATION
// ==========================================

const getEnvVar = (key: string, defaultValue: string = ""): string => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    if (typeof process !== "undefined" && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.warn(`⚠️ Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
};

// Configuration
const CONFIG = {
  API_BASE_URL: getEnvVar("VITE_API_BASE_URL", "https://api.gifthuette.de"),
  SERVER_TOKEN:
    getEnvVar("VITE_GIFTHUETTE_SERVER_TOKEN", "") ||
    "gifthuette_frontend_21841292325c61f529223b7d04abe9b495f99e21d654948c",
  DEBUG_MODE:
    getEnvVar("VITE_DEBUG") === "true" || getEnvVar("VITE_DEBUG") === undefined,
  NODE_ENV: getEnvVar("VITE_NODE_ENV", "development"),
} as const;

// Validate configuration on startup
const validateConfig = () => {
  if (!CONFIG.SERVER_TOKEN) {
    console.error("❌ CRITICAL: Gifthütte Server Token missing!");
    console.error(
      "   Please set VITE_GIFTHUETTE_SERVER_TOKEN in your .env file"
    );
    console.error("   Expected: gifthuette_frontend_...");
    return false;
  }

  if (CONFIG.DEBUG_MODE) {
    console.log("✅ Gifthütte API Service Configuration:", {
      baseUrl: CONFIG.API_BASE_URL,
      tokenType: "server",
      tokenLength: CONFIG.SERVER_TOKEN.length,
      tokenPrefix: CONFIG.SERVER_TOKEN.substring(0, 25) + "...",
      debugMode: CONFIG.DEBUG_MODE,
      environment: CONFIG.NODE_ENV,
    });
  }

  return true;
};

const CONFIG_VALID = validateConfig();

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Ingredient - Einzelne Zutat mit Details
 */
export interface Ingredient {
  id: string;
  name: string;
  category: string;
  alcoholic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Drink Ingredient - Zutat in einem Getränk
 */
export interface DrinkIngredient {
  id: string;
  drinkId: string;
  ingredientId: string;
  amount: string;
  isOptional: boolean;
  order: number;
  ingredient: Ingredient;
}

/**
 * Tag - Tag-Entity
 */
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

/**
 * Drink Tag - Tag-Verbindung zu einem Getränk
 */
export interface DrinkTag {
  drinkId: string;
  tagId: string;
  tag: Tag;
}

/**
 * Drink Variant - verschiedene Größen/Varianten eines Getränks
 */
export interface DrinkVariant {
  id: string;
  label: string;
  priceCents: number;
  drinkId: string;
}

/**
 * Drink Media - Bilder und Videos für Getränke
 */
export interface DrinkMedia {
  id: string;
  url: string;
  alt: string;
  drinkId: string;
  createdAt: string;
}

/**
 * Drink - Hauptgetränk-Entity
 */
export interface Drink {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  alcoholPercentage?: string;
  preparationTime?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  glassType?: string;
  garnish?: string;
  instructions?: string;
  origin?: string;
  active: boolean;
  categoryId: string;
  category?: Category;
  variants: DrinkVariant[];
  media: DrinkMedia[];
  ingredients: DrinkIngredient[];
  tags: DrinkTag[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Category - Getränke-Kategorien
 */
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  drinks?: Drink[];
}

/**
 * Location - Standorte der mobilen Bar
 */
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

/**
 * Highlight - Besondere Angebote/Aktionen
 */
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

/**
 * User - Benutzer-Entity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "CUSTOMER";
}

/**
 * Paginated Response - Standard Pagination Format
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Drinks API Response - New API Response Format for Drinks
 */
export interface DrinksApiResponse {
  drinks: Drink[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Response - Standard Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
    public endpoint?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  toString(): string {
    return `ApiError [${this.status}]: ${this.message}${
      this.endpoint ? ` (${this.endpoint})` : ""
    }`;
  }
}

// ==========================================
// TOKEN MANAGEMENT
// ==========================================

/**
 * Simple Token Manager für User-Authentication
 * (Separate von Server Token)
 */
class TokenManager {
  private static readonly TOKEN_KEY = "gifthütte_user_token";

  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.warn("Failed to store user token:", error);
    }
  }

  static removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.warn("Failed to remove user token:", error);
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

// ==========================================
// API SERVICE CLASS
// ==========================================

/**
 * Hauptklasse für alle API-Operationen
 */
class GifthuetteApiService {
  /**
   * Basis-Request-Methode
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Validierung
    if (!CONFIG_VALID) {
      throw new ApiError(0, "API configuration invalid - missing server token");
    }

    const url = `${CONFIG.API_BASE_URL}${endpoint}`;

    // Headers zusammenstellen
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONFIG.SERVER_TOKEN}`,
      "X-Client": "gifthütte-frontend",
      "X-Version": "2.0.0",
      ...options.headers,
    };

    // Debug-Ausgabe
    if (CONFIG.DEBUG_MODE) {
      console.log("🚀 API Request:", {
        method: options.method || "GET",
        url,
        endpoint,
        hasServerToken: !!CONFIG.SERVER_TOKEN,
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
        credentials: "omit",
      });

      // Response Status prüfen
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (CONFIG.DEBUG_MODE) {
          console.error("❌ API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            url,
            endpoint,
            errorData,
          });
        }

        throw new ApiError(
          response.status,
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          errorData,
          endpoint
        );
      }

      // Response parsen
      const contentType = response.headers.get("content-type");
      let data: T;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      // Debug-Ausgabe für erfolgreiche Requests
      if (CONFIG.DEBUG_MODE) {
        console.log("✅ API Response:", {
          endpoint,
          status: response.status,
          dataType: typeof data,
          timestamp: new Date().toISOString(),
        });
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network/Fetch Errors
      console.error("❌ Network Error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        url,
        endpoint,
        timestamp: new Date().toISOString(),
      });

      throw new ApiError(
        0,
        `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error,
        endpoint
      );
    }
  }

  // ==========================================
  // SYSTEM & HEALTH
  // ==========================================

  /**
   * Health Check - API Status prüfen
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
  }> {
    return this.request<{
      status: string;
      timestamp: string;
      version?: string;
    }>("/auth/server-status");
  }

  /**
   * Server Info abrufen
   */
  async getServerInfo(): Promise<{
    version: string;
    environment: string;
    uptime: number;
  }> {
    return this.request<{
      version: string;
      environment: string;
      uptime: number;
    }>("/info");
  }

  /**
   * Server Status abrufen (für Monitoring)
   */
  async getServerStatus(): Promise<{
    status: string;
    totalServers: number;
    serverList: string[];
    allowedIPs: string[];
    tokensLoaded: number;
    lastUpdated: string;
  }> {
    return this.request<{
      status: string;
      totalServers: number;
      serverList: string[];
      allowedIPs: string[];
      tokensLoaded: number;
      lastUpdated: string;
    }>("/auth/server-status");
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  /**
   * Benutzer einloggen
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Token lokal speichern
    if (response.token) {
      TokenManager.setToken(response.token);
    }

    return response;
  }

  /**
   * Benutzer ausloggen
   */
  async logout(): Promise<void> {
    try {
      await this.request<void>("/auth/logout", { method: "POST" });
    } finally {
      TokenManager.removeToken();
    }
  }

  /**
   * Aktuellen Benutzer abrufen
   */
  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  /**
   * Token validieren
   */
  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const user = await this.getMe();
      return { valid: true, user };
    } catch {
      return { valid: false };
    }
  }

  // ==========================================
  // DRINKS MANAGEMENT
  // ==========================================

  /**
   * Getränke abrufen (mit Filterung und Pagination)
   */
  async getDrinks(params?: {
    q?: string;
    category?: string;
    page?: number;
    pageSize?: number;
    isActive?: boolean;
    sortBy?: "name" | "price" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<DrinksApiResponse> {
    const searchParams = new URLSearchParams();

    if (params?.q) searchParams.append("q", params.q);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.pageSize)
      searchParams.append("pageSize", params.pageSize.toString());
    if (params?.isActive !== undefined)
      searchParams.append("isActive", params.isActive.toString());
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const endpoint = `/drinks${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    return this.request<DrinksApiResponse>(endpoint);
  }

  /**
   * Enhanced Drinks abrufen (mit Frontend-Token)
   */
  async getDrinksEnhanced(params?: {
    q?: string;
    category?: string;
    page?: number;
    pageSize?: number;
    isActive?: boolean;
    sortBy?: "name" | "price" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<Drink[]> {
    const searchParams = new URLSearchParams();

    if (params?.q) searchParams.append("q", params.q);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.pageSize)
      searchParams.append("pageSize", params.pageSize.toString());
    if (params?.isActive !== undefined)
      searchParams.append("isActive", params.isActive.toString());
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const endpoint = `/drinks${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    const response = await this.request<DrinksApiResponse>(endpoint);

    // Extract drinks array from new API response structure
    return response.drinks || [];
  }

  /**
   * Einzelnes Getränk abrufen
   */
  async getDrink(slug: string): Promise<Drink> {
    return this.request<Drink>(`/drinks/${slug}`);
  }

  /**
   * Getränk erstellen
   */
  async createDrink(data: {
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    categoryId: string;
    tags?: string[];
    alcoholContent?: number;
    ingredients?: string[];
    isActive?: boolean;
  }): Promise<Drink> {
    return this.request<Drink>("/drinks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Getränk aktualisieren
   */
  async updateDrink(id: string, data: Partial<Drink>): Promise<Drink> {
    return this.request<Drink>(`/drinks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Getränk löschen
   */
  async deleteDrink(id: string): Promise<void> {
    return this.request<void>(`/drinks/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Getränk-Varianten verwalten
   */
  async addDrinkVariant(
    drinkId: string,
    variant: Omit<DrinkVariant, "id">
  ): Promise<DrinkVariant> {
    return this.request<DrinkVariant>(`/drinks/${drinkId}/variants`, {
      method: "POST",
      body: JSON.stringify(variant),
    });
  }

  async updateDrinkVariant(
    drinkId: string,
    variantId: string,
    data: Partial<DrinkVariant>
  ): Promise<DrinkVariant> {
    return this.request<DrinkVariant>(
      `/drinks/${drinkId}/variants/${variantId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteDrinkVariant(drinkId: string, variantId: string): Promise<void> {
    return this.request<void>(`/drinks/${drinkId}/variants/${variantId}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // CATEGORIES MANAGEMENT
  // ==========================================

  /**
   * Kategorien abrufen
   */
  async getCategories(includeInactive?: boolean): Promise<Category[]> {
    const params = includeInactive ? "?includeInactive=true" : "";
    return this.request<Category[]>(`/categories${params}`);
  }

  /**
   * Einzelne Kategorie abrufen (mit Getränken)
   */
  async getCategory(slug: string): Promise<Category & { drinks: Drink[] }> {
    return this.request<Category & { drinks: Drink[] }>(`/categories/${slug}`);
  }

  /**
   * Kategorie erstellen
   */
  async createCategory(data: {
    slug: string;
    name: string;
    description?: string;
    sortOrder?: number;
  }): Promise<Category> {
    return this.request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Kategorie aktualisieren
   */
  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Kategorie löschen
   */
  async deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // LOCATIONS MANAGEMENT
  // ==========================================

  /**
   * Kommende Standorte abrufen
   */
  async getUpcomingLocations(): Promise<Location[]> {
    return this.request<Location[]>("/locations/upcoming");
  }

  /**
   * Aktuellen Standort abrufen
   */
  async getCurrentLocation(): Promise<Location | null> {
    try {
      return await this.request<Location>("/locations/current");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Alle Standorte abrufen
   */
  async getLocations(): Promise<Location[]> {
    return this.request<Location[]>("/locations/upcoming");
  }

  /**
   * Standort erstellen
   */
  async createLocation(data: {
    name: string;
    address: string;
    city: string;
    date: string;
    isCurrent?: boolean;
  }): Promise<Location> {
    return this.request<Location>("/locations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Standort aktualisieren
   */
  async updateLocation(id: string, data: Partial<Location>): Promise<Location> {
    return this.request<Location>(`/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Standort löschen
   */
  async deleteLocation(id: string): Promise<void> {
    return this.request<void>(`/locations/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Aktuellen Standort setzen
   */
  async setCurrentLocation(id: string): Promise<void> {
    return this.request<void>(`/locations/${id}/set-current`, {
      method: "POST",
    });
  }

  // ==========================================
  // HIGHLIGHTS MANAGEMENT
  // ==========================================

  /**
   * Highlights abrufen
   */
  async getHighlights(activeOnly?: boolean): Promise<Highlight[]> {
    const params = activeOnly ? "?activeOnly=true" : "";
    return this.request<Highlight[]>(`/highlights${params}`);
  }

  /**
   * Highlight erstellen
   */
  async createHighlight(data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }): Promise<Highlight> {
    return this.request<Highlight>("/highlights", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Highlight aktualisieren
   */
  async updateHighlight(
    id: string,
    data: Partial<Highlight>
  ): Promise<Highlight> {
    return this.request<Highlight>(`/highlights/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Highlight löschen
   */
  async deleteHighlight(id: string): Promise<void> {
    return this.request<void>(`/highlights/${id}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // SOCIAL MEDIA
  // ==========================================

  /**
   * Instagram Feed abrufen
   */
  async getInstagramFeed(): Promise<
    Array<{
      id: string;
      caption: string;
      media_type: "IMAGE" | "VIDEO";
      media_url: string;
      permalink: string;
      timestamp: string;
    }>
  > {
    const response = await this.request<{
      data: Array<{
        id: string;
        caption: string;
        media_type: "IMAGE" | "VIDEO";
        media_url: string;
        permalink: string;
        timestamp: string;
      }>;
    }>("/social/instagram");
    return response.data;
  }

  // ==========================================
  // NEWSLETTER
  // ==========================================

  /**
   * Newsletter abonnieren
   */
  async subscribeNewsletter(email: string): Promise<{
    id: string;
    email: string;
    confirmed: boolean;
    createdAt: string;
  }> {
    return this.request<{
      id: string;
      email: string;
      confirmed: boolean;
      createdAt: string;
    }>("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Newsletter abmelden
   */
  async unsubscribeNewsletter(email: string): Promise<void> {
    return this.request<void>("/newsletter/unsubscribe", {
      method: "DELETE",
      body: JSON.stringify({ email }),
    });
  }

  // ==========================================
  // SEARCH & ANALYTICS
  // ==========================================

  /**
   * Globale Suche
   */
  async search(
    query: string,
    filters?: {
      categories?: string[];
      tags?: string[];
      alcoholContent?: { min?: number; max?: number };
      price?: { min?: number; max?: number };
    }
  ): Promise<{
    drinks: Drink[];
    categories: Category[];
    totalResults: number;
  }> {
    return this.request<{
      drinks: Drink[];
      categories: Category[];
      totalResults: number;
    }>("/search", {
      method: "POST",
      body: JSON.stringify({ query, filters }),
    });
  }

  /**
   * Suchvorschläge
   */
  async getSearchSuggestions(query: string): Promise<{
    drinks: string[];
    ingredients: string[];
    categories: string[];
  }> {
    return this.request<{
      drinks: string[];
      ingredients: string[];
      categories: string[];
    }>(`/drinks/suggestions?q=${encodeURIComponent(query)}`);
  }

  /**
   * Analytics-Daten abrufen (für Admin)
   */
  async getAnalytics(
    timeframe: "day" | "week" | "month" | "year" = "week"
  ): Promise<{
    popularDrinks: Array<{ drink: Drink; views: number; orders?: number }>;
    categoryStats: Array<{
      category: Category;
      drinkCount: number;
      popularity: number;
    }>;
    searchStats: Array<{ query: string; count: number }>;
    timeframe: string;
  }> {
    return this.request<{
      popularDrinks: Array<{ drink: Drink; views: number; orders?: number }>;
      categoryStats: Array<{
        category: Category;
        drinkCount: number;
        popularity: number;
      }>;
      searchStats: Array<{ query: string; count: number }>;
      timeframe: string;
    }>(`/analytics?timeframe=${timeframe}`);
  }
}

// ==========================================
// SINGLETON EXPORT
// ==========================================

/**
 * Singleton API Instance
 */
export const api = new GifthuetteApiService();

/**
 * Token Manager Export
 */
export const tokenManager = TokenManager;

/**
 * Configuration Export
 */
export const config = CONFIG;

/**
 * Default Export
 */
export default api;

// ==========================================
// UTILITY EXPORTS
// ==========================================

/**
 * Hilfsfunktionen für häufige Operationen
 */
export const ApiUtils = {
  /**
   * Preis in Euro formatieren
   */
  formatPrice: (priceCents: number): string => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(priceCents / 100);
  },

  /**
   * Datum formatieren
   */
  formatDate: (dateString: string): string => {
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  },

  /**
   * API Error Handler
   */
  handleApiError: (error: unknown): string => {
    if (error instanceof ApiError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Ein unbekannter Fehler ist aufgetreten";
  },

  /**
   * URL-Safe Slug erstellen
   */
  createSlug: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const map: { [key: string]: string } = {
          ä: "ae",
          ö: "oe",
          ü: "ue",
          ß: "ss",
        };
        return map[match] || match;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  /**
   * Check if user has permission
   */
  hasPermission: (user: User | null, requiredRole: User["role"]): boolean => {
    if (!user) return false;
    const roleHierarchy = { CUSTOMER: 0, MANAGER: 1, ADMIN: 2 };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  },
};
