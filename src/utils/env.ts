// Environment configuration helper
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    // Check if import.meta.env is available (Vite environment)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    
    // Fallback for other environments
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    
    return defaultValue;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
};

// Predefined environment variables
export const ENV = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://api.gifthuette.de'),
  JWT_TOKEN: getEnvVar('VITE_JWT_TOKEN', ''),
  NODE_ENV: getEnvVar('VITE_NODE_ENV', 'development'),
  DEBUG: getEnvVar('VITE_DEBUG', 'false') === 'true'
};

// Validate required environment variables
export const validateEnv = () => {
  const required: string[] = []; // Remove VITE_API_BASE_URL from required since we have a fallback
  const missing = required.filter(key => !getEnvVar(key));
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
  }
  
  // Log environment info in development
  if (ENV.DEBUG) {
    console.log('Environment Configuration:', {
      API_BASE_URL: ENV.API_BASE_URL,
      NODE_ENV: ENV.NODE_ENV,
      HAS_JWT_TOKEN: !!ENV.JWT_TOKEN,
      DEBUG: ENV.DEBUG
    });
  }
};

// Initialize environment on module load
validateEnv();