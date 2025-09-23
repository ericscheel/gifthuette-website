import React, { useState, useEffect } from 'react';
import { X, Settings, Cookie, Shield, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('gifthuette-cookie-consent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveCookieConsent(allAccepted);
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    saveCookieConsent(necessaryOnly);
    setIsVisible(false);
  };

  const saveCustomPreferences = () => {
    saveCookieConsent(preferences);
    setShowSettings(false);
    setIsVisible(false);
  };

  const saveCookieConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('gifthuette-cookie-consent', JSON.stringify({
      preferences: prefs,
      timestamp: new Date().toISOString(),
    }));
    
    // Here you would typically integrate with your analytics/marketing tools
    console.log('Cookie preferences saved:', prefs);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
        <Card className="mystical-card wood-texture relative overflow-hidden max-w-4xl mx-auto">
          {/* Mystical background effects */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-2 left-4 w-2 h-2 bg-poison-green-light rounded-full poison-bubble" />
            <div className="absolute top-6 right-8 w-1 h-1 bg-slime-green rounded-full floating-particles" />
            <div className="absolute bottom-4 left-12 w-1.5 h-1.5 bg-poison-green rounded-full poison-bubble" style={{ animationDelay: '2s' }} />
            <div className="absolute top-4 right-16 w-1 h-1 bg-poison-green-light rounded-full floating-particles" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative p-6">
            <div className="flex items-start gap-4">
              {/* Cookie Icon with mystical glow */}
              <div className="flex-shrink-0 p-3 rounded-full bg-poison-green/20 border border-poison-green/30 mystical-glow">
                <Cookie className="w-6 h-6 text-poison-green-light pulse-poison" />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="mystical-text mb-2">
                    🧪 Mystische Cookies & Zaubertränke
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Die Gifthütte verwendet magische Cookies und ähnliche Zaubertechnologien, um Ihren Besuch zu verbessern, 
                    die Wirksamkeit unserer Tränke zu analysieren und personalisierte Inhalte zu servieren. 
                    Durch die Nutzung unserer Website stimmen Sie der Verwendung dieser digitalen Zutaten zu.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={acceptAll}
                    className="bg-poison-green hover:bg-poison-green-dark text-background mystical-glow spell-cast"
                  >
                    ✨ Alle Zaubertränke akzeptieren
                  </Button>
                  
                  <Button
                    onClick={acceptNecessary}
                    variant="outline"
                    className="border-poison-green/30 text-poison-green-light hover:bg-poison-green/10"
                  >
                    🛡️ Nur notwendige Zutaten
                  </Button>
                  
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="ghost"
                    className="text-muted-foreground hover:text-poison-green-light"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Rezept anpassen
                  </Button>
                </div>
              </div>

              {/* Close button */}
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-poison-green-light"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Decorative drip effect */}
          <div className="absolute -top-2 left-1/4 w-1 h-8 bg-gradient-to-b from-poison-green/50 to-transparent drip-animation" />
          <div className="absolute -top-1 right-1/3 w-0.5 h-6 bg-gradient-to-b from-slime-green/40 to-transparent drip-animation" style={{ animationDelay: '1s' }} />
        </Card>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="mystical-card wood-texture max-w-2xl">
          <DialogHeader>
            <DialogTitle className="mystical-text flex items-center gap-2">
              <Settings className="w-5 h-5 text-poison-green-light" />
              🧪 Zaubertrank-Einstellungen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/30 border border-poison-green/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-poison-green-light mt-0.5 mystical-glow" />
                  <div className="space-y-1">
                    <h4 className="text-poison-green-light">Notwendige Zutaten</h4>
                    <p className="text-sm text-muted-foreground">
                      Grundlegende Cookies für die Funktionalität der Gifthütte. Diese können nicht deaktiviert werden, 
                      da sonst die magischen Eigenschaften der Website verloren gehen.
                    </p>
                  </div>
                </div>
                <Switch checked={preferences.necessary} disabled />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/30 border border-poison-green/20">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-poison-green-light mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-poison-green-light">Analyse-Tränke</h4>
                    <p className="text-sm text-muted-foreground">
                      Helfen uns zu verstehen, wie Besucher unsere magische Stätte nutzen, 
                      damit wir die Wirksamkeit unserer Tränke verbessern können.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, analytics: checked }))
                  }
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/30 border border-poison-green/20">
                <div className="flex items-start gap-3">
                  <Cookie className="w-5 h-5 text-poison-green-light mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-poison-green-light">Verzauberungs-Elixiere</h4>
                    <p className="text-sm text-muted-foreground">
                      Ermöglichen es uns, Ihnen personalisierte Angebote und magische Empfehlungen 
                      zu senden, die auf Ihren Vorlieben basieren.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-poison-green/20">
              <Button
                onClick={saveCustomPreferences}
                className="bg-poison-green hover:bg-poison-green-dark text-background mystical-glow"
              >
                ✨ Einstellungen speichern
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="border-poison-green/30 text-poison-green-light hover:bg-poison-green/10"
              >
                Abbrechen
              </Button>
            </div>
          </div>

          {/* Decorative elements in dialog */}
          <div className="absolute top-4 right-4 w-1 h-1 bg-poison-green-light rounded-full floating-particles" />
          <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-slime-green rounded-full poison-bubble" />
        </DialogContent>
      </Dialog>
    </>
  );
}