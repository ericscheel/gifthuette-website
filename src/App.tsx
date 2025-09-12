import React, { useState } from 'react';
import { Navigation } from './components/navigation';
import { HomePage } from './components/home-page';
import { DrinksPage } from './components/drinks-page';
import { SearchPage } from './components/search-page';
import { ContactPage } from './components/contact-page';
import { PrivacyPage } from './components/privacy-page';
import { ImprintPage } from './components/imprint-page';
import { AdminPageEnhanced as AdminPage } from './components/admin-page-enhanced';
import { LoginPage } from './components/login-page';
import { ApiDebug } from './components/api-debug';
import { ApiDebugEnhanced } from './components/api-debug-enhanced';
import { CorsTest } from './components/cors-test';
import { CloudflareDebug } from './components/cloudflare-debug';
import { UnifiedApiDebug } from './components/unified-api-debug';
import { ApiQuickTest } from './components/api-quick-test';
import { TokenDebug } from './components/token-debug';
import { TokenFixer } from './components/token-fixer';
import { CertificateDebug } from './components/certificate-debug';
import { UnifiedApiDebugEnhanced } from './components/unified-api-debug-enhanced';
import { CloudflareCertificateGuide } from './components/cloudflare-certificate-guide';
import { ToastProvider } from './components/toast-provider';
import { ApiStatusIndicator } from './components/api-status-indicator';
import { useAuth } from './hooks/useApi';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const { user: currentUser, isAuthenticated, login, logout, loading: authLoading } = useAuth();

  // Real login function using API
  const handleLogin = async (credentials: { username: string; password: string }) => {
    // Map username to email for API
    const emailMap: { [key: string]: string } = {
      'admin': 'admin@gifthuette.de',
      'gifthütte': 'owner@gifthuette.de',
      'barkeeper': 'staff@gifthuette.de'
    };

    const email = emailMap[credentials.username] || credentials.username;
    return await login(email, credentials.password);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  const renderCurrentPage = () => {
    // Show loading during initial auth check
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'drinks':
        return (
          <DrinksPage 
            setCurrentPage={setCurrentPage}
            selectedDrink={selectedDrink}
            setSelectedDrink={setSelectedDrink}
          />
        );
      case 'search':
        return (
          <SearchPage 
            setCurrentPage={setCurrentPage}
            setSelectedDrink={(slug) => {
              setSelectedDrink(slug);
              setCurrentPage('drinks');
            }}
          />
        );
      case 'contact':
        return <ContactPage setCurrentPage={setCurrentPage} />;
      case 'privacy':
        return <PrivacyPage setCurrentPage={setCurrentPage} />;
      case 'imprint':
        return <ImprintPage setCurrentPage={setCurrentPage} />;
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />;
      case 'admin':
        // Protect admin route
        if (!isAuthenticated) {
          setCurrentPage('login');
          return <LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />;
        }
        return <AdminPage setCurrentPage={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} />;
      case 'api-debug':
        return <ApiDebugEnhanced />;
      case 'token-debug':
        return <TokenDebug />;
      case 'cors-test':
        return <CorsTest />;
      case 'cloudflare-debug':
        return <CloudflareDebug />;
      case 'unified-api-debug':
        return <UnifiedApiDebug />;
      case 'api-quick-test':
        return <ApiQuickTest />;
      case 'certificate-debug':
        return <CertificateDebug />;
      case 'unified-api-enhanced':
        return <UnifiedApiDebugEnhanced />;
      case 'cloudflare-cert-guide':
        return <CloudflareCertificateGuide />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  const showNavigation = currentPage !== 'login';

  return (
    <ToastProvider>
      <TokenFixer />
      <div className="min-h-screen bg-background text-foreground">
        {showNavigation && (
          <Navigation 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}
        <ApiStatusIndicator />
        {renderCurrentPage()}
      </div>
    </ToastProvider>
  );
}

export default App;