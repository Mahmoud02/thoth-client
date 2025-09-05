// Debug utilities for API troubleshooting
export const debugAPI = {
  // Log API requests and responses
  logRequest: (url: string, options: RequestInit) => {
    if (import.meta.env.DEV) {
      console.group('🚀 API Request');
      console.log('URL:', url);
      console.log('Method:', options.method || 'GET');
      console.log('Headers:', options.headers);
      console.log('Body:', options.body);
      console.groupEnd();
    }
  },

  // Log API responses
  logResponse: (url: string, response: Response, data?: any) => {
    if (import.meta.env.DEV) {
      console.group('📥 API Response');
      console.log('URL:', url);
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Data:', data);
      console.groupEnd();
    }
  },

  // Log API errors
  logError: (url: string, error: any) => {
    if (import.meta.env.DEV) {
      console.group('❌ API Error');
      console.log('URL:', url);
      console.log('Error:', error);
      console.log('Error Type:', typeof error);
      console.log('Error Message:', error.message);
      console.log('Error Stack:', error.stack);
      console.groupEnd();
    }
  },

  // Test API connectivity
  testConnectivity: async (baseURL: string) => {
    try {
      console.log('🔍 Testing API connectivity...');
      const response = await fetch(`${baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Health check response:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};
