import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Filter, X, Star, Eye } from 'lucide-react';
import { useDrinks } from '../hooks/useApi';
import type { Drink as ApiDrink } from '../services/api';

interface DrinkCard {
  id: string;
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

interface SearchPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedDrink?: (id: string | null) => void;
}

export function SearchPage({ setCurrentPage, setSelectedDrink }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const { data: drinksData, loading, error } = useDrinks();

  const drinks: DrinkCard[] = useMemo(() => {
    if (!drinksData) return [];
    return drinksData.data.map((d: ApiDrink) => ({
      id: d.slug,
      name: d.name,
      description: d.description,
      price: `${(d.priceCents / 100).toFixed(2)}€`,
      alcohol: d.alcoholContent ? `${d.alcoholContent}%` : '0%',
      ingredients: d.ingredients,
      categories: d.category ? [d.category.name] : [],
      specialty: '',
      image: d.media[0]?.url || 'https://via.placeholder.com/400',
      featured: d.tags?.includes('signature') || false,
      rating: 0,
    }));
  }, [drinksData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Fehler beim Laden der Suche
      </div>
    );
  }

  // Get all unique ingredients for filter suggestions
  const allIngredients = useMemo(() => {
    const ingredients = new Set<string>();
    drinks.forEach(drink => {
      drink.ingredients.forEach(ingredient => ingredients.add(ingredient));
    });
    return Array.from(ingredients).sort();
  }, [drinks]);

  // Filter drinks based on search query and selected filters
  const filteredDrinks = useMemo(() => {
    let filtered = drinks;

    // Text search in name, description, and ingredients
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(drink => 
        drink.name.toLowerCase().includes(query) ||
        drink.description.toLowerCase().includes(query) ||
        drink.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(query)
        ) ||
        drink.specialty.toLowerCase().includes(query)
      );
    }

    // Filter by selected ingredients
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(drink =>
        selectedFilters.some(filter =>
          drink.ingredients.some(ingredient =>
            ingredient.toLowerCase().includes(filter.toLowerCase())
          )
        )
      );
    }

    return filtered;
  }, [searchQuery, selectedFilters, drinks]);

  const toggleFilter = (ingredient: string) => {
    setSelectedFilters(prev =>
      prev.includes(ingredient)
        ? prev.filter(f => f !== ingredient)
        : [...prev, ingredient]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setSearchQuery('');
  };

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
            <Search className="inline h-12 w-12 mr-4 text-primary" />
            Getränke <span className="text-primary">Suche</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Finden Sie Ihren perfekten Cocktail - suchen Sie nach Namen, Zutaten oder Beschreibungen
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Suchen Sie nach Getränken oder Zutaten... (z.B. 'Orange', 'Rum', 'erfrischend')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-primary/20 focus:border-primary poison-glow"
            />
          </div>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6 bg-card wood-texture border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Filter nach Zutaten:</span>
              </div>
              {(selectedFilters.length > 0 || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Alle Filter löschen
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {allIngredients.slice(0, 15).map((ingredient) => (
                <Button
                  key={ingredient}
                  variant={selectedFilters.includes(ingredient) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(ingredient)}
                  className={`transition-all ${
                    selectedFilters.includes(ingredient) 
                      ? "poison-glow bg-primary text-primary-foreground" 
                      : "hover:border-primary/50"
                  }`}
                >
                  {ingredient}
                  {selectedFilters.includes(ingredient) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Button>
              ))}
              {allIngredients.length > 15 && (
                <span className="text-sm text-muted-foreground px-2 py-1">
                  +{allIngredients.length - 15} weitere...
                </span>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Active Filters Display */}
        {(selectedFilters.length > 0 || searchQuery) && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Aktive Filter:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Suche: "{searchQuery}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {selectedFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="gap-1">
                  {filter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleFilter(filter)}
                  />
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <p className="text-muted-foreground">
            {filteredDrinks.length} {filteredDrinks.length === 1 ? 'Getränk' : 'Getränke'} gefunden
          </p>
        </motion.div>

        {/* Search Results */}
        {filteredDrinks.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {filteredDrinks.map((drink, index) => (
              <motion.div
                key={drink.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="overflow-hidden bg-card wood-texture border-primary/20 hover:border-primary/50 transition-all duration-300 cursor-pointer">
                  <div className="relative h-48">
                    <ImageWithFallback
                      src={drink.image}
                      alt={drink.name}
                      className="w-full h-full object-cover"
                    />
                    {drink.featured && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        Signature
                      </Badge>
                    )}
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {drink.alcohol}
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center bg-black/70 text-white px-2 py-1 rounded text-sm">
                      <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                      {drink.rating}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2 line-clamp-1">{drink.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {drink.description}
                    </p>
                    
                    {/* Highlight matching ingredients */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {drink.ingredients.slice(0, 3).map((ingredient, idx) => {
                        const isMatching = selectedFilters.some(filter =>
                          ingredient.toLowerCase().includes(filter.toLowerCase())
                        ) || (searchQuery && ingredient.toLowerCase().includes(searchQuery.toLowerCase()));
                        
                        return (
                          <Badge 
                            key={idx} 
                            variant={isMatching ? "default" : "outline"} 
                            className={`text-xs ${isMatching ? 'bg-primary text-primary-foreground' : ''}`}
                          >
                            {ingredient}
                          </Badge>
                        );
                      })}
                      {drink.ingredients.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{drink.ingredients.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">{drink.price}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedDrink?.(drink.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Keine Getränke gefunden</h3>
            <p className="text-muted-foreground mb-6">
              Versuchen Sie es mit anderen Suchbegriffen oder Filtern.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Filter zurücksetzen
            </Button>
          </motion.div>
        )}

        {/* Search Suggestions */}
        {!searchQuery && selectedFilters.length === 0 && (
          <motion.div
            className="mt-16 bg-secondary/30 rounded-lg p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <h3 className="text-xl font-bold mb-4 text-center">Beliebte Suchbegriffe</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {['Rum', 'Vodka', 'Limette', 'Minze', 'Apfel', 'Zitrone', 'Whiskey', 'Grüner Tee'].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(term)}
                  className="hover:border-primary/50"
                >
                  {term}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}