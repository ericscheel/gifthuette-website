import React from 'react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { api, config } from '../services/api';

interface ApiStatusIndicatorProps {
  className?: string;
}

export function ApiStatusIndicator({ className = '' }: ApiStatusIndicatorProps) {
  const [status, setStatus] = React.useState<{
    isOnline: boolean;
    message: string;
    lastCheck?: string;
  }>({
    isOnline: false,
    message: 'Checking...'
  });

  const checkApiStatus = React.useCallback(async () => {
    try {
      await api.healthCheck();
      setStatus({
        isOnline: true,
        message: 'API Online',
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      setStatus({
        isOnline: false,
        message: 'API Offline',
        lastCheck: new Date().toISOString()
      });
    }
  }, []);

  React.useEffect(() => {
    // Initial check
    checkApiStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);

    return () => clearInterval(interval);
  }, [checkApiStatus]);

  const isOnline = status.isOnline;

  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* API Status Indicator removed - using header indicator instead */}
      <div className="hidden"></div>
    </motion.div>
  );
}

// Compact version for navigation
export function ApiStatusBadge({ className = '' }: ApiStatusIndicatorProps) {
  const [status, setStatus] = React.useState<{
    isOnline: boolean;
    message: string;
  }>({
    isOnline: false,
    message: 'Checking...'
  });

  const checkApiStatus = React.useCallback(async () => {
    try {
      await api.healthCheck();
      setStatus({
        isOnline: true,
        message: 'API Online'
      });
    } catch (error) {
      setStatus({
        isOnline: false,
        message: 'API Offline'
      });
    }
  }, []);

  React.useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, [checkApiStatus]);

  const isOnline = status.isOnline;

  return (
    <motion.div
      className={`flex items-center gap-1 ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        animate={{ 
          color: isOnline ? '#4ade80' : '#9ca3af',
          scale: isOnline ? [1, 1.1, 1] : 1
        }}
        transition={{ 
          duration: isOnline ? 2 : 0.3,
          repeat: isOnline ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
      </motion.div>
      
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {isOnline ? 'Live' : 'Offline'}
      </span>
    </motion.div>
  );
}