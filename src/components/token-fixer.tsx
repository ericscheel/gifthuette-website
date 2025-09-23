import React, { useEffect } from 'react';

export function TokenFixer() {
  useEffect(() => {
    // Prüfe ob Token bereits da ist
    const existingToken = localStorage.getItem('gifthütte_token');
    
    if (!existingToken) {
      // Setze den Token direkt - da Vite env nicht funktioniert
      const token = 'TTbTXQbkwMzUt8GVwHnuGhARRcB9rqr8GEog2lesqbYPZwStKxzv0miZ3qLODMR/';
      localStorage.setItem('gifthütte_token', token);
      console.log('🔧 Token Auto-Fix: Token in localStorage gesetzt');
      
      // Reload the page to pick up the new token
      window.location.reload();
    } else {
      console.log('✅ Token bereits vorhanden:', existingToken.substring(0, 10) + '...');
    }
  }, []);

  return null; // Invisible component
}