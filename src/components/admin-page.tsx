import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MysticalEffects } from './mystical-effects';
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
  DollarSign
} from 'lucide-react';

interface AdminPageProps {
  setCurrentPage: (page: string) => void;
  currentUser?: { username: string; role: string } | null;
  onLogout?: () => void;
}

interface Drink {
  id: number;
  name: string;
  description: string;
  price: string;
  alcohol: string;
  category: string;
  image: string;
  featured: boolean;
  ingredients: string[];
}

interface Category {
  id: number;
  name: string;
  icon: string;
  count: number;
  description: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  eventType: string;
  date: string;
  status: 'upcoming' | 'active' | 'completed';
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

export function AdminPage({ setCurrentPage, currentUser, onLogout }: AdminPageProps) {
  // Mock Data
  const [drinks, setDrinks] = useState<Drink[]>([
    {
      id: 1,
      name: "Giftiger Apfel",
      description: "Unser Signature-Cocktail mit geheimen Zutaten",
      price: "12.50€",
      alcohol: "18%",
      category: "Signature Cocktails",
      image: "https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: true,
      ingredients: ["Vodka", "Apfelschnapps", "Limettensaft", "Geheimer Sirup"]
    },
    {
      id: 2,
      name: "Schwarze Witwe",
      description: "Ein dunkler Cocktail mit überraschender Süße",
      price: "11.00€",
      alcohol: "22%",
      category: "Signature Cocktails",
      image: "https://images.unsplash.com/photo-1681821675154-5f50ede43f6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGdsYXNzJTIwZGFyayUyMGJhcnxlbnwxfHx8fDE3NTc2MTExMjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      featured: true,
      ingredients: ["Bourbon", "Blackberry Syrup", "Zitronensaft", "Bitter"]
    }
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Signature Cocktails", icon: "🧪", count: 12, description: "Unsere eigenen Kreationen" },
    { id: 2, name: "Klassische Cocktails", icon: "🍸", count: 8, description: "Zeitlose Klassiker" },
    { id: 3, name: "Shots & Schnäpse", icon: "🥃", count: 15, description: "Für den schnellen Genuss" },
    { id: 4, name: "Alkoholfreie Getränke", icon: "🧃", count: 6, description: "Erfrischende Alternativen" }
  ]);

  const [locations, setLocations] = useState<Location[]>([
    { id: 1, name: "Stadtfest München", address: "Marienplatz 1", city: "München", eventType: "Stadtfest", date: "2025-09-15", status: "upcoming" },
    { id: 2, name: "Hochzeit Schmidt", address: "Schloss Neuschwanstein", city: "Schwangau", eventType: "Privatfeier", date: "2025-09-20", status: "upcoming" },
    { id: 3, name: "Oktoberfest Satellit", address: "Festplatz", city: "Augsburg", eventType: "Volksfest", date: "2025-09-12", status: "active" }
  ]);

  const analyticsData: AnalyticsData = {
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
  };

  // State for modals and forms
  const [isAddDrinkOpen, setIsAddDrinkOpen] = useState(false);
  const [isEditDrinkOpen, setIsEditDrinkOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [newDrink, setNewDrink] = useState<Partial<Drink>>({
    name: '',
    description: '',
    price: '',
    alcohol: '',
    category: '',
    image: '',
    featured: false,
    ingredients: []
  });

  const [ingredientInput, setIngredientInput] = useState('');

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    icon: '',
    description: ''
  });

  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: '',
    address: '',
    city: '',
    eventType: '',
    date: '',
    status: 'upcoming'
  });

  // CRUD Functions for Drinks
  const handleAddDrink = () => {
    if (newDrink.name && newDrink.price && newDrink.category) {
      const drink: Drink = {
        id: Math.max(...drinks.map(d => d.id)) + 1,
        name: newDrink.name!,
        description: newDrink.description || '',
        price: newDrink.price!,
        alcohol: newDrink.alcohol || '0%',
        category: newDrink.category!,
        image: newDrink.image || 'https://images.unsplash.com/photo-1681579289953-5c37b36c7b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNvY2t0YWlsJTIwZHJpbmt8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        featured: newDrink.featured || false,
        ingredients: newDrink.ingredients || []
      };
      setDrinks([...drinks, drink]);
      setNewDrink({ name: '', description: '', price: '', alcohol: '', category: '', image: '', featured: false, ingredients: [] });
      setIsAddDrinkOpen(false);
    }
  };

  const handleEditDrink = (drink: Drink) => {
    setEditingDrink(drink);
    setIsEditDrinkOpen(true);
  };

  const handleUpdateDrink = () => {
    if (editingDrink) {
      setDrinks(drinks.map(d => d.id === editingDrink.id ? editingDrink : d));
      setEditingDrink(null);
      setIsEditDrinkOpen(false);
    }
  };

  const handleDeleteDrink = (id: number) => {
    setDrinks(drinks.filter(d => d.id !== id));
  };

  // CRUD Functions for Categories
  const handleAddCategory = () => {
    if (newCategory.name && newCategory.icon) {
      const category: Category = {
        id: Math.max(...categories.map(c => c.id)) + 1,
        name: newCategory.name!,
        icon: newCategory.icon!,
        description: newCategory.description || '',
        count: 0
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', icon: '', description: '' });
      setIsAddCategoryOpen(false);
    }
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  // CRUD Functions for Locations
  const handleAddLocation = () => {
    if (newLocation.name && newLocation.address && newLocation.city) {
      const location: Location = {
        id: Math.max(...locations.map(l => l.id)) + 1,
        name: newLocation.name!,
        address: newLocation.address!,
        city: newLocation.city!,
        eventType: newLocation.eventType || 'Event',
        date: newLocation.date || new Date().toISOString().split('T')[0],
        status: newLocation.status as 'upcoming' | 'active' | 'completed' || 'upcoming'
      };
      setLocations([...locations, location]);
      setNewLocation({ name: '', address: '', city: '', eventType: '', date: '', status: 'upcoming' });
      setIsAddLocationOpen(false);
    }
  };

  const handleDeleteLocation = (id: number) => {
    setLocations(locations.filter(l => l.id !== id));
  };

  // Ingredient handling functions
  const addIngredient = (ingredients: string[], setIngredients: (ingredients: string[]) => void) => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ingredientToRemove: string, ingredients: string[], setIngredients: (ingredients: string[]) => void) => {
    setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
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
                <Dialog open={isAddDrinkOpen} onOpenChange={setIsAddDrinkOpen}>
                  <DialogTrigger asChild>
                    <Button className="mystical-glow">
                      <Plus className="h-4 w-4 mr-2" />
                      Getränk hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mystical-card wood-texture">
                    <DialogHeader>
                      <DialogTitle>Neues Getränk hinzufügen</DialogTitle>
                      <DialogDescription>
                        Füllen Sie die Details für das neue Getränk aus.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Name"
                        value={newDrink.name || ''}
                        onChange={(e) => setNewDrink({ ...newDrink, name: e.target.value })}
                      />
                      <Textarea
                        placeholder="Beschreibung"
                        value={newDrink.description || ''}
                        onChange={(e) => setNewDrink({ ...newDrink, description: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Preis (z.B. 12.50€)"
                          value={newDrink.price || ''}
                          onChange={(e) => setNewDrink({ ...newDrink, price: e.target.value })}
                        />
                        <Input
                          placeholder="Alkoholgehalt (z.B. 18%)"
                          value={newDrink.alcohol || ''}
                          onChange={(e) => setNewDrink({ ...newDrink, alcohol: e.target.value })}
                        />
                      </div>
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
                      <Input
                        placeholder="Bild URL"
                        value={newDrink.image || ''}
                        onChange={(e) => setNewDrink({ ...newDrink, image: e.target.value })}
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={newDrink.featured || false}
                          onChange={(e) => setNewDrink({ ...newDrink, featured: e.target.checked })}
                        />
                        <label htmlFor="featured">Als Highlight anzeigen</label>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleAddDrink} className="mystical-glow">
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddDrinkOpen(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="mystical-card wood-texture border-primary/20">
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bild</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Preis</TableHead>
                        <TableHead>Alkohol</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drinks.map((drink) => (
                        <TableRow key={drink.id}>
                          <TableCell>
                            <ImageWithFallback
                              src={drink.image}
                              alt={drink.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{drink.name}</TableCell>
                          <TableCell>{drink.category}</TableCell>
                          <TableCell>{drink.price}</TableCell>
                          <TableCell>{drink.alcohol}</TableCell>
                          <TableCell>
                            {drink.featured && <Badge className="bg-primary">Highlight</Badge>}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditDrink(drink)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
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
                        Erstellen Sie eine neue Kategorie für Getränke.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Name"
                        value={newCategory.name || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      />
                      <Input
                        placeholder="Icon (Emoji)"
                        value={newCategory.icon || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      />
                      <Textarea
                        placeholder="Beschreibung"
                        value={newCategory.description || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleAddCategory} className="mystical-glow">
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="mystical-card wood-texture border-primary/20 relative">
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-4">{category.icon}</div>
                        <h3 className="text-lg font-bold mb-2">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                        <Badge variant="outline">{category.count} Getränke</Badge>
                        <div className="absolute top-2 right-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
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
                        Fügen Sie einen neuen Event-Standort oder Veranstaltungsort hinzu.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Event/Standort Name"
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
                        placeholder="Event-Typ"
                        value={newLocation.eventType || ''}
                        onChange={(e) => setNewLocation({ ...newLocation, eventType: e.target.value })}
                      />
                      <Input
                        type="date"
                        value={newLocation.date || ''}
                        onChange={(e) => setNewLocation({ ...newLocation, date: e.target.value })}
                      />
                      <Select onValueChange={(value) => setNewLocation({ ...newLocation, status: value as any })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Geplant</SelectItem>
                          <SelectItem value="active">Aktiv</SelectItem>
                          <SelectItem value="completed">Abgeschlossen</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex space-x-2">
                        <Button onClick={handleAddLocation} className="mystical-glow">
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddLocationOpen(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="mystical-card wood-texture border-primary/20">
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event/Standort</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Stadt</TableHead>
                        <TableHead>Event-Typ</TableHead>
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
                          <TableCell>{location.eventType}</TableCell>
                          <TableCell>{new Date(location.date).toLocaleDateString('de-DE')}</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                location.status === 'active' ? 'bg-primary' :
                                location.status === 'upcoming' ? 'bg-secondary' :
                                'bg-muted'
                              }
                            >
                              {location.status === 'active' ? 'Aktiv' :
                               location.status === 'upcoming' ? 'Geplant' :
                               'Abgeschlossen'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteLocation(location.id)}
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
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}