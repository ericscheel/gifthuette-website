# Gifthütte API Service - Dokumentation

## 📋 Übersicht

Die Gifthütte Website verwendet einen **einheitlichen API Service** (`/services/api.ts`) für alle Backend-Operationen. Diese Dokumentation erklärt die Struktur und Verwendung.

## 🔧 Konfiguration

### Environment Variables
```bash
# API-Basis-URL
VITE_API_BASE_URL=https://api.gifthuette.de

# Server Token (DE-GH-FRONTEND)
VITE_GIFTHUETTE_SERVER_TOKEN=gifthuette_frontend_...

# Debug-Modus
VITE_DEBUG=true

# Umgebung
VITE_NODE_ENV=development
```

### Server Token Berechtigungen
Der **DE-GH-FRONTEND** Token hat folgende Berechtigungen:
- ✅ `read` - Daten abrufen
- ✅ `write` - Daten erstellen/bearbeiten
- ✅ `analytics` - Statistiken abrufen
- ✅ `newsletter` - Newsletter-Funktionen

## 🏗️ API-Struktur

### Hauptklasse: `GifthuetteApiService`

```typescript
import { api } from '../services/api';

// Singleton-Instanz verfügbar als:
api.methodName()
```

### Verfügbare Module

#### 🍹 Drinks Management
```typescript
// Getränke abrufen
const drinks = await api.getDrinks({
  q: 'mojito',
  category: 'cocktails',
  page: 1,
  pageSize: 20
});

// Einzelnes Getränk
const drink = await api.getDrink('mojito-classic');

// Getränk erstellen
const newDrink = await api.createDrink({
  slug: 'new-cocktail',
  name: 'Neuer Cocktail',
  description: 'Beschreibung...',
  priceCents: 890,
  categoryId: 'cat-id'
});
```

#### 🗂️ Categories
```typescript
// Alle Kategorien
const categories = await api.getCategories();

// Kategorie mit Getränken
const category = await api.getCategory('cocktails');

// Neue Kategorie
const newCategory = await api.createCategory({
  slug: 'neue-kategorie',
  name: 'Neue Kategorie'
});
```

#### 📍 Locations
```typescript
// Kommende Standorte
const upcoming = await api.getUpcomingLocations();

// Aktueller Standort
const current = await api.getCurrentLocation();

// Neuer Standort
const location = await api.createLocation({
  name: 'Stadtfest München',
  address: 'Marienplatz 1',
  city: 'München',
  date: '2024-07-15T10:00:00Z'
});
```

#### ⭐ Highlights
```typescript
// Aktive Highlights
const highlights = await api.getHighlights(true);

// Highlight erstellen
const highlight = await api.createHighlight({
  title: 'Happy Hour',
  description: '2-für-1 Angebot',
  startDate: '2024-07-01T17:00:00Z',
  endDate: '2024-07-01T19:00:00Z'
});
```

#### 🔍 Search & Analytics
```typescript
// Globale Suche
const results = await api.search('mojito', {
  categories: ['cocktails'],
  price: { min: 500, max: 1500 }
});

// Suchvorschläge
const suggestions = await api.getSearchSuggestions('moj');

// Analytics (Admin)
const analytics = await api.getAnalytics('week');
```

#### 🔐 Authentication
```typescript
// Login
const authResponse = await api.login('admin@gifthuette.de', 'password');

// Aktueller User
const user = await api.getMe();

// Logout
await api.logout();

// Token validieren
const validation = await api.validateToken();
```

## 🎯 React Hooks

### Fertige Hooks verwenden
```typescript
import { useDrinks, useCategories, useAuth } from '../hooks/useApi';

function MyComponent() {
  const { data: drinks, loading, error, refetch } = useDrinks({
    category: 'cocktails'
  });
  
  const { data: categories } = useCategories();
  
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // ...
}
```

