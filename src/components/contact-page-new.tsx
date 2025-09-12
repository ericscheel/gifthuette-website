import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook,
  Calendar,
  Star,
  Send,
  Loader2
} from 'lucide-react';
import { api, type Location, ApiUtils } from '../services/api';

interface ContactPageProps {
  setCurrentPage: (page: string) => void;
}

export function ContactPage({ setCurrentPage }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event: '',
    date: '',
    message: ''
  });

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [upcomingLocations, setUpcomingLocations] = useState<Location[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load location data from API
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all location data in parallel
        const [current, upcoming, all] = await Promise.all([
          api.getCurrentLocation(),
          api.getUpcomingLocations(),
          api.getLocations()
        ]);

        setCurrentLocation(current);
        setUpcomingLocations(upcoming);
        setAllLocations(all);
      } catch (err) {
        console.error('Error loading location data:', err);
        setError('Fehler beim Laden der Standortdaten. Einige Informationen sind möglicherweise nicht verfügbar.');
      } finally {
        setLoading(false);
      }
    };

    loadLocationData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, this is a mock implementation
    // In a real app, you'd want to send this to an API endpoint
    setFormSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Nachricht gesendet! Wir melden uns bald bei Ihnen.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        event: '',
        date: '',
        message: ''
      });
    } catch (err) {
      alert('Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Prepare display data with fallbacks for when API data isn't available
  const displayCurrentLocations = currentLocation ? [currentLocation] : [];
  const displayUpcomingEvents = upcomingLocations.slice(0, 3);

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <MapPin className="inline h-12 w-12 mr-4 text-primary" />
              <span className="text-primary">Kontakt</span> & Standorte
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Finden Sie uns auf Events in der Region oder buchen Sie uns für Ihre Veranstaltung
            </p>
          </motion.div>
        </div>
      </section>

      {/* Current Locations */}
      <section className="py-12 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              Aktuelle <span className="text-primary">Standorte</span>
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Lade Standortdaten...</p>
              </div>
            ) : error && displayCurrentLocations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Aktuelle Standortdaten sind temporär nicht verfügbar.
                </p>
                <p className="text-sm text-muted-foreground">
                  Folgen Sie uns auf Social Media für aktuelle Updates!
                </p>
              </div>
            ) : displayCurrentLocations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {displayCurrentLocations.map((location, index) => (
                  <motion.div
                    key={location.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Card className="overflow-hidden bg-card wood-texture border-primary/20 poison-glow">
                      <div className="relative h-48">
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1755414717736-0d3ffe1f5a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjB3b29kZW4lMjBwdWIlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc2MTExMjV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                          alt={location.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge 
                          className="absolute top-4 left-4 bg-primary text-primary-foreground"
                        >
                          {location.isCurrent ? "Aktuell vor Ort" : "Kommender Standort"}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2">{location.name}</h3>
                        <p className="text-muted-foreground mb-4">
                          Besuchen Sie uns an diesem besonderen Standort!
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            <span>{location.address}, {location.city}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-primary" />
                            <span>{ApiUtils.formatDate(location.date)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Derzeit sind wir nicht vor Ort. Schauen Sie bald wieder vorbei!
                </p>
                <p className="text-sm text-muted-foreground">
                  Folgen Sie uns auf Social Media für aktuelle Updates!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              Kommende <span className="text-primary">Events</span>
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Lade Event-Daten...</p>
              </div>
            ) : displayUpcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayUpcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="p-6 bg-card wood-texture border-primary/20 hover:border-primary/50 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {new Date(event.date).toLocaleDateString('de-DE', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </div>
                        <h3 className="font-bold mb-2">{event.name}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center justify-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{event.address}, {event.city}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Kommende Events werden bald bekanntgegeben.
                </p>
                <p className="text-sm text-muted-foreground">
                  Folgen Sie uns auf Social Media, um als Erste über neue Events informiert zu werden!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 bg-card wood-texture border-primary/20">
              <h2 className="text-2xl font-bold mb-6">
                Event <span className="text-primary">Buchung</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Buchen Sie die Gifthütte für Ihr Event! Egal ob Firmenfest, Hochzeit oder 
                private Feier - wir bringen die perfekte Stimmung zu Ihnen.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="name"
                    placeholder="Ihr Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={formSubmitting}
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="E-Mail-Adresse"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={formSubmitting}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Telefonnummer"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={formSubmitting}
                  />
                  <Input
                    name="date"
                    type="date"
                    placeholder="Gewünschtes Datum"
                    value={formData.date}
                    onChange={handleInputChange}
                    disabled={formSubmitting}
                  />
                </div>
                
                <Input
                  name="event"
                  placeholder="Art der Veranstaltung"
                  value={formData.event}
                  onChange={handleInputChange}
                  disabled={formSubmitting}
                />
                
                <Textarea
                  name="message"
                  placeholder="Beschreiben Sie Ihr Event (Anzahl Gäste, Location, besondere Wünsche...)"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  disabled={formSubmitting}
                />
                
                <Button 
                  type="submit" 
                  className="w-full poison-glow" 
                  disabled={formSubmitting}
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Anfrage senden
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Card className="p-8 bg-card wood-texture border-primary/20">
              <h3 className="text-xl font-bold mb-4">Direkter Kontakt</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">Telefon</div>
                    <div className="text-muted-foreground">+49 (0) 123 456 789</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">E-Mail</div>
                    <div className="text-muted-foreground">info@gifthuette.de</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">Service-Gebiet</div>
                    <div className="text-muted-foreground">Baden-Württemberg & Rheinland-Pfalz</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-card wood-texture border-primary/20">
              <h3 className="text-xl font-bold mb-4">Social Media</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Instagram className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">Instagram</div>
                    <div className="text-muted-foreground">@gifthuette_official</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Facebook className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">Facebook</div>
                    <div className="text-muted-foreground">Gifthütte Mobile Bar</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  Folgen Sie uns für aktuelle Standorte, neue Kreationen und Event-Updates!
                </p>
              </div>
            </Card>

            {/* API Status Info */}
            {error && (
              <Card className="p-6 bg-destructive/10 border-destructive/20">
                <h4 className="text-sm font-medium text-destructive mb-2">Hinweis</h4>
                <p className="text-xs text-muted-foreground">
                  Einige Standortdaten sind temporär nicht verfügbar. 
                  Die Kontaktfunktionen sind jedoch voll funktionsfähig.
                </p>
              </Card>
            )}
          </motion.div>
        </div>
      </section>

      {/* Legal Links */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="link"
                onClick={() => setCurrentPage('privacy')}
                className="text-muted-foreground hover:text-primary"
              >
                Datenschutzerklärung
              </Button>
              <Button
                variant="link"
                onClick={() => setCurrentPage('imprint')}
                className="text-muted-foreground hover:text-primary"
              >
                Impressum
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}