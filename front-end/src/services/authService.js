import apiClient from './api'; // Your configured axios instance for /api endpoints
import axios from 'axios'; // For direct requests outside apiClient's baseURL

const API_URL = '/api';

// --- LOGIN ---
export const loginUser = async (credentials) => {
  try {
    // Get CSRF cookie for Laravel Sanctum (cookie-based auth or just for security)
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
    } catch (csrfError) {
      console.warn("CSRF cookie fetch failed, proceeding with login attempt...", csrfError);
    }

    // Login via API (token-based or session-based)
    const response = await apiClient.post('/login', credentials);
    if (response.data && response.data.token && response.data.user) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error("Login API error:", error.response?.data || error.message);
    throw error.response?.data || { message: error.message || "Login failed" };
  }
};

// --- REGISTER ---
export const registerUser = async (userData) => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
    const response = await apiClient.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error("Register API error:", error.response || error.message);
    throw error.response?.data || { message: error.message || "Registration failed" };
  }
};

// --- LOGOUT ---
export const logoutUser = async () => {
  try {
    await apiClient.post('/logout');
  } catch (error) {
    console.error("Logout API error:", error.response || error.message);
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }
};

// --- GET CURRENT USER ---
export const getCurrentAuthenticatedUser = async () => {
  try {
    const response = await apiClient.get('/user');
    if (response.data) {
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Get current user API error:", error.response || error.message);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    throw error.response?.data || { message: error.message || "Failed to fetch user" };
  }
};

export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const getStoredUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};