import React from 'react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { api } from '../services/api';

interface ApiStatusIndicatorProps {
  className?: string;
}

export function ApiStatusIndicator({ className = '' }: ApiStatusIndicatorProps) {
  const [status, setStatus] = React.useState(api.getApiStatus());

  React.useEffect(() => {
    // Update status every 5 seconds
    const interval = setInterval(() => {
      setStatus(api.getApiStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const isOnline = status.isOnline;

  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Badge
        variant={isOnline ? "default" : "secondary"}
        className={`
          px-3 py-1 text-xs font-medium shadow-lg backdrop-blur-sm
          ${isOnline 
            ? 'bg-primary/90 text-primary-foreground border-primary/20' 
            : 'bg-muted/90 text-muted-foreground border-border/50'
          }
        `}
      >
        <motion.div
          animate={{ rotate: isOnline ? 0 : 180 }}
          transition={{ duration: 0.3 }}
          className="mr-1.5"
        >
          {isOnline ? (
            <Cloud className="h-3 w-3" />
          ) : (
            <CloudOff className="h-3 w-3" />
          )}
        </motion.div>
        {status.message}
        
        {/* Pulse indicator for online status */}
        {isOnline && (
          <motion.div
            className="ml-2 w-2 h-2 bg-green-400 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </Badge>
    </motion.div>
  );
}

// Compact version for navigation
export function ApiStatusBadge({ className = '' }: ApiStatusIndicatorProps) {
  const [status, setStatus] = React.useState(api.getApiStatus());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatus(api.getApiStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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