# Gifthütte Website - Lokales Setup

## 1. Projekt-Initialisierung

### React-Projekt erstellen
```bash
# Neues React-Projekt mit TypeScript erstellen
npx create-react-app gifthuette-website --template typescript

# In das Projektverzeichnis wechseln
cd gifthuette-website
```

### Alternative mit Vite (empfohlen für bessere Performance)
```bash
# Mit Vite (schneller und moderner)
npm create vite@latest gifthuette-website -- --template react-ts
cd gifthuette-website
npm install
```

## 2. Dependencies installieren

### Core Dependencies
```bash
# React und TypeScript (bereits installiert bei Template)
npm install react@^18 react-dom@^18 typescript@^5

# Tailwind CSS v4.0 (neueste Version)
npm install tailwindcss@next @tailwindcss/postcss@next

# ShadCN/UI Dependencies
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio
npm install @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible
npm install @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar
npm install @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress
npm install @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select
npm install @radix-ui/react-separator @radix-ui/react-sheet @radix-ui/react-slider
npm install @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast
npm install @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip

# Class Variance Authority (für ShadCN)
npm install class-variance-authority clsx tailwind-merge

# Icons
npm install lucide-react

# Toast Notifications
npm install sonner@2.0.3

# Charts und Grafiken
npm install recharts

# Form Handling
npm install react-hook-form@7.55.0 @hookform/resolvers zod

# Animation
npm install motion/react

# Date Handling
npm install date-fns

# Input Components
npm install input-otp
```

### Development Dependencies
```bash
npm install --save-dev @types/react @types/react-dom @types/node
npm install --save-dev postcss autoprefixer
```

## 3. Projekt-Struktur erstellen

### Grundverzeichnisse erstellen
```bash
mkdir -p src/components/ui
mkdir -p src/components/figma
mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/styles
mkdir -p src/guidelines
```

### Wichtige Konfigurationsdateien

#### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### `postcss.config.js`
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### `.env` (für API-Konfiguration)
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.gifthuette.de
REACT_APP_API_VERSION=v1
REACT_APP_ENVIRONMENT=development

# Optional: Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Core-Dateien kopieren

### Wichtige Dateien in der richtigen Reihenfolge erstellen:

1. **`src/styles/globals.css`** - Gesamtes Styling-System
2. **`src/components/ui/`** - Alle ShadCN UI-Komponenten
3. **`src/components/figma/ImageWithFallback.tsx`** - Für Bilder
4. **`src/utils/env.ts`** - Environment-Utilities
5. **`src/hooks/useApi.ts`** - API-Hook
6. **`src/services/`** - API-Services
7. **`src/components/`** - Alle Page-Komponenten
8. **`src/App.tsx`** - Haupt-App-Komponente

## 5. ShadCN/UI Setup

### ShadCN/UI initialisieren
```bash
# ShadCN CLI installieren
npm install -g @shadcn/ui@latest

# ShadCN initialisieren (optional, da Komponenten bereits vorhanden)
npx shadcn@latest init

# Einzelne Komponenten hinzufügen (falls benötigt)
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
# etc.
```

## 6. Datei-Mappings

### Component-Struktur
```
src/
├── components/
│   ├── ui/                     # ShadCN UI Komponenten
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── figma/                  # Figma-spezifische Komponenten
│   │   └── ImageWithFallback.tsx
│   ├── navigation.tsx          # Hauptnavigation
│   ├── home-page.tsx           # Startseite
│   ├── drinks-page.tsx         # Getränke-Übersicht
│   ├── search-page.tsx         # Suchfunktion
│   ├── contact-page.tsx        # Kontaktseite
│   ├── admin-page-enhanced.tsx # Admin-Panel
│   ├── login-page.tsx          # Login
│   └── ...                     # Weitere Seiten
├── services/
│   ├── api.ts                  # Haupt-API-Service
│   ├── unified-api.ts          # Unified API mit Fallback
│   └── ...
├── hooks/
│   └── useApi.ts               # API-Hook für Authentication
├── utils/
│   └── env.ts                  # Environment-Utilities
└── styles/
    └── globals.css             # Globale Styles mit Tailwind
```

## 7. Entwicklung starten

### Development Server starten
```bash
npm start
# oder bei Vite:
npm run dev
```

