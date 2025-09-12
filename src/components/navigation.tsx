import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Droplets, LogOut, User, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ApiStatusBadge } from './api-status-indicator';


interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isAuthenticated?: boolean;
  currentUser?: { username: string; role: string } | null;
  onLogout?: () => void;
}

export function Navigation({ 
  currentPage, 
  setCurrentPage, 
  isAuthenticated = false, 
  currentUser = null, 
  onLogout 
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const publicMenuItems = [
    { id: 'home', label: 'Startseite' },
    { id: 'drinks', label: 'Getränke' },
    { id: 'search', label: 'Suche' },
    { id: 'contact', label: 'Kontakt' },
  ];

  const adminMenuItems = [
    { id: 'admin', label: 'Admin' },
  ];

  const authMenuItems = isAuthenticated 
    ? [...publicMenuItems, ...adminMenuItems] 
    : [...publicMenuItems, { id: 'login', label: 'Login' }];

  const legalItems = [
    { id: 'privacy', label: 'Datenschutz' },
    { id: 'imprint', label: 'Impressum' },
  ];

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-card/95 backdrop-blur-md border-b border-border wood-texture mystical-atmosphere' 
          : 'bg-transparent'
      }`}
      animate={{
        backgroundColor: isScrolled ? 'rgba(42, 24, 16, 0.95)' : 'transparent',
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <img 
              src="https://i.imgur.com/XBQnuUJ.png"
              alt="Gifthütte Logo"
              className="h-10 w-auto"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {authMenuItems.map((item) => (
              <button
                key={item.id}
                className={`relative px-3 py-2 transition-colors flex items-center space-x-1 ${
                  currentPage === item.id
                    ? 'text-primary'
                    : `${isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white hover:text-primary'}`
                }`}
                onClick={() => setCurrentPage(item.id)}
              >
                {item.id === 'admin' && <ShieldCheck className="h-4 w-4" />}
                {item.id === 'login' && <User className="h-4 w-4" />}
                <span>{item.label}</span>
                {currentPage === item.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
            
            {/* API Status & User Info */}
            <div className="flex items-center space-x-3 ml-4">
              <ApiStatusBadge />
              
              {isAuthenticated && currentUser && (
                <div className="flex items-center space-x-3 pl-3 border-l border-border">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {currentUser.role}
                    </Badge>
                    <span className={`text-sm ${isScrolled ? 'text-foreground' : 'text-white'}`}>
                      {currentUser.username}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className={`${isScrolled ? '' : 'text-white hover:text-primary'}`}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className={isScrolled ? '' : 'text-white hover:text-primary'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          className="md:hidden bg-card border-t border-border wood-texture"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {[...authMenuItems, ...legalItems].map((item) => (
              <button
                key={item.id}
                className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md transition-colors ${
                  currentPage === item.id
                    ? 'text-primary bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsOpen(false);
                }}
              >
                {item.id === 'admin' && <ShieldCheck className="h-4 w-4" />}
                {item.id === 'login' && <User className="h-4 w-4" />}
                <span>{item.label}</span>
              </button>
            ))}
            
            {/* Mobile User Info & Logout */}
            {isAuthenticated && currentUser && (
              <>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{currentUser.username}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {currentUser.role}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onLogout?.();
                          setIsOpen(false);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}