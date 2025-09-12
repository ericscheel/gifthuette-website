import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Filter, X, Star, Eye, Loader2 } from 'lucide-react';
import { api, type Drink, ApiUtils } from '../services/api';

interface SearchPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedDrink?: (slug: string | null) => void;
}

export function SearchPage({ setCurrentPage, setSelectedDrink }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<{
    drinks: Drink[];
    totalResults: number;
  }>({ drinks: [], totalResults: 0 });
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{
    drinks: string[];
    ingredients: string[];
    categories: string[];
  }>({ drinks: [], ingredients: [], categories: [] });

  // Load initial data and all drinks for ingredient extraction
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const drinks = await api.getDrinksEnhanced({ isActive: true });
        
        // Extract unique ingredients from all drinks
        const ingredients = new Set<string>();
        (drinks || []).forEach(drink => {
          (drink.ingredients || []).forEach(ingredient => ingredients.add(ingredient));
        });
        setAllIngredients(Array.from(ingredients).sort());
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Fehler beim Laden der Suchfunktionen.');
      }
    };

    loadInitialData();
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim() && selectedFilters.length === 0) {
        setSearchResults({ drinks: [], totalResults: 0 });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const filters: any = {};
        
        // Add ingredient filters
        if (selectedFilters.length > 0) {
          // Since API might not have specific ingredient filters, 
          // we'll use tags as a workaround or do client-side filtering
          filters.tags = selectedFilters;
        }

        const results = await api.search(searchQuery.trim(), filters);
        setSearchResults({
          drinks: results.drinks || [],
          totalResults: results.totalResults || 0
        });
      } catch (err) {
        console.error('Search error:', err);
        setError('Fehler bei der Suche. Bitte versuchen Sie es erneut.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedFilters]);

  // Get search suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.length >= 2) {
        try {
          const suggestions = await api.getSearchSuggestions(searchQuery);
          setSuggestions(suggestions);
        } catch (err) {
          console.error('Error getting suggestions:', err);
        }
      } else {
        setSuggestions({ drinks: [], ingredients: [], categories: [] });
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 200);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

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

  // Show suggestions while typing
  const showSuggestions = searchQuery.length >= 2 && suggestions.drinks.length > 0;

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
            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <motion.div
                className="absolute top-full left-0 right-0 bg-card border border-border rounded-md mt-2 shadow-lg z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Getränke-Vorschläge:</div>
                  {suggestions.drinks.slice(0, 5).map((drink, idx) => (
                    <button
                      key={idx}
                      className="block w-full text-left px-2 py-1 hover:bg-secondary rounded text-sm"
                      onClick={() => setSearchQuery(drink)}
                    >
                      {drink}
                    </button>
                  ))}
                  {suggestions.ingredients.length > 0 && (
                    <>
                      <div className="text-sm font-medium text-muted-foreground mt-3">Zutaten:</div>
                      {suggestions.ingredients.slice(0, 3).map((ingredient, idx) => (
                        <button
                          key={idx}
                          className="block w-full text-left px-2 py-1 hover:bg-secondary rounded text-sm"
                          onClick={() => setSearchQuery(ingredient)}
                        >
                          {ingredient}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )}
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Suche...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => setError(null)} variant="outline">
              Erneut versuchen
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (searchQuery || selectedFilters.length > 0) && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <p className="text-muted-foreground">
              {searchResults.totalResults} {searchResults.totalResults === 1 ? 'Getränk' : 'Getränke'} gefunden
            </p>
          </motion.div>
        )}

        {/* Search Results */}
        {!loading && !error && searchResults.drinks.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {searchResults.drinks.map((drink, index) => (
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
                      src={drink.media?.[0]?.url || 'https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080'}
                      alt={drink.name}
                      className="w-full h-full object-cover"
                    />
                    {drink.tags?.includes('signature') && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        Signature
                      </Badge>
                    )}
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {drink.alcoholContent ? `${drink.alcoholContent}%` : '0%'}
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center bg-black/70 text-white px-2 py-1 rounded text-sm">
                      <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                      4.5
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2 line-clamp-1">{drink.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {drink.description}
                    </p>
                    
                    {/* Highlight matching ingredients */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(drink.ingredients || []).slice(0, 3).map((ingredient, idx) => {
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
                      {(drink.ingredients || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(drink.ingredients || []).length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">
                        {ApiUtils.formatPrice(drink.priceCents)}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedDrink?.(drink.slug)}
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
        ) : !loading && !error && (searchQuery || selectedFilters.length > 0) ? (
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
        ) : null}

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