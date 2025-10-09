import axios from 'axios';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 45000, // 45 seconds timeout
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug the API URL being used
console.log('🌐 API Base URL :', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api');
console.log('🌐 API Base URL for sockets :', process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:4000/api');


// Request interceptor - logs outgoing requests and includes auth token
apiClient.interceptors.request.use(
  (config) => {
    // Check if we have a token in localStorage (fallback for cookie issues)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    const timestamp = new Date().toISOString();
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - logs incoming responses
apiClient.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Export individual methods for convenience
export const get = (url, config) => apiClient.get(url, config);
export const post = (url, data, config) => apiClient.post(url, data, config);
export const put = (url, data, config) => apiClient.put(url, data, config);
export const patch = (url, data, config) => apiClient.patch(url, data, config);
export const del = (url, config) => apiClient.delete(url, config);
