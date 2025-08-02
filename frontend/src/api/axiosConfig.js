import axios from 'axios';
import { supabase } from './supabaseClient';

// Create an instance of axios with custom configuration
const instance = axios.create({
  // Default configuration for our backend API
  baseURL: process.env.REACT_APP_API_URL, 
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
instance.interceptors.request.use(
  async (config) => {
    try {
      // Get the current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // If Supabase is not ready, skip adding the token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Add fallback behavior for common errors
    // console.error('API Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with an error status
      // console.error('API Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      // console.error('API Request Error: No response received');
    }
    
    return Promise.reject(error);
  }
);

export default instance;
