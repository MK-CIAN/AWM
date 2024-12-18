import axios from 'axios';

// Create an instance of axios with a custom configuration
const Axios = axios.create({
  baseURL: 'http://127.0.0.1:8001/api/', // Base URL for your API
  timeout: 10000, // Request timeout (10 seconds)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add a request interceptor to include the Knox token
Axios.interceptors.request.use(
  (config) => {
    // Add Knox token to Authorization header if available
    const token = localStorage.getItem('token'); // Replace 'localStorage' with 'sessionStorage' or another store if needed
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for error handling
Axios.interceptors.response.use(
  (response) => response, // Pass successful responses through
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default Axios;
