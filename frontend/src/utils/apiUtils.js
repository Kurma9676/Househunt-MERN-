import axios from 'axios';
import { toast } from 'react-toastify';

// Configure axios defaults
// axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.timeout = 10000; // 10 second timeout

// Retry configuration
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced API call with retry logic
export const apiCall = async (config, retryCount = 0) => {
  try {
    const response = await axios(config);
    // Handle 304 Not Modified: return empty data if no data is present
    if (response.status === 304) {
      return { data: {} };
    }
    return response;
  } catch (error) {
    // Don't retry on authentication errors or client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      throw error;
    }

    // Retry on network errors or server errors (5xx)
    if (retryCount < RETRY_ATTEMPTS && (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
      console.log(`API call failed, retrying... (${retryCount + 1}/${RETRY_ATTEMPTS})`);
      await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      return apiCall(config, retryCount + 1);
    }

    throw error;
  }
};

// Helper function to handle API errors consistently
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  let message = defaultMessage;
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    message = 'Server connection timeout. Please try again.';
  } else if (!error.response) {
    message = 'Unable to connect to server. Please check your connection.';
  } else if (error.response?.status === 401) {
    message = 'Authentication failed. Please log in again.';
  } else if (error.response?.status === 403) {
    message = 'Access denied. You do not have permission for this action.';
  } else if (error.response?.status >= 500) {
    message = 'Server error. Please try again later.';
  }

  toast.error(message);
  return { success: false, message };
};

// Helper function to make authenticated requests
export const authenticatedRequest = async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return apiCall(config);
}; 