### Build für Produktion
```bash
npm run build
```

## 8. Wichtige Features

### Implementierte Funktionalitäten:
- ✅ **Responsive Design** mit dunklem Gifthütte-Theme
- ✅ **Navigation** zwischen allen Seiten
- ✅ **API-Integration** mit Fallback-Mechanismen
- ✅ **Admin-Panel** mit CRUD-Funktionalitäten
- ✅ **Authentication** System
- ✅ **Toast-Benachrichtigungen**
- ✅ **Mystische Animationen** und Effekte
- ✅ **Suchfunktion** für Getränke
- ✅ **Debug-Tools** für API-Probleme
- ✅ **Certificate-basierte** API-Authentifizierung

### Design-System:
- **Farbpalette**: Dunkle Holz-Töne mit Gift-grünen Akzenten
- **Typografie**: Optimiert für Lesbarkeit im dunklen Theme
- **Animationen**: Subtile mystische Effekte ohne Überladung
- **Components**: Vollständige ShadCN/UI Integration

## 9. API-Konfiguration

Die Website ist für die Verwendung mit `https://api.gifthuette.de` konfiguriert. Die API-Services haben mehrere Fallback-Mechanismen:

1. **Haupt-API**: Direkte Verbindung
2. **Cloudflare-Proxy**: Alternative Route
3. **Mock-Data**: Fallback für Development

## 10. Deployment

### Vercel (empfohlen)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=build
```

## 11. Einheitliche API-Konfiguration (v2.0)

### Neue API-Struktur:
Die Website verwendet jetzt eine **einheitliche API-Datei** (`/services/api.ts`) mit:
- ✅ **Server Token Authentication** (DE-GH-FRONTEND)
- ✅ **Strukturierte TypeScript-Typen**
- ✅ **Umfassende Fehlerbehandlung**
- ✅ **Debug-Funktionalität**
- ✅ **Utility-Funktionen**

### Environment-Variablen (.env):
```bash
# Gifthütte API Configuration
VITE_API_BASE_URL=https://api.gifthuette.de

# Server Token (DE-GH-FRONTEND: read, write, analytics, newsletter)
VITE_GIFTHUETTE_SERVER_TOKEN=gifthuette_frontend_21841292325c61f529223b7d04abe9b495f99e21d654948c

# Development Settings
VITE_NODE_ENV=development
VITE_DEBUG=true
```

### API-Features:
- **Drinks Management**: CRUD-Operationen für Getränke
- **Categories**: Kategorie-Verwaltung
- **Locations**: Mobile Bar Standorte
- **Highlights**: Besondere Angebote
- **Search & Analytics**: Suche und Statistiken
- **Authentication**: Benutzer-Login für Admin-Bereich

### Debug-Ausgaben:
Bei `VITE_DEBUG=true` erhalten Sie detaillierte Logs:
- 🚀 API-Requests mit Method und URL
- ✅ Erfolgreiche Responses
- ❌ Fehler mit Details
- 🔧 Token-Validierung

### Troubleshooting:
- **Token-Fehler**: Browser-Konsole prüfen für Token-Validierung
- **Network-Errors**: API-Base-URL korrekt? Token vorhanden?
- **403 Forbidden**: Server Token Berechtigungen prüfen
- **CORS-Issues**: Server Token sollte CORS-Probleme vermeiden

### API-Konfiguration:
- Verwendet ausschließlich Server Token Authentication
- Keine CORS/Cloudflare Fallbacks mehr
- Vereinfachte Fehlerbehandlung
- Direkte API-Verbindung zu `api.gifthuette.de`

---

## Quick Start Kommandos

```bash
# 1. Projekt erstellen
npx create-react-app gifthuette-website --template typescript
cd gifthuette-website

# 2. Dependencies installieren
npm install tailwindcss@next @tailwindcss/postcss@next
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog # ... (alle anderen)
npm install lucide-react sonner@2.0.3 recharts react-hook-form@7.55.0

# 3. Dateien kopieren (aus Figma Make Projekt)
# - Alle Komponenten von /components/
# - Alle Services von /services/
# - Styles von /styles/globals.css
# - App.tsx

# 4. Starten
npm start
```

Die Website sollte nun unter `http://localhost:3000` erreichbar sein!