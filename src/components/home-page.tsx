import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star, MapPin, Clock, Gift, Instagram, Mail, Loader2 } from 'lucide-react';
import { MysticalEffects, CauldronBubble } from './mystical-effects';
import { useHighlights, useCategories, useCurrentLocation, useInstagramFeed, useApiMutation } from '../hooks/useApi';
import { api } from '../services/api';
import { toast } from 'sonner@2.0.3';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
}

export function HomePage({ setCurrentPage }: HomePageProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  
  // API Hooks
  const { data: highlights, loading: highlightsLoading, error: highlightsError } = useHighlights();
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: currentLocation, loading: locationLoading } = useCurrentLocation();
  const { data: instagramFeed, loading: instagramLoading } = useInstagramFeed();
  
  // Newsletter subscription
  const { mutate: subscribeNewsletter, loading: subscribing } = useApiMutation();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    const result = await subscribeNewsletter(
      (email: string) => api.subscribeNewsletter(email),
      newsletterEmail
    );

    if (result) {
      toast.success('Newsletter-Anmeldung erfolgreich! Bitte bestätigen Sie Ihre E-Mail.');
      setNewsletterEmail('');
    } else {
      toast.error('Fehler bei der Newsletter-Anmeldung. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden mystical-atmosphere">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://i.imgur.com/V1E1VmF.jpeg')`
          }}
        />
        <div className="absolute inset-0 bg-black/80" />
        
        {/* Mystical Effects */}
        <MysticalEffects intensity="high" />
        
        {/* Additional dark mystical overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        
        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="flex flex-col items-center mb-6"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            <motion.img 
              src="https://i.imgur.com/XBQnuUJ.png"
              alt="Gifthütte Logo"
              className="h-32 md:h-48 w-auto mb-4 drop-shadow-2xl"
              animate={{
                filter: [
                  "drop-shadow(0 0 20px rgba(34, 197, 94, 0.3))",
                  "drop-shadow(0 0 40px rgba(34, 197, 94, 0.6))",
                  "drop-shadow(0 0 20px rgba(34, 197, 94, 0.3))"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Mystical sparkles around logo */}
            <motion.div
              className="absolute -top-4 left-1/4 w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1,
              }}
            />
            <motion.div
              className="absolute -bottom-4 right-1/3 w-1.5 h-1.5 bg-accent rounded-full"
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 2,
              }}
            />
          </motion.div>
          
          <motion.div
            className="text-xl md:text-2xl mb-8 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Mobile Bar • Einzigartige Cocktails • Unvergessliche Momente
          </motion.div>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="mystical-glow pulse-poison spell-cast"
                onClick={() => setCurrentPage('drinks')}
              >
                <motion.span
                  animate={{
                    textShadow: [
                      "0 0 5px rgba(34, 197, 94, 0.5)",
                      "0 0 15px rgba(34, 197, 94, 0.8)",
                      "0 0 5px rgba(34, 197, 94, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Unsere Getränke entdecken
                </motion.span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline"
                className="mystical-card border-primary/50 hover:border-primary"
                onClick={() => setCurrentPage('contact')}
              >
                Kontakt aufnehmen
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Mobile Bar</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Event-abhängig</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Einzigartige Kreationen</span>
            </div>
          </motion.div>
          

        </motion.div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Unsere <span className="text-primary">Highlights</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie unsere beliebtesten und einzigartigsten Cocktail-Kreationen
            </p>
          </motion.div>

          {highlightsLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : highlightsError ? (
            <div className="text-center py-16">
              <p className="text-red-400">Fehler beim Laden der Highlights</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {highlights?.map((highlight, index) => (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="overflow-hidden mystical-card wood-texture border-primary/20 relative">
                    <CardContent className="p-6 relative">
                      <h3 className="text-xl font-bold mb-2">
                        {highlight.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{highlight.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant={highlight.isActive ? "default" : "secondary"}>
                            {highlight.isActive ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:border-primary"
                            onClick={() => setCurrentPage('drinks')}
                          >
                            Entdecken
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Unsere <span className="text-primary">Kategorien</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Von klassischen Cocktails bis zu unseren eigenen Kreationen
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesLoading ? (
              <div className="col-span-full flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : categoriesError ? (
              <div className="col-span-full text-center py-16">
                <p className="text-red-400">Fehler beim Laden der Kategorien</p>
              </div>
            ) : (
              categories?.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                  onClick={() => setCurrentPage('drinks')}
                >
                  <Card className="text-center p-8 mystical-card wood-texture border-primary/20 hover:border-primary/50 transition-colors relative overflow-hidden">
                    {/* Mystical background effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
                      animate={{
                        background: [
                          "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, transparent 50%, rgba(22, 163, 74, 0.05) 100%)",
                          "linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, transparent 50%, rgba(34, 197, 94, 0.05) 100%)",
                          "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, transparent 50%, rgba(22, 163, 74, 0.05) 100%)"
                        ]
                      }}
                      transition={{ duration: 6, repeat: Infinity }}
                    />
                    
                    {/* Floating bubble */}
                    <motion.div
                      className="absolute top-2 right-2"
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.3, 0.7, 0.3]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <CauldronBubble size="small" />
                    </motion.div>
                    
                    <motion.div 
                      className="text-4xl mb-4"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      🧪
                    </motion.div>
                    <motion.h3 
                      className="text-lg font-bold mb-2"
                      whileHover={{
                        textShadow: "0 0 8px rgba(34, 197, 94, 0.6)"
                      }}
                    >
                      {category.name}
                    </motion.h3>
                    <motion.p 
                      className="text-muted-foreground"
                      animate={{
                        color: ["rgb(156, 163, 175)", "rgb(34, 197, 94)", "rgb(156, 163, 175)"]
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                    >
                      Kategorie
                    </motion.p>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Die Geschichte der <span className="text-primary">Gifthütte</span>
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                Was als verrückte Idee begann, ist heute eine der einzigartigsten mobilen Bars 
                in der Region. Die Gifthütte vereint das rustikale Flair eines alten Pubs 
                mit der Kreativität moderner Mixologie.
              </p>
              <p>
                Unsere mobile Bar wandert von Event zu Event und bringt dabei eine 
                geheimnisvolle Atmosphäre mit. Jeder Cocktail ist eine kleine Alchemie, 
                jede Zutat wird sorgfältig ausgewählt.
              </p>
              <p>
                Das charakteristische grüne Logo mit dem tropfenden "Gift" steht für 
                unsere Leidenschaft, außergewöhnliche Getränke zu kreieren, die 
                unvergessliche Momente schaffen.
              </p>
            </div>
            <Button 
              size="lg" 
              className="mt-6"
              onClick={() => setCurrentPage('contact')}
            >
              Mehr erfahren
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-lg overflow-hidden mystical-glow relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1755414717736-0d3ffe1f5a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjB3b29kZW4lMjBwdWIlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc2MTExMjV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Gifthütte Interior"
                className="w-full h-full object-cover"
              />
              
              {/* Mystical overlay effects */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-primary/20" />
              <MysticalEffects intensity="low" showFog={false} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <Instagram className="inline h-12 w-12 mr-4 text-primary" />
              Instagram <span className="text-primary">Highlights</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Folgen Sie uns für die neuesten Kreationen und Events
            </p>
          </motion.div>

          {instagramLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : instagramFeed && instagramFeed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {instagramFeed.slice(0, 6).map((post, index) => (
                <motion.div
                  key={post.id || index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="overflow-hidden mystical-card wood-texture border-primary/20 mystical-glow">
                    <div className="aspect-square">
                      <ImageWithFallback
                        src={post.image || post.media_url || "https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080"}
                        alt={`Instagram Post ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm mb-2">{post.caption || post.text || "Neue Kreation! 🧪✨"}</p>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm">{post.likes || post.like_count || Math.floor(Math.random() * 300 + 50)} Likes</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            // Fallback für wenn Instagram-Feed nicht verfügbar ist
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  image: "https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
                  caption: "Neue Kreation: Waldmeister Zauber! 🧪✨",
                  likes: 234,
                },
                {
                  image: "https://images.unsplash.com/photo-1755414717736-0d3ffe1f5a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjB3b29kZW4lMjBwdWIlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc2MTExMjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
                  caption: "Unsere gemütliche Atmosphäre 🏠",
                  likes: 189,
                },
                {
                  image: "https://images.unsplash.com/photo-1681821675154-5f50ede43f6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGdsYXNzJTIwZGFyayUyMGJhcnxlbnwxfHx8fDE3NTc2MTExMjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
                  caption: "Perfekt für den Abend! 🌙",
                  likes: 156,
                },
              ].map((post, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="overflow-hidden mystical-card wood-texture border-primary/20 mystical-glow">
                    <div className="aspect-square">
                      <ImageWithFallback
                        src={post.image}
                        alt={`Fallback Post ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm mb-2">{post.caption}</p>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm">{post.likes} Likes</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Current Location Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <MapPin className="inline h-12 w-12 mr-4 text-primary" />
              Wo sind wir <span className="text-primary">heute?</span>
            </h2>
          </motion.div>

          {locationLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : currentLocation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 text-center mystical-card wood-texture border-primary/30">
                <h3 className="text-2xl font-bold mb-2">{currentLocation.name}</h3>
                <p className="text-xl text-muted-foreground mb-4">{currentLocation.address}</p>
                <p className="text-lg">{currentLocation.city}</p>
                <Badge className="mt-4 bg-primary text-primary-foreground">
                  Aktueller Standort
                </Badge>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 text-center mystical-card wood-texture border-primary/30">
                <p className="text-xl text-muted-foreground">
                  Zur Zeit sind wir nicht vor Ort. Schauen Sie bald wieder vorbei oder kontaktieren Sie uns für Events!
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setCurrentPage('contact')}
                >
                  Kontakt aufnehmen
                </Button>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="p-12 mystical-card wood-texture border-primary/20 mystical-glow relative overflow-hidden">
              {/* Background mystical effect */}
              <MysticalEffects intensity="medium" showFog={false} />
              
              <div>
                <Gift className="h-12 w-12 text-primary mx-auto mb-6" />
              </div>
              <motion.h2 
                className="text-4xl font-bold mb-4 mystical-text"
                animate={{
                  textShadow: [
                    "0 0 15px rgba(34, 197, 94, 0.5)",
                    "0 0 25px rgba(34, 197, 94, 0.8)",
                    "0 0 15px rgba(34, 197, 94, 0.5)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Newsletter & <span className="text-primary">Gewinnspiel</span>
              </motion.h2>
              <p className="text-xl text-muted-foreground mb-8">
                Melden Sie sich für unseren Newsletter an und gewinnen Sie einen 
                kostenlosen Cocktail-Abend für zwei Personen!
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Ihre E-Mail-Adresse"
                  className="flex-1"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    type="submit" 
                    className="mystical-glow pulse-poison"
                    disabled={subscribing}
                  >
                    {subscribing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    <motion.span
                      animate={{
                        textShadow: [
                          "0 0 5px rgba(26, 15, 10, 0.5)",
                          "0 0 10px rgba(26, 15, 10, 0.8)",
                          "0 0 5px rgba(26, 15, 10, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {subscribing ? 'Wird gesendet...' : 'Anmelden'}
                    </motion.span>
                  </Button>
                </motion.div>
              </form>
              
              <p className="text-sm text-muted-foreground mt-4">
                Keine Sorge, wir spammen nicht! Nur die besten Updates und Gewinnchancen.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}