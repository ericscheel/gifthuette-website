import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MysticalEffects } from './mystical-effects';
import { AnimatedInput } from './animated-input';
import { AnimatedPasswordInput } from './animated-password-input';
import { 
  Lock, 
  User, 
  ShieldCheck,
  AlertTriangle,
  LogIn,
  Loader2
} from 'lucide-react';

interface LoginPageProps {
  setCurrentPage: (page: string) => void;
  onLogin: (credentials: { username: string; password: string }) => Promise<boolean>;
}

export function LoginPage({ setCurrentPage, onLogin }: LoginPageProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials for development
  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'Administrator' },
    { username: 'gifthütte', password: 'poison2025', role: 'Owner' },
    { username: 'barkeeper', password: 'cocktails123', role: 'Staff' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 LoginPage: Starting login process...', formData);
      const success = await onLogin(formData);
      console.log('🎯 LoginPage: Login result:', { success });
      
      if (success) {
        console.log('✅ LoginPage: Login successful, redirecting to admin...');
        setCurrentPage('admin');
      } else {
        console.log('❌ LoginPage: Login failed');
        setError('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      console.error('❌ LoginPage: Exception during login:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user types
  };

  const handleDemoCredentialClick = (username: string, password: string) => {
    setFormData({ username, password });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Effects */}
      <div className="absolute inset-0 mystical-atmosphere">
        <MysticalEffects intensity="high" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/60" />
        
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwYmFyJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NjExMTI2fDA&ixlib=rb-4.1.0&q=80&w=1920"
            alt="Dark Bar Interior"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Login Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Card className="mystical-card wood-texture border-primary/30 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <img 
                  src="https://i.imgur.com/XBQnuUJ.png"
                  alt="Gifthütte Logo"
                  className="h-16 w-auto"
                />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl mystical-text">
              <ShieldCheck className="inline h-6 w-6 mr-2 text-primary" />
              Admin Bereich
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Melden Sie sich an, um das Dashboard zu verwalten
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Benutzername</span>
                </Label>
                <AnimatedInput
                  id="username"
                  type="text"
                  placeholder="Benutzername eingeben"
                  value={formData.username}
                  onChange={(value) => handleInputChange('username', value)}
                  className="wood-texture border-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span>Passwort</span>
                </Label>
                <AnimatedPasswordInput
                  id="password"
                  placeholder="Passwort eingeben"
                  value={formData.password}
                  onChange={(value) => handleInputChange('password', value)}
                  className="wood-texture border-primary/20 focus:border-primary"
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  required
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading || !formData.username || !formData.password}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Anmeldung...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Anmelden
                    </>
                  )}
                </Button>
              </motion.div>
            </form>



            {/* Back to Home */}
            <div className="text-center pt-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentPage('home')}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Zurück zur Startseite
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mystical Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}