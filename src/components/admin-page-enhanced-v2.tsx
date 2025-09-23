import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MysticalEffects } from './mystical-effects';
import { ApiStatus } from './api-status';
import { ApiTest } from './api-test';
import { EnvDebug } from './env-debug';
import { NetworkTest } from './network-test';
import { toast } from 'sonner@2.0.3';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  TrendingUp,
  Users,
  MousePointer,
  Eye,
  BarChart3,
  MapPin,
  Wine,
  Settings,
  Calendar,
  DollarSign,
  Tag,
  Loader2,
  Image,
  Link
} from 'lucide-react';

// Import API services and types
import { 
  api, 
  type Drink, 
  type Category, 
  type Location, 
  type Highlight, 
  type DrinkVariant,
  ApiUtils 
} from '../services/api';

interface AdminPageProps {
  setCurrentPage: (page: string) => void;
  currentUser?: { username: string; role: string } | null;
  onLogout?: () => void;
}

// Enhanced admin types to support variants and new structure
interface AdminDrink {
  id: string;
  name: string;
  description: string;
  price: string;
  alcohol: string;
  category: string;
  image: string;
  featured: boolean;
  ingredients: string[];
  slug: string;
  priceCents: number;
  categoryId: string;
  active: boolean;
  variants: DrinkVariant[];
  media: Array<{ id: string; url: string; alt: string; }>;
}

interface AdminVariant {
  id?: string;
  label: string;
  priceCents: number;
}

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
  active: boolean;
}

interface AdminLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  date: string;
  isCurrent: boolean;
}

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: string;
  topPages: { page: string; views: number; }[];
  drinkSearches: { term: string; count: number; }[];
  conversionRate: number;
  mobileTraffic: number;
}

