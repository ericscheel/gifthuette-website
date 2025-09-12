import React, { useState } from 'react';
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
  Send
} from 'lucide-react';

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

  // Mock data for current locations/events
  const currentLocations = [
    {
      id: 1,
      name: "Stadtfest Mannheim",
      address: "Marktplatz, 68159 Mannheim",
      dates: "15. - 17. September 2025",
      hours: "18:00 - 24:00 Uhr",
      status: "Aktuell vor Ort",
      description: "Drei Tage voller Geschmack und guter Stimmung!",
      image: "https://images.unsplash.com/photo-1755414717736-0d3ffe1f5a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjB3b29kZW4lMjBwdWIlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc2MTExMjV8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 2,
      name: "Nachtmarkt Heidelberg",
      address: "Bismarckplatz, 69115 Heidelberg",
      dates: "20. - 22. September 2025",
      hours: "19:00 - 02:00 Uhr",
      status: "Nächster Standort",
      description: "Die perfekte Location für unsere nächtlichen Kreationen",
      image: "https://images.unsplash.com/photo-1681821675154-5f50ede43f6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGdsYXNzJTIwZGFyayUyMGJhcnxlbnwxfHx8fDE3NTc2MTExMjV8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  const upcomingEvents = [
    {
      date: "25. September 2025",
      event: "Oktoberfest Karlsruhe",
      location: "Festplatz am Zoo",
      time: "16:00 - 01:00 Uhr"
    },
    {
      date: "2. Oktober 2025",
      event: "Halloween Market Stuttgart", 
      location: "Schlossplatz",
      time: "18:00 - 24:00 Uhr"
    },
    {
      date: "15. Oktober 2025",
      event: "Herbstmarkt Pforzheim",
      location: "Marktplatz",
      time: "14:00 - 22:00 Uhr"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    alert('Nachricht gesendet! Wir melden uns bald bei Ihnen.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      event: '',
      date: '',
      message: ''
    });
  };

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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {currentLocations.map((location, index) => (
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
                        src={location.image}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge 
                        className={`absolute top-4 left-4 ${
                          location.status === "Aktuell vor Ort" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {location.status}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{location.name}</h3>
                      <p className="text-muted-foreground mb-4">{location.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <span>{location.address}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span>{location.dates}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>{location.hours}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="p-6 bg-card wood-texture border-primary/20 hover:border-primary/50 transition-colors">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-2">{event.date}</div>
                      <h3 className="font-bold mb-2">{event.event}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
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
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="E-Mail-Adresse"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Telefonnummer"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="date"
                    type="date"
                    placeholder="Gewünschtes Datum"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <Input
                  name="event"
                  placeholder="Art der Veranstaltung"
                  value={formData.event}
                  onChange={handleInputChange}
                />
                
                <Textarea
                  name="message"
                  placeholder="Beschreiben Sie Ihr Event (Anzahl Gäste, Location, besondere Wünsche...)"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
                
                <Button type="submit" className="w-full poison-glow">
                  <Send className="h-4 w-4 mr-2" />
                  Anfrage senden
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