# Gifthütte Website - Projektdokumentation

## Projektübersicht

Die Gifthütte ist eine moderne Homepage für eine mobile Bar (Schausteller) mit einem Gift/Pub-Thema. Das Design kombiniert den dunklen Holz-Look einer alten Kneipe mit grünen Gift-Akzenten und einem charakteristischen weiß-grünen Logo mit tropfendem Schleim-Effekt.

### Hauptziele
- Dunkle, mystische Atmosphäre mit passenden Animationen
- Mobile Bar-Präsentation mit Gift/Pub-Thema
- Responsive Design für alle Geräte
- Moderne React-Anwendung mit Tailwind CSS

## Design-System und Theme

### Farbpalette
```css
/* Hauptfarben */
--background: #1a0f0a         /* Dunkler Braun-Hintergrund */
--foreground: #f5f2e8         /* Helles Beige für Text */
--primary: #4ade80            /* Gift-Grün */
--secondary: #3d2617          /* Braun-Sekundär */
--accent: #16a34a             /* Dunkles Grün */

/* Custom Gifthütte Farben */
--poison-green: #22c55e       /* Gift-Grün */
--poison-green-light: #4ade80 /* Helles Gift-Grün */
--poison-green-dark: #16a34a  /* Dunkles Gift-Grün */
--wood-brown: #92400e         /* Holz-Braun */
--slime-green: #84cc16        /* Schleim-Grün */
```

### Mystische Effekte
- **Mystical Glow**: Sanfte grüne Leuchteffekte
- **Wood Texture**: Holz-Textur für Karten und Elemente
- **Poison Bubble**: Blasen-Animationen
- **Floating Particles**: Schwebende Partikel
- **Fog Effect**: Nebel-Effekte
- **Shadow Flicker**: Flackernde Schatten

## Komponenten-Struktur

### Core-Komponenten
```
/components/
├── App.tsx                 # Hauptkomponente mit Routing
├── navigation.tsx          # Transparente Navigation mit Scroll-Detection
├── home-page.tsx          # Startseite mit Hero-Bereich
├── drinks-page.tsx        # Getränke-Übersicht
├── search-page.tsx        # Suchfunktion
├── contact-page.tsx       # Kontakt und Standort-Info
├── privacy-page.tsx       # Datenschutz (rechtlich)
├── imprint-page.tsx       # Impressum (rechtlich)
└── mystical-effects.tsx   # Mystische Animationen
```

### UI-Komponenten (ShadCN/UI)
Vollständiges Set von 45+ UI-Komponenten für konsistente Benutzeroberfläche.

## Implementierte Features

### 1. Hero-Bereich (Homepage)
- **Vollbildschirmfüllender Hero** mit Hintergrundbild
- **Logo-Integration** mit animiertem Glow-Effekt
- **Mystische Effekte** als Overlay
- **Call-to-Action Buttons** mit Hover-Animationen
- **Responsive Design** für alle Bildschirmgrößen

### 2. Navigation
- **Transparente Navigation** bei Scroll-Top
- **Scroll-Detection**: Wechsel zu dunklem Hintergrund beim Scrollen
- **Farbwechsel**: Weiße Schrift → normale Schriftfarbe
- **Mobile-responsive** Hamburger-Menü

### 3. Getränke-Highlights
- **Signature Cocktails** mit Bildern und Preisen
- **Kategorisierung** mit Icons und Zählern
- **Hover-Effekte** mit mystischen Animationen
- **Responsive Grid-Layout**

### 4. Instagram-Integration
- **Instagram-ähnliche** Karten-Darstellung
- **Like-Zähler** und Beschreibungen
- **Hover-Animationen**

### 5. Newsletter-Bereich
- **Gewinnspiel-Integration**
- **E-Mail-Eingabe** mit mystischen Effekten
- **Call-to-Action** mit animierten Buttons

## Mystische Animationen im Detail

### CSS-Keyframes
```css
/* Wichtigste Animationen */
@keyframes mysticalGlow       /* Leuchteffekte */
@keyframes poisonBubble       /* Blasen-Animation */
@keyframes floatingParticles  /* Schwebende Partikel */
@keyframes fogRoll           /* Nebel-Bewegung */
@keyframes pulsePoison       /* Pulsierender Effekt */
@keyframes shadowFlicker     /* Flackernde Schatten */
@keyframes spellCast         /* Zauber-Cast Animation */
@keyframes cauldronBubble    /* Kessel-Blasen */
```

### Mystical Effects Komponente
- **Intensity-Level**: low, medium, high
- **Partikel-System**: Schwebende grüne Punkte
- **Blasen-Effekte**: Verschiedene Größen und Geschwindigkeiten
- **Nebel-Overlay**: Optionale Nebel-Effekte
- **Performance-optimiert**: Wiederverwendbare Animationen

## Technische Implementierung

### Framework & Libraries
- **React 18** mit TypeScript
- **Tailwind CSS v4.0** für Styling
- **Motion/React** für Animationen (ehemals Framer Motion)
- **Lucide React** für Icons
- **ShadCN/UI** für UI-Komponenten

### Routing-System
```typescript
// Einfaches State-basiertes Routing
const [currentPage, setCurrentPage] = useState('home');

// Seiten: home, drinks, search, contact, privacy, imprint
```

