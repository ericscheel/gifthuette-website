import React, { useState, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Filter, Star, Eye } from 'lucide-react';
import { MysticalEffects, CauldronBubble } from './mystical-effects';

// Flip Drink Card Component with 3D Tilt
function TiltedDrinkCard({ drink, setSelectedDrink }: { drink: Drink; setSelectedDrink?: (id: number | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const springValues = {
    damping: 25,
    stiffness: 150,
    mass: 0.8
  };

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const flipRotateY = useSpring(0, { damping: 20, stiffness: 120 });
  const scale = useSpring(1, springValues);

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -8;
    const rotationY = (offsetX / (rect.width / 2)) * 8;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  function handleMouseEnter() {
    scale.set(1.05);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    
    // Auto-flip back to front when mouse leaves and card is flipped
    if (isFlipped) {
      setIsFlipped(false);
      flipRotateY.set(0);
    }
  }

  function handleFlip() {
    setIsFlipped(!isFlipped);
    flipRotateY.set(isFlipped ? 0 : 180);
  }

  return (
    <motion.div
      ref={ref}
      className="[perspective:1000px] cursor-pointer h-80"
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleFlip}
    >
      <motion.div
        className="relative [transform-style:preserve-3d] w-full h-full"
        style={{
          rotateX,
          rotateY: flipRotateY,
          scale
        }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 w-full h-full [backface-visibility:hidden]"
        >
          <Card className="w-full h-full overflow-hidden bg-card wood-texture border-primary/20 hover:border-primary/50 transition-all duration-300 relative">
            {/* Mystical glow effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-lg opacity-0 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, rgba(74, 222, 128, 0.1), rgba(74, 222, 128, 0.05))',
                boxShadow: '0 0 20px rgba(74, 222, 128, 0.2), inset 0 0 20px rgba(74, 222, 128, 0.1)'
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            <div className="relative h-full">
              <ImageWithFallback
                src={drink.image}
                alt={drink.name}
                className="w-full h-full object-cover"
              />
              
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Floating badges with subtle 3D effect */}
              {drink.featured && (
                <motion.div
                  className="absolute top-3 left-3 [transform:translateZ(20px)]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Badge className="bg-primary text-primary-foreground shadow-lg">
                    Signature
                  </Badge>
                </motion.div>
              )}
              
              <motion.div
                className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm shadow-lg [transform:translateZ(15px)]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {drink.alcohol}
              </motion.div>
              
              {/* 3D Floating Product Name and Price */}
              <motion.div
                className="absolute bottom-6 left-6 right-6 [transform:translateZ(25px)]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.h3 
                  className="text-2xl font-bold text-white mb-2 mystical-text"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {drink.name}
                </motion.h3>
                <motion.div
                  className="flex justify-between items-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-3xl font-bold text-primary mystical-text">{drink.price}</span>
                  <div className="flex items-center bg-black/70 text-white px-2 py-1 rounded text-sm">
                    <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                    {drink.rating}
                  </div>
                </motion.div>
              </motion.div>

              {/* Mystical particle overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary rounded-full opacity-60"
                    style={{
                      left: `${15 + i * 25}%`,
                      top: `${20 + i * 20}%`,
                    }}
                    animate={{
                      y: [-5, -15, -5],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* Click to flip indicator - positioned at top center */}
              <motion.div
                className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs opacity-80 backdrop-blur-sm"
                whileHover={{ scale: 1.1, opacity: 1 }}
                animate={{
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ⚗️ Details
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <Card className="w-full h-full overflow-hidden bg-card wood-texture border-primary/20 hover:border-primary/50 transition-all duration-300 relative">
            {/* Mystical glow effect */}
            <motion.div
              className="absolute inset-0 rounded-lg opacity-0 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, rgba(74, 222, 128, 0.1), rgba(74, 222, 128, 0.05))',
                boxShadow: '0 0 20px rgba(74, 222, 128, 0.2), inset 0 0 20px rgba(74, 222, 128, 0.1)'
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            <CardContent className="p-4 h-full flex flex-col relative [transform:translateZ(10px)] overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                <motion.h3 
                  className="text-lg font-bold mystical-text"
                  initial={{ y: 20, opacity: 0 }}
                  animate={isFlipped ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {drink.name}
                </motion.h3>
                
                <motion.p 
                  className="text-xs text-muted-foreground leading-relaxed"
                  initial={{ y: 20, opacity: 0 }}
                  animate={isFlipped ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {drink.description}
                </motion.p>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={isFlipped ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="text-xs font-semibold mb-1 text-primary">Zutaten:</h4>
                  <div className="flex flex-wrap gap-1">
                    {drink.ingredients.slice(0, 3).map((ingredient, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                        {ingredient}
                      </Badge>
                    ))}
                    {drink.ingredients.length > 3 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        +{drink.ingredients.length - 3}
                      </Badge>
                    )}
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={isFlipped ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h4 className="text-xs font-semibold mb-1 text-primary">Kategorien:</h4>
                  <div className="flex flex-wrap gap-1">
                    {drink.categories.slice(0, 2).map((category, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                        {category}
                      </Badge>
                    ))}
                    {drink.categories.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        +{drink.categories.length - 2}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              </div>
              
              {/* Fixed bottom section */}
              <motion.div 
                className="flex justify-between items-center pt-3 border-t border-border/50 mt-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={isFlipped ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-center">
                  <span className="text-lg font-bold text-primary mystical-text">{drink.price}</span>
                  <div className="text-xs text-muted-foreground">{drink.alcohol}</div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDrink?.(drink.id);
                  }}
                >
                  <Button 
                    size="sm" 
                    className="shadow-lg bg-primary hover:bg-primary/90 text-xs px-2 py-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </motion.div>
              </motion.div>

              {/* Floating mystical particles on back */}
              {isFlipped && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={`back-${i}`}
                      className="absolute w-0.5 h-0.5 bg-primary rounded-full opacity-40"
                      style={{
                        left: `${15 + i * 20}%`,
                        top: `${15 + (i % 2) * 40}%`,
                      }}
                      animate={{
                        y: [-3, -8, -3],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 3 + i * 0.2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Click to flip back indicator */}
              <motion.div
                className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm"
                whileHover={{ scale: 1.1, opacity: 1 }}
                animate={{
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ↶
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface Drink {
  id: number;
  name: string;
  description: string;
  price: string;
  alcohol: string;
  ingredients: string[];
  categories: string[];
  specialty: string;
  image: string;
  featured: boolean;
  rating: number;
}

interface DrinksPageProps {
  setCurrentPage: (page: string) => void;
  selectedDrink?: number | null;
  setSelectedDrink?: (id: number | null) => void;
}

export function DrinksPage({ setCurrentPage, selectedDrink, setSelectedDrink }: DrinksPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data - in real app this would come from API
  const drinks: Drink[] = [
    {
      id: 1,
      name: "Giftiger Apfel",
      description: "Unser Signature-Cocktail mit geheimen Zutaten und einem Hauch von Zimt",
      price: "12.50€",
      alcohol: "18%",
      ingredients: ["Apfel-Likör", "Vodka", "Zimt-Sirup", "Limette", "Geheime Zutat"],
      categories: ["Signature Cocktails", "Fruchtig"],
      specialty: "Unsere berühmteste Kreation mit einem mysteriösen grünen Schimmer",
      image: "https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: true,
      rating: 4.9,
    },
    {
      id: 2,
      name: "Schwarze Witwe",
      description: "Ein dunkler Cocktail mit überraschender Süße",
      price: "11.00€",
      alcohol: "22%",
      ingredients: ["Rum", "Blackberry Likör", "Amaretto", "Zitrone", "Dunkler Sirup"],
      categories: ["Signature Cocktails", "Stark"],
      specialty: "Sieht gefährlich aus, schmeckt himmlisch",
      image: "https://images.unsplash.com/photo-1681821675154-5f50ede43f6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGdsYXNzJTIwZGFyayUyMGJhcnxlbnwxfHx8fDE3NTc2MTExMjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: true,
      rating: 4.7,
    },
    {
      id: 3,
      name: "Elixier des Lebens",
      description: "Ein erfrischender Mix aus exotischen Früchten",
      price: "10.50€",
      alcohol: "15%",
      ingredients: ["Mango", "Passionsfrucht", "Vodka", "Minze", "Kokoswasser"],
      categories: ["Signature Cocktails", "Fruchtig", "Erfrischend"],
      specialty: "Bringt Leben in jeden Moment",
      image: "https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: true,
      rating: 4.6,
    },
    {
      id: 4,
      name: "Mojito",
      description: "Der klassische kubanische Cocktail",
      price: "8.50€",
      alcohol: "12%",
      ingredients: ["Weißer Rum", "Minze", "Limette", "Rohrzucker", "Soda"],
      categories: ["Klassische Cocktails", "Erfrischend"],
      specialty: "Zeitlos und erfrischend",
      image: "https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: false,
      rating: 4.5,
    },
    {
      id: 5,
      name: "Whiskey Sour",
      description: "Klassisch mit einer modernen Twist",
      price: "9.00€",
      alcohol: "20%",
      ingredients: ["Bourbon Whiskey", "Zitrone", "Zucker", "Eiweiß", "Angostura"],
      categories: ["Klassische Cocktails", "Stark"],
      specialty: "Mit hausgemachtem Sirup verfeinert",
      image: "https://images.unsplash.com/photo-1681821675154-5f50ede43f6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGdsYXNzJTIwZGFyayUyMGJhcnxlbnwxfHx8fDE3NTc2MTExMjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: false,
      rating: 4.4,
    },
    {
      id: 6,
      name: "Gift-Shot",
      description: "Unser berüchtigter Signature-Shot",
      price: "4.50€",
      alcohol: "35%",
      ingredients: ["Wodka", "Absinth", "Grüner Tee", "Honig", "Limette"],
      categories: ["Shots & Schnäpse", "Signature Cocktails"],
      specialty: "Nur für die Mutigen!",
      image: "https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: true,
      rating: 4.8,
    },
    {
      id: 7,
      name: "Virgin Poison",
      description: "Alkoholfreie Version unseres Signatures",
      price: "6.50€",
      alcohol: "0%",
      ingredients: ["Apfelsaft", "Grüner Tee", "Zimt", "Limette", "Kohlensäure"],
      categories: ["Alkoholfreie Getränke", "Fruchtig"],
      specialty: "Sieht aus wie Gift, schmeckt wie Himmel",
      image: "https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: false,
      rating: 4.3,
    },
    {
      id: 8,
      name: "Jägermeister",
      description: "Der deutsche Klassiker",
      price: "3.50€",
      alcohol: "35%",
      ingredients: ["Jägermeister"],
      categories: ["Shots & Schnäpse", "Klassische Cocktails"],
      specialty: "Eisgekühlt serviert",
      image: "https://images.unsplash.com/photo-1681821675154-5f50ede43f6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGdsYXNzJTIwZGFyayUyMGJhcnxlbnwxfHx8fDE3NTc2MTExMjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: false,
      rating: 4.2,
    },
  ];

  const categories = [
    'all',
    'Signature Cocktails',
    'Klassische Cocktails',
    'Shots & Schnäpse',
    'Alkoholfreie Getränke',
    'Fruchtig',
    'Stark',
    'Erfrischend',
  ];

  const filteredDrinks = useMemo(() => {
    if (selectedCategory === 'all') return drinks;
    return drinks.filter(drink => drink.categories.includes(selectedCategory));
  }, [selectedCategory]);

  // If a specific drink is selected, show detail view
  if (selectedDrink) {
    const drink = drinks.find(d => d.id === selectedDrink);
    if (!drink) return <div>Getränk nicht gefunden</div>;

    return (
      <div className="min-h-screen pt-16 mystical-atmosphere relative">
        <MysticalEffects intensity="medium" />
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <Button 
            variant="outline" 
            onClick={() => setSelectedDrink?.(null)}
            className="mb-8"
          >
            ← Zurück zur Übersicht
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-square rounded-lg overflow-hidden mystical-glow relative">
                <ImageWithFallback
                  src={drink.image}
                  alt={drink.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-primary/20" />
                <MysticalEffects intensity="low" showFog={false} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <motion.h1 
                    className="text-4xl font-bold mystical-text"
                    animate={{
                      textShadow: [
                        "0 0 15px rgba(34, 197, 94, 0.5)",
                        "0 0 25px rgba(34, 197, 94, 0.8)",
                        "0 0 15px rgba(34, 197, 94, 0.5)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {drink.name}
                  </motion.h1>
                  {drink.featured && (
                    <Badge className="bg-primary text-primary-foreground">
                      Signature
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <motion.span 
                    className="text-2xl font-bold text-primary mystical-text"
                    animate={{
                      textShadow: [
                        "0 0 10px rgba(34, 197, 94, 0.5)",
                        "0 0 20px rgba(34, 197, 94, 0.8)",
                        "0 0 10px rgba(34, 197, 94, 0.5)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {drink.price}
                  </motion.span>
                  <span>Alkohol: {drink.alcohol}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                    <span>{drink.rating}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Beschreibung</h3>
                <p className="text-muted-foreground">{drink.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Besonderheit</h3>
                <p className="text-primary italic">{drink.specialty}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Zutaten</h3>
                <div className="flex flex-wrap gap-2">
                  {drink.ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="outline">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Kategorien</h3>
                <div className="flex flex-wrap gap-2">
                  {drink.categories.map((category, index) => (
                    <Badge key={index} className="bg-secondary text-secondary-foreground">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="w-full mystical-glow pulse-poison"
                  onClick={() => setCurrentPage('contact')}
                >
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
                    Jetzt bestellen
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Unsere <span className="text-primary">Getränke</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Entdecken Sie unsere einzigartige Auswahl an Cocktails, Shots und alkoholfreien Kreationen
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Kategorien:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "poison-glow" : ""}
              >
                {category === 'all' ? 'Alle' : category}
                {category !== 'all' && (
                  <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    {drinks.filter(drink => drink.categories.includes(category)).length}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Drinks Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {filteredDrinks.map((drink, index) => (
            <motion.div
              key={drink.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <TiltedDrinkCard drink={drink} setSelectedDrink={setSelectedDrink} />
            </motion.div>
          ))}
        </motion.div>

        {filteredDrinks.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xl text-muted-foreground">
              Keine Getränke in dieser Kategorie gefunden.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}