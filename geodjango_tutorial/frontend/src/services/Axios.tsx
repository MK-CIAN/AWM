import axios from 'axios';

// Creating an instance of axios
const Axios = axios.create({
  baseURL: 'https://c21755919awm24.xyz/api/', // Base URL
  timeout: 10000, // Request timeout (10 seconds)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Adding a request interceptor to include the Knox token
Axios.interceptors.request.use(
  (config) => {
    // Adding Knox token to Authorization header
    const token = localStorage.getItem('token'); //Check if token is stored in local storage
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Adding a response interceptor for error handling
Axios.interceptors.response.use(
  (response) => response, // Pass successful responses through
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default Axios;