### Responsive Design
- **Mobile-First** Ansatz
- **Breakpoints**: sm, md, lg, xl
- **Flexible Grids**: CSS Grid und Flexbox
- **Skalierbare Typographie**

## Aktuelle Features im Detail

### Homepage-Sektionen
1. **Hero-Bereich**
   - Vollbild-Hintergrundbild
   - Logo mit animiertem Glow
   - Mystische Partikel-Effekte
   - CTA-Buttons mit Hover-Animationen

2. **Highlights-Sektion**
   - 3 Signature Cocktails
   - Produktkarten mit Bildern
   - Preise und Alkoholgehalt
   - Hover-Animationen

3. **Kategorien-Sektion**
   - 4 Hauptkategorien
   - Icons und Getränke-Zähler
   - Mystische Hintergrund-Effekte
   - Click-Navigation zu Getränke-Seite

4. **Story-Sektion**
   - Zweispaltige Layout
   - Text + Bild
   - Mystische Overlay-Effekte

5. **Instagram-Sektion**
   - 3 Instagram-Posts
   - Like-Zähler
   - Hover-Effekte

6. **Newsletter-Sektion**
   - E-Mail-Eingabe
   - Gewinnspiel-Information
   - Mystische Button-Animationen

### Navigation Features
- **Scroll-Detection**: Transparenz-Wechsel
- **Active-State**: Aktuelle Seite hervorgehoben
- **Mobile-Menu**: Responsive Hamburger-Menü
- **Smooth-Transitions**: Sanfte Übergänge

## Performance-Optimierungen

### Bild-Optimierung
- **ImageWithFallback-Komponente** für robuste Bilddarstellung
- **Unsplash-Integration** für hochwertige Placeholder-Bilder
- **Lazy Loading** für bessere Performance

### Animation-Performance
- **CSS-Animationen** statt JavaScript für bessere Performance
- **Transform-basierte** Animationen für GPU-Beschleunigung
- **Wiederverwendbare** Animation-Klassen

## Geplante Features (Roadmap)

### Kurzfristig
- [x] ~~Scroll-Down Animation entfernen~~ ✅ Erledigt
- [ ] Getränke-Seite mit API-Anbindung
- [ ] Suchfunktion implementieren
- [ ] Kontakt-Seite mit Karte

### Mittelfristig
- [ ] Backend-Integration (Supabase)
- [ ] Getränke-Datenbank
- [ ] Admin-Panel für Content-Management
- [ ] Instagram API-Integration

### Langfristig
- [ ] PWA-Features
- [ ] Offline-Funktionalität
- [ ] Push-Notifications für Events
- [ ] Mehrsprachigkeit

## Dateien-Struktur

### Wichtigste Dateien
```
├── App.tsx                    # Hauptkomponente mit Routing
├── components/
│   ├── home-page.tsx         # Startseite (595 Zeilen)
│   ├── navigation.tsx        # Navigation mit Scroll-Detection
│   ├── mystical-effects.tsx  # Wiederverwendbare Effekte
│   └── ui/                   # ShadCN UI-Komponenten
├── styles/
│   └── globals.css           # Tailwind + Custom Styles (500+ Zeilen)
└── guidelines/
    └── Guidelines.md         # Entwicklungsrichtlinien
```

## Custom CSS-Klassen

### Mystische Effekte
```css
.mystical-glow          /* Leuchteffekt */
.mystical-card          /* Dunkle Karte mit Effekten */
.mystical-atmosphere    /* Atmosphären-Overlay */
.mystical-text          /* Text mit Glow-Effekt */
.wood-texture           /* Holz-Textur */
.poison-glow            /* Gift-Leuchteffekt */
.pulse-poison           /* Pulsierender Gift-Effekt */
.spell-cast             /* Zauber-Animation */
.cauldron-bubble        /* Kessel-Blasen */
```

## Lessons Learned

### Erfolgreiche Ansätze
1. **Modulare Komponenten-Struktur** für bessere Wartbarkeit
2. **CSS-Custom-Properties** für konsistente Themes
3. **Motion/React** für flüssige Animationen
4. **ShadCN/UI** für schnelle, konsistente UI-Entwicklung

### Herausforderungen gelöst
1. **Scroll-Detection** für Navigation-Transparenz
2. **Performance** bei vielen Animationen
3. **Responsive Design** mit komplexen Layouts
4. **Dark Theme** mit ausreichend Kontrast

## Deployment-Informationen

### Build-Konfiguration
- **Vite** als Build-Tool
- **TypeScript** für Type-Safety
- **Tailwind CSS** für Styling
- **ES Modules** für optimierte Bundles

### Browser-Kompatibilität
- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 88+
- **Features**: CSS Grid, Flexbox, CSS Custom Properties

## Nächste Schritte

### Sofortige Prioritäten
1. **Getränke-Seite** ausbauen mit dynamischem Content
2. **Suchfunktion** implementieren
3. **Kontakt-Seite** mit Standort-Integration
4. **Backend-Anbindung** evaluieren

### Code-Qualität
- **TypeScript** Typisierung vervollständigen
- **Performance-Monitoring** einrichten
- **Accessibility** verbessern
- **SEO-Optimierung** implementieren

---

**Projekt-Status**: ✅ MVP Fertig | 🚧 In Entwicklung | 📋 Geplant

**Letzte Aktualisierung**: 11. September 2025

**Entwickelt mit**: React + TypeScript + Tailwind CSS + Motion