### Eigene API-Hooks erstellen
```typescript
import { useApi, useApiMutation } from '../hooks/useApi';

// Für Daten-Abfragen
function useCustomData() {
  return useApi(async () => {
    return await api.someMethod();
  }, [/* dependencies */]);
}

// Für Mutations (Create/Update/Delete)
function useCreateDrink() {
  return useApiMutation<Drink, CreateDrinkData>();
}

function MyComponent() {
  const { mutate, loading, error } = useCreateDrink();
  
  const handleCreate = async (data: CreateDrinkData) => {
    const result = await mutate(api.createDrink, data);
    if (result) {
      // Erfolg
    }
  };
}
```

## 🛠️ Utility-Funktionen

```typescript
import { ApiUtils } from '../services/api';

// Preis formatieren
const price = ApiUtils.formatPrice(890); // "8,90 €"

// Datum formatieren
const date = ApiUtils.formatDate('2024-07-15T10:00:00Z');

// Fehler behandeln
const errorMessage = ApiUtils.handleApiError(error);

// Slug erstellen
const slug = ApiUtils.createSlug('Mein Getränk'); // "mein-getraenk"

// Berechtigungen prüfen
const canEdit = ApiUtils.hasPermission(user, 'ADMIN');
```

## 🐛 Fehlerbehandlung

### ApiError Klasse
```typescript
import { ApiError } from '../services/api';

try {
  const drink = await api.getDrink('nonexistent');
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.status);     // HTTP-Status
    console.log('Message:', error.message);  // Fehlernachricht
    console.log('Data:', error.data);        // Zusätzliche Daten
    console.log('Endpoint:', error.endpoint); // API-Endpunkt
  }
}
```

### Debug-Ausgaben
Bei `VITE_DEBUG=true` in der Konsole:
- 🚀 **API Request**: Method, URL, Endpoint
- ✅ **API Response**: Endpoint, Status, Datentyp
- ❌ **API Error**: Status, Nachricht, Details
- 🔧 **Network Error**: URL, Endpoint, Fehlermeldung

## 📊 TypeScript-Typen

Alle API-Typen sind vollständig typisiert:

```typescript
import type { 
  Drink, 
  Category, 
  Location, 
  Highlight, 
  User,
  PaginatedResponse,
  ApiError 
} from '../services/api';
```

## 🔄 Migration von alten API-Services

Alle alten API-Dateien wurden deprecated:
- ❌ `api-alternative.ts` → ✅ `api.ts`
- ❌ `api-simple.ts` → ✅ `api.ts`
- ❌ `cloudflare-api.ts` → ✅ `api.ts`
- ❌ `unified-api.ts` → ✅ `api.ts`

Die alten Dateien leiten nur noch zum neuen Service weiter.

## 🚀 Best Practices

### 1. Hooks verwenden
```typescript
// ✅ Gut - React Hook verwenden
const { data, loading, error } = useDrinks();

// ❌ Schlecht - Direkt API in Component
useEffect(() => {
  api.getDrinks().then(setDrinks);
}, []);
```

### 2. Fehlerbehandlung
```typescript
// ✅ Gut - Strukturierte Fehlerbehandlung
try {
  const result = await api.createDrink(data);
  toast.success('Getränk erstellt!');
} catch (error) {
  const message = ApiUtils.handleApiError(error);
  toast.error(message);
}
```

### 3. TypeScript nutzen
```typescript
// ✅ Gut - Typen verwenden
const drinks: Drink[] = await api.getDrinks();

// ❌ Schlecht - any verwenden
const drinks: any = await api.getDrinks();
```

### 4. Debug-Modus nutzen
```bash
# Für Entwicklung
VITE_DEBUG=true

# Für Produktion
VITE_DEBUG=false
```

## 📝 Changelog

### Version 2.0.0 (Aktuell)
- ✅ Einheitlicher API Service
- ✅ Server Token Authentication
- ✅ Vollständige TypeScript-Typisierung
- ✅ Strukturierte Fehlerbehandlung
- ✅ Debug-Funktionalität
- ✅ Utility-Funktionen
- ✅ React Hook Integration
- ❌ Entfernung aller Legacy-APIs
- ❌ Keine Cloudflare-Fallbacks mehr

### Version 1.x (Legacy)
- ❌ Multiple API-Dateien
- ❌ Inkonsistente Authentifizierung
- ❌ Komplexe Fallback-Mechanismen
- ❌ Begrenzte Typisierung