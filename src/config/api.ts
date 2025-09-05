// API Configuration
export const API_CONFIG = {
  // Use proxy in development, direct URL in production
  BASE_URL: import.meta.env.DEV 
    ? '/api/v1'  // Use Vite proxy in development
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
