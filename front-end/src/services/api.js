// src/services/api.js
import axios from 'axios';

// Configure an Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Your Laravel API URL
  withCredentials: true, // ESSENTIAL for Sanctum SPA cookie-based authentication
  headers: {
    'Accept': 'application/json', // We expect JSON responses
    'Content-Type': 'application/json', // When we send data (like for POST/PUT)
  },
});

// --- Authentication Functions (Basic Examples) ---
export const login = async (credentials) => {
  await apiClient.get('/sanctum/csrf-cookie');
  return apiClient.post('/login', credentials);
};

export const fetchCurrentUser = () => {
  return apiClient.get('/user');
};
// src/services/api.js
// ... (apiClient and other functions) ...

// --- Operational Hold Functions ---
export const fetchAllOperationalHolds = (params = {}) => {
  // Backend pagination is good for holds as they can accumulate
  return apiClient.get('/operational-holds', { params });
};

export const createOperationalHold = async (holdData) => {
  return apiClient.post('/operational-holds', holdData);
};

export const updateOperationalHold = async (id, holdData) => {
  return apiClient.put(`/operational-holds/${id}`, holdData);
};

export const deleteOperationalHold = async (id) => {
  return apiClient.delete(`/operational-holds/${id}`);
};

export const logout = () => {
  return apiClient.post('/logout');
};
export const fetchAllUsersForAdmin = (params = {}) => { // Renamed to distinguish from general user fetch
  console.log("api.js: fetchAllUsersForAdmin called with params:", params);
  console.log("api.js: apiClient.defaults.baseURL for this call:", apiClient.defaults.baseURL);
  return apiClient.get('/users', { params }); // Assumes /api/users endpoint
};

export const createUserAdmin = (userData) => {
  return apiClient.post('/users', userData);
};

export const fetchUserAdmin = (id) => {
  return apiClient.get(`/users/${id}`);
};

export const updateUserAdmin = (id, userData) => {
  return apiClient.put(`/users/${id}`, userData);
};

export const deleteUserAdmin = (id) => {
  return apiClient.delete(`/users/${id}`);
};

// You might also want a function to fetch available roles if they are dynamic
export const fetchAvailableRoles = () => {
    return apiClient.get('/roles'); // Assuming you create a simple /api/roles endpoint in Laravel
}
// --- Feature Functions ---
export const fetchAllFeatures = (searchTerm = '', sortBy = 'name', sortDirection = 'asc') => {
  return apiClient.get('/features', {
    params: { all: true, search: searchTerm, sort_by: sortBy, sort_direction: sortDirection }
  });
};
export const createFeature = (featureData) => apiClient.post('/features', featureData);
export const updateFeature = (id, featureData) => apiClient.put(`/features/${id}`, featureData);
export const deleteFeature = (id) => apiClient.delete(`/features/${id}`);

// --- Extra Functions ---
export const fetchAllExtras = (params = {}) => {
  const defaultParams = { all: true, sort_by: 'name', sort_direction: 'asc' };
  
  return apiClient.get('/extras', {
    params: { ...defaultParams, ...params } 
  });
};
export const createExtra = (extraData) => apiClient.post('/extras', extraData);
export const updateExtra = (id, extraData) => apiClient.put(`/extras/${id}`, extraData);
export const deleteExtra = (id) => apiClient.delete(`/extras/${id}`);

// --- Insurance Plan Functions ---
// CORRECTED: Accepts a general params object
export const fetchAllInsurancePlans = (params = {}) => {
  return apiClient.get('/insurance-plans', { params });
};
export const createInsurancePlan = (planData) => apiClient.post('/insurance-plans', planData);
export const updateInsurancePlan = (id, planData) => apiClient.put(`/insurance-plans/${id}`, planData);
export const deleteInsurancePlan = (id) => apiClient.delete(`/insurance-plans/${id}`);

// --- Vehicle Functions ---
export const fetchAllVehicles = (params = {}) => apiClient.get('/vehicles', { params });
export const fetchVehicle = (id) => apiClient.get(`/vehicles/${id}`);
export const createVehicle = (vehicleData) => apiClient.post('/vehicles', vehicleData);
export const updateVehicle = (id, vehicleData) => apiClient.put(`/vehicles/${id}`, vehicleData);
export const deleteVehicle = (id) => apiClient.delete(`/vehicles/${id}`);

// --- Vehicle Model Functions ---
export const fetchAllVehicleModels = (searchTerm = '', searchField = 'all', sortBy = 'created_at', sortDirection = 'desc') => {
  return apiClient.get('/vehicle-models', {
    params: { search: searchTerm, search_in: searchField, sort_by: sortBy, sort_direction: sortDirection }
  });
};

// --- Vehicle Type Functions ---
export const fetchAllVehicleTypes = (searchTerm = '', sortBy = 'name', sortDirection = 'asc') => {
  return apiClient.get('/vehicle-types', {
    params: { all: true, search: searchTerm, sort_by: sortBy, sort_direction: sortDirection }
  });
};
export const createVehicleType = (vehicleTypeData) => apiClient.post('/vehicle-types', vehicleTypeData);
export const fetchVehicleType = (id) => apiClient.get(`/vehicle-types/${id}`);
export const updateVehicleType = (id, vehicleTypeData) => apiClient.put(`/vehicle-types/${id}`, vehicleTypeData);
export const deleteVehicleType = (id) => apiClient.delete(`/vehicle-types/${id}`);

// --- Booking Functions ---
export const fetchAllBookings = (params = {}) => apiClient.get('/bookings', { params });
export const fetchBooking = (id) => apiClient.get(`/bookings/${id}`);
export const createBooking = (bookingData) => apiClient.post('/bookings', bookingData);
export const updateBooking = (id, bookingData) => apiClient.put(`/bookings/${id}`, bookingData);
export const deleteBooking = (id) => apiClient.delete(`/bookings/${id}`);
export const confirmBookingApi = (bookingId) => apiClient.post(`/bookings/${bookingId}/confirm`);
export const completeBookingApi = (bookingId) => apiClient.post(`/bookings/${bookingId}/complete`);

// --- User Related Booking Functions (Client-side) ---
export const fetchMyBookings = (params = {}) => apiClient.get('/my-bookings', { params });
export const fetchMyBookingDetail = (bookingId) => apiClient.get(`/my-bookings/${bookingId}`);
export const cancelMyBookingApi = (bookingId) => apiClient.post(`/my-bookings/${bookingId}/cancel`);

// --- User Functions ---
export const fetchAllUsers = (params = {}) => apiClient.get('/users', { params });

// --- Address Functions ---
export const fetchAllAddresses = (params = {}) => apiClient.get('/addresses', { params });


export default apiClient;