export function AdminPageEnhancedV2({ setCurrentPage, currentUser, onLogout }: AdminPageProps) {
  // State for data
  const [drinks, setDrinks] = useState<AdminDrink[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Loading states
  const [loadingDrinks, setLoadingDrinks] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // State for modals and forms
  const [isAddDrinkOpen, setIsAddDrinkOpen] = useState(false);
  const [isEditDrinkOpen, setIsEditDrinkOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<AdminDrink | null>(null);
  const [newDrink, setNewDrink] = useState<Partial<AdminDrink> & { variants: AdminVariant[] }>({
    name: '',
    description: '',
    price: '',
    alcohol: '',
    category: '',
    image: '',
    featured: false,
    ingredients: [],
    variants: [{ label: 'Standard', priceCents: 0 }]
  });

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<AdminCategory>>({
    name: '',
    description: ''
  });

  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [newLocation, setNewLocation] = useState<Partial<AdminLocation>>({
    name: '',
    address: '',
    city: '',
    date: '',
    isCurrent: false
  });

  const [ingredientInput, setIngredientInput] = useState('');
  const [variantInput, setVariantInput] = useState({ label: '', price: '' });

  // Data loading functions
  const loadDrinks = async () => {
    setLoadingDrinks(true);
    try {
      const apiDrinks = await api.getAllDrinks(); // Use new getAllDrinks method
      const adminDrinks: AdminDrink[] = apiDrinks.map(drink => ({
        id: drink.id,
        name: drink.name,
        description: drink.description,
        price: ApiUtils.formatPrice(drink.priceCents),
        alcohol: drink.alcoholPercentage || '0%',
        category: drink.category?.name || '',
        image: drink.media[0]?.url || '',
        featured: drink.tags?.some(tag => tag.tag?.name?.toLowerCase() === 'featured') || false,
        ingredients: drink.ingredients?.map(ing => ing.ingredient?.name || '') || [],
        slug: drink.slug,
        priceCents: drink.priceCents,
        categoryId: drink.categoryId,
        active: drink.active,
        variants: drink.variants || [],
        media: drink.media || []
      }));
      setDrinks(adminDrinks);
      console.log('✅ Loaded drinks:', { count: adminDrinks.length });
    } catch (error) {
      console.error('Error loading drinks:', error);
      toast.error('Fehler beim Laden der Getränke: ' + ApiUtils.handleApiError(error));
    } finally {
      setLoadingDrinks(false);
    }
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const apiCategories = await api.getCategories(true);
      const adminCategories: AdminCategory[] = apiCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        count: cat.drinks?.length || 0,
        active: cat.active || true
      }));
      setCategories(adminCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Fehler beim Laden der Kategorien: ' + ApiUtils.handleApiError(error));
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadLocations = async () => {
    setLoadingLocations(true);
    try {
      const apiLocations = await api.getLocations();
      const adminLocations: AdminLocation[] = apiLocations.map(loc => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        date: loc.date,
        isCurrent: loc.isCurrent
      }));
      setLocations(adminLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Fehler beim Laden der Standorte: ' + ApiUtils.handleApiError(error));
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      // Mock analytics data for now
      setAnalyticsData({
        pageViews: 15420,
        uniqueVisitors: 8750,
        bounceRate: 34.2,
        avgSessionDuration: "3:45",
        topPages: [
          { page: "/drinks", views: 5840 },
          { page: "/", views: 4320 },
          { page: "/contact", views: 2180 },
          { page: "/search", views: 1650 }
        ],
        drinkSearches: [
          { term: "Cocktail", count: 890 },
          { term: "Signature", count: 650 },
          { term: "Alkoholfrei", count: 420 },
          { term: "Shot", count: 380 }
        ],
        conversionRate: 12.5,
        mobileTraffic: 67.8
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Fehler beim Laden der Analytics: ' + ApiUtils.handleApiError(error));
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadDrinks();
    loadCategories();
    loadLocations();
    loadAnalytics();
  }, []);

  // CRUD Functions for Drinks
  const handleAddDrink = async () => {
    if (newDrink.name && newDrink.category && newDrink.variants.length > 0) {
      try {
        const category = categories.find(c => c.name === newDrink.category);
        if (!category) {
          toast.error('Kategorie nicht gefunden');
          return;
        }

        // Use the first variant's price as the main price
        const mainPriceCents = newDrink.variants[0].priceCents;
        
        await api.createDrink({
          slug: ApiUtils.createSlug(newDrink.name!),
          name: newDrink.name!,
          description: newDrink.description || '',
          priceCents: mainPriceCents,
          categoryId: category.id,
          alcoholContent: parseFloat(newDrink.alcohol?.replace('%', '') || '0'),
          ingredients: newDrink.ingredients || [],
          isActive: true
        });

        toast.success('Getränk erfolgreich hinzugefügt');
        setNewDrink({ 
          name: '', 
          description: '', 
          price: '', 
          alcohol: '', 
          category: '', 
          image: '', 
          featured: false, 
          ingredients: [],
          variants: [{ label: 'Standard', priceCents: 0 }]
        });
        setIsAddDrinkOpen(false);
        loadDrinks(); // Reload drinks
      } catch (error) {
        console.error('Error adding drink:', error);
        toast.error('Fehler beim Hinzufügen des Getränks: ' + ApiUtils.handleApiError(error));
      }
    }
  };

  const handleEditDrink = (drink: AdminDrink) => {
    setEditingDrink({
      ...drink,
      variants: drink.variants.length > 0 ? drink.variants : [{ id: '', label: 'Standard', priceCents: drink.priceCents }]
    });
    setIsEditDrinkOpen(true);
  };

  const handleUpdateDrink = async () => {
    if (editingDrink) {
      try {
        const category = categories.find(c => c.name === editingDrink.category);
        if (!category) {
          toast.error('Kategorie nicht gefunden');
          return;
        }

        // Use the first variant's price as the main price
        const mainPriceCents = editingDrink.variants[0]?.priceCents || editingDrink.priceCents;
        
        await api.updateDrink(editingDrink.id, {
          name: editingDrink.name,
          description: editingDrink.description,
          priceCents: mainPriceCents,
          categoryId: category.id,
          alcoholPercentage: editingDrink.alcohol,
          active: editingDrink.active
        });

        toast.success('Getränk erfolgreich aktualisiert');
        setEditingDrink(null);
        setIsEditDrinkOpen(false);
        loadDrinks(); // Reload drinks
      } catch (error) {
        console.error('Error updating drink:', error);
        toast.error('Fehler beim Aktualisieren des Getränks: ' + ApiUtils.handleApiError(error));
      }
    }
  };

  const handleDeleteDrink = async (id: string) => {
    try {
      await api.deleteDrink(id);
      toast.success('Getränk erfolgreich gelöscht');
      loadDrinks(); // Reload drinks
    } catch (error) {
      console.error('Error deleting drink:', error);
      toast.error('Fehler beim Löschen des Getränks: ' + ApiUtils.handleApiError(error));
    }
  };

  // CRUD Functions for Categories
  const handleAddCategory = async () => {
    if (newCategory.name) {
      try {
        await api.createCategory({
          slug: ApiUtils.createSlug(newCategory.name!),
          name: newCategory.name!,
          description: newCategory.description || ''
        });

        toast.success('Kategorie erfolgreich hinzugefügt');
        setNewCategory({ name: '', description: '' });
        setIsAddCategoryOpen(false);
        loadCategories(); // Reload categories
      } catch (error) {
        console.error('Error adding category:', error);
        toast.error('Fehler beim Hinzufügen der Kategorie: ' + ApiUtils.handleApiError(error));
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.deleteCategory(id);
      toast.success('Kategorie erfolgreich gelöscht');
      loadCategories(); // Reload categories
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Fehler beim Löschen der Kategorie: ' + ApiUtils.handleApiError(error));
    }
  };

  // CRUD Functions for Locations
  const handleAddLocation = async () => {
    if (newLocation.name && newLocation.address && newLocation.city) {
      try {
        await api.createLocation({
          name: newLocation.name!,
          address: newLocation.address!,
          city: newLocation.city!,
          date: newLocation.date || new Date().toISOString().split('T')[0],
          isCurrent: newLocation.isCurrent || false
        });

        toast.success('Standort erfolgreich hinzugefügt');
        setNewLocation({ name: '', address: '', city: '', date: '', isCurrent: false });
        setIsAddLocationOpen(false);
        loadLocations(); // Reload locations
      } catch (error) {
        console.error('Error adding location:', error);
        toast.error('Fehler beim Hinzufügen des Standorts: ' + ApiUtils.handleApiError(error));
      }
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await api.deleteLocation(id);
      toast.success('Standort erfolgreich gelöscht');
      loadLocations(); // Reload locations
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Fehler beim Löschen des Standorts: ' + ApiUtils.handleApiError(error));
    }
  };

  const handleSetCurrentLocation = async (id: string) => {
    try {
      await api.setCurrentLocation(id);
      toast.success('Aktueller Standort gesetzt');
      loadLocations(); // Reload locations
    } catch (error) {
      console.error('Error setting current location:', error);
      toast.error('Fehler beim Setzen des aktuellen Standorts: ' + ApiUtils.handleApiError(error));
    }
  };

  // Helper functions for variants and ingredients
  const addIngredient = (ingredients: string[], setIngredients: (ingredients: string[]) => void) => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ingredientToRemove: string, ingredients: string[], setIngredients: (ingredients: string[]) => void) => {
    setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
  };

  const addVariant = (variants: AdminVariant[], setVariants: (variants: AdminVariant[]) => void) => {
    if (variantInput.label.trim() && variantInput.price) {
      const priceCents = Math.round(parseFloat(variantInput.price.replace(/[^\d.,]/g, '').replace(',', '.')) * 100);
      const newVariant: AdminVariant = {
        label: variantInput.label.trim(),
        priceCents
      };
      setVariants([...variants, newVariant]);
      setVariantInput({ label: '', price: '' });
    }
  };

  const removeVariant = (index: number, variants: AdminVariant[], setVariants: (variants: AdminVariant[]) => void) => {
    if (variants.length > 1) { // Always keep at least one variant
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: 'label' | 'priceCents', value: string | number, variants: AdminVariant[], setVariants: (variants: AdminVariant[]) => void) => {
    const updatedVariants = [...variants];
    if (field === 'priceCents') {
      updatedVariants[index].priceCents = typeof value === 'number' ? value : Math.round(parseFloat(value.toString().replace(/[^\d.,]/g, '').replace(',', '.')) * 100);
    } else {
      updatedVariants[index].label = value.toString();
    }
    setVariants(updatedVariants);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="relative py-16 px-4 mystical-atmosphere">
        <MysticalEffects intensity="medium" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
        
        <motion.div
          className="relative z-10 max-w-7xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <Settings className="inline h-12 w-12 mr-4 text-primary" />
            Admin <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Verwalten Sie Getränke, Kategorien, Standorte und Analytics
          </p>
          {currentUser && (
            <div className="flex items-center justify-center space-x-4 text-lg">
              <span className="text-muted-foreground">Willkommen,</span>
              <span className="text-primary font-medium">{currentUser.username}</span>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {currentUser.role}
              </Badge>
            </div>
          )}
        </motion.div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="drinks">Getränke</TabsTrigger>
            <TabsTrigger value="categories">Kategorien</TabsTrigger>
            <TabsTrigger value="locations">Standorte</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-lg">Lade Analytics...</span>
                </div>
              ) : analyticsData ? (
                <>
                  {/* Analytics Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="mystical-card wood-texture border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Eye className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Seitenaufrufe</p>
                            <p className="text-2xl font-bold">{analyticsData.pageViews.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mystical-card wood-texture border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Users className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Unique Visitors</p>
                            <p className="text-2xl font-bold">{analyticsData.uniqueVisitors.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mystical-card wood-texture border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <TrendingUp className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Bounce Rate</p>
                            <p className="text-2xl font-bold">{analyticsData.bounceRate}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mystical-card wood-texture border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <MousePointer className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Mobile Traffic</p>
                            <p className="text-2xl font-bold">{analyticsData.mobileTraffic}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* API Status & Tests */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ApiStatus />
                    <ApiTest />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <EnvDebug />
                    <NetworkTest />
                  </div>

                  {/* Detailed Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="mystical-card wood-texture border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5" />
                          <span>Top Seiten</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analyticsData.topPages.map((page, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{page.page}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${(page.views / analyticsData.topPages[0].views) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{page.views}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mystical-card wood-texture border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Wine className="h-5 w-5" />
                          <span>Beliebte Suchbegriffe</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analyticsData.drinkSearches.map((search, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{search.term}</span>
                              <Badge variant="outline">{search.count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Keine Analytics-Daten verfügbar</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Drinks Tab */}
          <TabsContent value="drinks" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Getränke verwalten</h2>
                
                {/* Add Drink Dialog */}
                <Dialog open={isAddDrinkOpen} onOpenChange={setIsAddDrinkOpen}>
                  <DialogTrigger asChild>
                    <Button className="mystical-glow">
                      <Plus className="h-4 w-4 mr-2" />
                      Getränk hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mystical-card wood-texture max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Neues Getränk hinzufügen</DialogTitle>
                      <DialogDescription>
                        Füllen Sie die Details für das neue Getränk aus. Sie können mehrere Größen/Varianten hinzufügen.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Name"
                          value={newDrink.name || ''}
                          onChange={(e) => setNewDrink({ ...newDrink, name: e.target.value })}
                        />
                        <Select onValueChange={(value) => setNewDrink({ ...newDrink, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Kategorie wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Textarea
                        placeholder="Beschreibung"
                        value={newDrink.description || ''}
                        onChange={(e) => setNewDrink({ ...newDrink, description: e.target.value })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Alkoholgehalt (z.B. 18%)"
                          value={newDrink.alcohol || ''}
                          onChange={(e) => setNewDrink({ ...newDrink, alcohol: e.target.value })}
                        />
                        <div className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Bild-URL (optional)"
                            value={newDrink.image || ''}
                            onChange={(e) => setNewDrink({ ...newDrink, image: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Image preview */}
                      {newDrink.image && (
                        <div className="w-32 h-32 border border-border rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={newDrink.image}
                            alt="Getränk Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Variants Management */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Größen/Varianten</label>
                        
                        {/* Add new variant */}
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Größe (z.B. 0,3l)"
                            value={variantInput.label}
                            onChange={(e) => setVariantInput({ ...variantInput, label: e.target.value })}
                          />
                          <Input
                            placeholder="Preis (z.B. 12.50)"
                            value={variantInput.price}
                            onChange={(e) => setVariantInput({ ...variantInput, price: e.target.value })}
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => addVariant(newDrink.variants, (variants) => 
                              setNewDrink({ ...newDrink, variants })
                            )}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Current variants */}
                        <div className="space-y-2">
                          {newDrink.variants.map((variant, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 border border-border rounded-lg">
                              <Input
                                value={variant.label}
                                onChange={(e) => updateVariant(index, 'label', e.target.value, newDrink.variants, (variants) => 
                                  setNewDrink({ ...newDrink, variants })
                                )}
                                className="flex-1"
                              />
                              <Input
                                value={ApiUtils.formatPrice(variant.priceCents)}
                                onChange={(e) => {
                                  const priceCents = Math.round(parseFloat(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.')) * 100);
                                  updateVariant(index, 'priceCents', priceCents, newDrink.variants, (variants) => 
                                    setNewDrink({ ...newDrink, variants })
                                  );
                                }}
                                className="w-24"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeVariant(index, newDrink.variants, (variants) => 
                                  setNewDrink({ ...newDrink, variants })
                                )}
                                disabled={newDrink.variants.length <= 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Ingredients Management */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Zutaten</label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Zutat hinzufügen"
                            value={ingredientInput}
                            onChange={(e) => setIngredientInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addIngredient(newDrink.ingredients || [], (ingredients) => 
                                  setNewDrink({ ...newDrink, ingredients })
                                );
                              }
                            }}
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => addIngredient(newDrink.ingredients || [], (ingredients) => 
                              setNewDrink({ ...newDrink, ingredients })
                            )}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(newDrink.ingredients || []).map((ingredient, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                              <span>{ingredient}</span>
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeIngredient(ingredient, newDrink.ingredients || [], (ingredients) => 
                                  setNewDrink({ ...newDrink, ingredients })
                                )}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDrinkOpen(false)}
                        >
                          Abbrechen
                        </Button>
                        <Button
                          onClick={handleAddDrink}
                          className="mystical-glow"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Drinks Table */}
              {loadingDrinks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-lg">Lade Getränke...</span>
                </div>
              ) : (
                <Card className="mystical-card wood-texture border-primary/20">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bild</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Kategorie</TableHead>
                          <TableHead>Preis</TableHead>
                          <TableHead>Varianten</TableHead>
                          <TableHead>Alkohol</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drinks.map((drink) => (
                          <TableRow key={drink.id}>
                            <TableCell>
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                                <ImageWithFallback
                                  src={drink.image || 'https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080'}
                                  alt={drink.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{drink.name}</TableCell>
                            <TableCell>{drink.category}</TableCell>
                            <TableCell>{drink.price}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {drink.variants.slice(0, 2).map((variant, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {variant.label}
                                  </Badge>
                                ))}
                                {drink.variants.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{drink.variants.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{drink.alcohol}</TableCell>
                            <TableCell>
                              <Badge variant={drink.active ? "default" : "secondary"}>
                                {drink.active ? "Aktiv" : "Inaktiv"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditDrink(drink)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteDrink(drink.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Edit Drink Dialog */}
              <Dialog open={isEditDrinkOpen} onOpenChange={setIsEditDrinkOpen}>
                <DialogContent className="mystical-card wood-texture max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Getränk bearbeiten</DialogTitle>
                    <DialogDescription>
                      Bearbeiten Sie die Details des Getränks.
                    </DialogDescription>
                  </DialogHeader>
                  {editingDrink && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Name"
                          value={editingDrink.name}
                          onChange={(e) => setEditingDrink({ ...editingDrink, name: e.target.value })}
                        />
                        <Select
                          value={editingDrink.category}
                          onValueChange={(value) => setEditingDrink({ ...editingDrink, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategorie wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Textarea
                        placeholder="Beschreibung"
                        value={editingDrink.description}
                        onChange={(e) => setEditingDrink({ ...editingDrink, description: e.target.value })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Alkoholgehalt (z.B. 18%)"
                          value={editingDrink.alcohol}
                          onChange={(e) => setEditingDrink({ ...editingDrink, alcohol: e.target.value })}
                        />
                        <div className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Bild-URL (optional)"
                            value={editingDrink.image}
                            onChange={(e) => setEditingDrink({ ...editingDrink, image: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Image preview */}
                      {editingDrink.image && (
                        <div className="w-32 h-32 border border-border rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={editingDrink.image}
                            alt="Getränk Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Variants Management for Edit */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Größen/Varianten</label>
                        
                        {/* Add new variant */}
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Größe (z.B. 0,3l)"
                            value={variantInput.label}
                            onChange={(e) => setVariantInput({ ...variantInput, label: e.target.value })}
                          />
                          <Input
                            placeholder="Preis (z.B. 12.50)"
                            value={variantInput.price}
                            onChange={(e) => setVariantInput({ ...variantInput, price: e.target.value })}
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => addVariant(editingDrink.variants, (variants) => 
                              setEditingDrink({ ...editingDrink, variants })
                            )}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Current variants */}
                        <div className="space-y-2">
                          {editingDrink.variants.map((variant, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 border border-border rounded-lg">
                              <Input
                                value={variant.label}
                                onChange={(e) => updateVariant(index, 'label', e.target.value, editingDrink.variants, (variants) => 
                                  setEditingDrink({ ...editingDrink, variants })
                                )}
                                className="flex-1"
                              />
                              <Input
                                value={ApiUtils.formatPrice(variant.priceCents)}
                                onChange={(e) => {
                                  const priceCents = Math.round(parseFloat(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.')) * 100);
                                  updateVariant(index, 'priceCents', priceCents, editingDrink.variants, (variants) => 
                                    setEditingDrink({ ...editingDrink, variants })
                                  );
                                }}
                                className="w-24"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeVariant(index, editingDrink.variants, (variants) => 
                                  setEditingDrink({ ...editingDrink, variants })
                                )}
                                disabled={editingDrink.variants.length <= 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Active status */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="active"
                          checked={editingDrink.active}
                          onCheckedChange={(checked) => setEditingDrink({ ...editingDrink, active: !!checked })}
                        />
                        <label htmlFor="active" className="text-sm font-medium">
                          Getränk ist aktiv
                        </label>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditDrinkOpen(false);
                            setEditingDrink(null);
                          }}
                        >
                          Abbrechen
                        </Button>
                        <Button
                          onClick={handleUpdateDrink}
                          className="mystical-glow"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </motion.div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Kategorien verwalten</h2>
                
                {/* Add Category Dialog */}
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button className="mystical-glow">
                      <Plus className="h-4 w-4 mr-2" />
                      Kategorie hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mystical-card wood-texture">
                    <DialogHeader>
                      <DialogTitle>Neue Kategorie hinzufügen</DialogTitle>
                      <DialogDescription>
                        Erstellen Sie eine neue Getränke-Kategorie.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Kategorie-Name"
                        value={newCategory.name || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      />
                      <Textarea
                        placeholder="Beschreibung (optional)"
                        value={newCategory.description || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddCategoryOpen(false)}
                        >
                          Abbrechen
                        </Button>
                        <Button
                          onClick={handleAddCategory}
                          className="mystical-glow"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Categories Table */}
              {loadingCategories ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-lg">Lade Kategorien...</span>
                </div>
              ) : (
                <Card className="mystical-card wood-texture border-primary/20">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Beschreibung</TableHead>
                          <TableHead>Getränke</TableHead>
                          <TableHead>Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{category.count}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Standorte verwalten</h2>
                
                {/* Add Location Dialog */}
                <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
                  <DialogTrigger asChild>
                    <Button className="mystical-glow">
                      <Plus className="h-4 w-4 mr-2" />
                      Standort hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mystical-card wood-texture">
                    <DialogHeader>
                      <DialogTitle>Neuen Standort hinzufügen</DialogTitle>
                      <DialogDescription>
                        Fügen Sie einen neuen Standort für die Gifthütte hinzu.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Standort-Name"
                        value={newLocation.name || ''}
                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                      />
                      <Input
                        placeholder="Adresse"
                        value={newLocation.address || ''}
                        onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                      />
                      <Input
                        placeholder="Stadt"
                        value={newLocation.city || ''}
                        onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                      />
                      <Input
                        type="date"
                        value={newLocation.date || ''}
                        onChange={(e) => setNewLocation({ ...newLocation, date: e.target.value })}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="current"
                          checked={newLocation.isCurrent || false}
                          onCheckedChange={(checked) => setNewLocation({ ...newLocation, isCurrent: !!checked })}
                        />
                        <label htmlFor="current" className="text-sm font-medium">
                          Aktueller Standort
                        </label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddLocationOpen(false)}
                        >
                          Abbrechen
                        </Button>
                        <Button
                          onClick={handleAddLocation}
                          className="mystical-glow"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Locations Table */}
              {loadingLocations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-lg">Lade Standorte...</span>
                </div>
              ) : (
                <Card className="mystical-card wood-texture border-primary/20">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Adresse</TableHead>
                          <TableHead>Stadt</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locations.map((location) => (
                          <TableRow key={location.id}>
                            <TableCell className="font-medium">{location.name}</TableCell>
                            <TableCell>{location.address}</TableCell>
                            <TableCell>{location.city}</TableCell>
                            <TableCell>{new Date(location.date).toLocaleDateString('de-DE')}</TableCell>
                            <TableCell>
                              <Badge variant={location.isCurrent ? "default" : "secondary"}>
                                {location.isCurrent ? "Aktuell" : "Geplant"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {!location.isCurrent && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetCurrentLocation(location.id)}
                                  >
                                    <MapPin className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteLocation(location.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}