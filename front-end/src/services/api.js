// src/services/api.js

import axios from 'axios';

// Configure an Axios instance for your API endpoints
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Your Laravel API URL
  withCredentials: true, // ESSENTIAL for Sanctum SPA cookie-based authentication
  headers: {
    'Accept': 'application/json',
  },
});

// Interceptor to dynamically set Content-Type for FormData
apiClient.interceptors.request.use(
  (config) => {
    // It gets the token from localStorage at the last possible moment.
    const token = localStorage.getItem('authToken');
    
    // If a token exists, it attaches it to the request as a Bearer token.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; // It returns the modified request config.
  },
  (error) => {
    // If there's an error setting up the request, it's rejected.
    return Promise.reject(error);
  }
);


// --- Authentication Functions ---
export const login = async (credentials) => {
  // --- THIS IS THE FIX ---
  // Use a direct axios call for the CSRF cookie to bypass the '/api' prefix.
  await axios.get('http://localhost:8000/sanctum/csrf-cookie');

  // Then use the configured apiClient for the actual login request.
  return apiClient.post('/login', credentials);
};

export const fetchCurrentUser = () => apiClient.get('/user');
export const logout = () => apiClient.post('/logout');

// --- User Functions (Admin) ---
export const fetchAllUsersForAdmin = (params = {}) => apiClient.get('/admin/users', { params });
export const createUserAdmin = (userData) => apiClient.post('/admin/users', userData);
export const fetchUserAdmin = (id) => apiClient.get(`/admin/users/${id}`);
export const updateUserAdmin = (id, userData) => {
  if (userData instanceof FormData) {
    return apiClient.post(`/admin/users/${id}`, userData);
  }
  return apiClient.put(`/admin/users/${id}`, userData);
};
export const deleteUserAdmin = (id) => apiClient.delete(`/admin/users/${id}`);
export const fetchAvailableRoles = () => apiClient.get('/admin/roles-list');

// ... (The rest of your api.js file remains unchanged and is correct) ...

// --- Role Functions (Admin) ---
export const fetchAllRolesAdmin = (params = {}) => apiClient.get('/admin/system/roles', { params });
export const createRoleAdmin = (roleData) => apiClient.post('/admin/system/roles', roleData);
export const fetchRoleAdmin = (id) => apiClient.get(`/admin/system/roles/${id}`);
export const updateRoleAdmin = (id, roleData) => apiClient.put(`/admin/system/roles/${id}`, roleData);
export const deleteRoleAdmin = (id) => apiClient.delete(`/admin/system/roles/${id}`);

// --- Vehicle Functions ---
export const fetchAllVehicles = (params = {}) => apiClient.get('/vehicles', { params });
export const fetchVehicle = (id) => apiClient.get(`/vehicles/${id}`);
export const createVehicle = (vehicleData) => apiClient.post('/vehicles', vehicleData);
export const updateVehicle = (id, vehicleData) => apiClient.put(`/vehicles/${id}`, vehicleData);
export const deleteVehicle = (id) => apiClient.delete(`/vehicles/${id}`);
export const updateAddress = (id, addressData) => apiClient.put(`/addresses/${id}`, addressData);
// --- Vehicle Model Functions ---
export const fetchAllVehicleModels = (params = {}) => apiClient.get('/vehicle-models', { params });
export const fetchVehicleModelById = (id) => apiClient.get(`/vehicle-models/${id}`);
export const createVehicleModel = (data) => apiClient.post('/vehicle-models', data); // Added for completeness
export const updateVehicleModel = (id, modelData) => {
  // If modelData could include file uploads and becomes FormData:
  if (modelData instanceof FormData) {
    return apiClient.post(`/vehicle-models/${id}`, modelData);
  }
  // For regular JSON updates:
  return apiClient.put(`/vehicle-models/${id}`, modelData);
};
export const createAddress = (addressData) => {
  return apiClient.post('/addresses', addressData); // Ensure your API endpoint for creating addresses is correct
};
export const deleteVehicleModel = (id) => apiClient.delete(`/vehicle-models/${id}`); // Added for completeness

// --- Vehicle Type Functions ---
export const fetchAllVehicleTypes = (params = {}) => apiClient.get('/vehicle-types', { params });
export const createVehicleType = (data) => apiClient.post('/vehicle-types', data);
export const fetchVehicleType = (id) => apiClient.get(`/vehicle-types/${id}`);
export const updateVehicleType = (id, data) => apiClient.put(`/vehicle-types/${id}`, data);
export const deleteVehicleType = (id) => apiClient.delete(`/vehicle-types/${id}`);

// --- Booking Functions ---
export const fetchAllBookings = (params = {}) => apiClient.get('/bookings', { params });
export const fetchBooking = (id) => apiClient.get(`/bookings/${id}`);
export const createBooking = (data) => apiClient.post('/bookings', data);
export const updateBooking = (id, data) => apiClient.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => apiClient.delete(`/bookings/${id}`);
export const confirmBookingApi = (id) => apiClient.post(`/bookings/${id}/confirm`);
export const completeBookingApi = (id) => apiClient.post(`/bookings/${id}/complete`);

// --- User-Specific Booking Functions ---
export const fetchMyBookings = (params = {}) => apiClient.get('/my-bookings', { params });
export const fetchMyBookingDetail = (id) => apiClient.get(`/my-bookings/${id}`);
export const cancelMyBookingApi = (id) => apiClient.post(`/my-bookings/${id}/cancel`);

// --- Operational Hold Functions ---
export const fetchAllOperationalHolds = (params = {}) => apiClient.get('/operational-holds', { params });
export const createOperationalHold = (data) => apiClient.post('/operational-holds', data);
export const updateOperationalHold = (id, data) => apiClient.put(`/operational-holds/${id}`, data);
export const deleteOperationalHold = (id) => apiClient.delete(`/operational-holds/${id}`);
export const fetchOperationalHold = (id) => apiClient.get(`/operational-holds/${id}`);

// --- Feature Functions ---
// Expects ?all=true for fetching all features for modals
export const fetchAllFeatures = (params = {}) => apiClient.get('/features', { params });
export const createFeature = (data) => apiClient.post('/features', data);
export const updateFeature = (id, data) => apiClient.put(`/features/${id}`, data);
export const deleteFeature = (id) => apiClient.delete(`/features/${id}`);

// --- Extra Functions ---
// Expects ?all=true for fetching all extras for modals
export const fetchAllExtras = (params = {}) => apiClient.get('/extras', { params });
export const createExtra = (data) => apiClient.post('/extras', data);
export const updateExtra = (id, data) => apiClient.put(`/extras/${id}`, data);
export const deleteExtra = (id) => apiClient.delete(`/extras/${id}`);

// --- Insurance Plan Functions ---
export const fetchAllInsurancePlans = (params = {}) => apiClient.get('/insurance-plans', { params });
export const createInsurancePlan = (data) => apiClient.post('/insurance-plans', data);
export const updateInsurancePlan = (id, data) => apiClient.put(`/insurance-plans/${id}`, data);
export const deleteInsurancePlan = (id) => apiClient.delete(`/insurance-plans/${id}`);

// --- Address Functions ---
export const fetchAllAddresses = (params = {}) => apiClient.get('/addresses', { params });

// --- Damage Report Functions ---
export const fetchAllDamageReports = (params = {}) => apiClient.get('/damage-reports', { params });
export const createDamageReport = (data) => apiClient.post('/damage-reports', data);
export const fetchDamageReport = (id) => apiClient.get(`/damage-reports/${id}`);
export const updateDamageReport = (id, data) => {
  if (data instanceof FormData) {
    return apiClient.post(`/damage-reports/${id}`, data); // POST with _method=PUT or rely on Laravel to handle POST for update with FormData
  }
  return apiClient.put(`/damage-reports/${id}`, data);
};
export const deleteDamageReport = (id) => apiClient.delete(`/damage-reports/${id}`);

// --- Rental Agreement Functions ---
export const fetchAllRentalAgreements = (params = {}) => apiClient.get('/rental-agreements', { params });
export const generateRentalAgreement = async (agreementData) => apiClient.post('/rental-agreements/generate', agreementData);
export const fetchRentalAgreement = async (id) => apiClient.get(`/rental-agreements/${id}`);
export const updateRentalAgreement = async (id, agreementData) => apiClient.put(`/rental-agreements/${id}`, agreementData);
export const deleteRentalAgreement = async (id) => apiClient.delete(`/rental-agreements/${id}`);
export const getRentalAgreementDownloadUrl = (agreementId) => {
  const baseUrl = apiClient.defaults.baseURL || 'http://localhost:8000/api';
  return `${baseUrl}/rental-agreements/${agreementId}/download`;
};
export const sendRentalAgreementNotification = async (agreementId) => apiClient.post(`/rental-agreements/${agreementId}/send-notification`);

// --- Promotion Campaign Functions ---
export const fetchAllPromotionCampaigns = (params = {}) => apiClient.get('/promotion-campaigns', { params });
export const fetchPromotionCampaign = async (id) => apiClient.get(`/promotion-campaigns/${id}`);
export const createPromotionCampaign = async (campaignData) => apiClient.post('/promotion-campaigns', campaignData);
export const updatePromotionCampaign = async (id, campaignData) => apiClient.put(`/promotion-campaigns/${id}`, campaignData);
export const deletePromotionCampaign = async (id) => apiClient.delete(`/promotion-campaigns/${id}`);

// --- Promotion Code Functions ---
export const fetchAllPromotionCodes = (params = {}) => apiClient.get('/promotion-codes', { params });
export const fetchPromotionCode = async (id) => apiClient.get(`/promotion-codes/${id}`);
export const createPromotionCode = async (codeData) => apiClient.post('/promotion-codes', codeData);
export const updatePromotionCode = async (id, codeData) => apiClient.put(`/promotion-codes/${id}`, codeData);
export const deletePromotionCode = async (id) => apiClient.delete(`/promotion-codes/${id}`);
export const fetchUsersForPromotionCodeDropdown = (params = {}) => apiClient.get('/promotion-codes/lov/users', { params });
export const fetchCampaignsForPromotionCodeDropdown = (params = {}) => apiClient.get('/promotion-codes/lov/campaigns', { params });
export const validatePromotionCode = async (codeString, context = {}) => apiClient.post('/promotion-codes/validate-apply', { code_string: codeString, ...context });

// --- Payment Functions ---
export const fetchAllPayments = (params) => apiClient.get('/payments', { params });
export const createPayment = (data) => apiClient.post('/payments', data);
export const updatePayment = (id, data) => apiClient.put(`/payments/${id}`, data);
export const deletePayment = (id) => apiClient.delete(`/payments/${id}`);
export const fetchBookingsForDropdown = () => apiClient.get('/bookings-for-dropdown'); // Example
export const fetchPaymentStatusOptions = () => apiClient.get('/payment-status-options'); // Example
export const fetchVehicleModelMediaList = (vehicleModelId) => {
  return apiClient.get(`/vehicle-models/${vehicleModelId}/media`);
};


export const uploadVehicleModelMedia = (vehicleModelId, formData) => {
  // Axios will set the Content-Type to multipart/form-data due to the interceptor
  return apiClient.post(`/vehicle-models/${vehicleModelId}/media`, formData);
};


export const updateVehicleModelMediaItem = (mediaId, dataToUpdate) => {
  return apiClient.put(`/media/${mediaId}`, dataToUpdate);
 
};
export const deleteVehicleModelMediaItem = (mediaId) => {
  return apiClient.delete(`/media/${mediaId}`);
};
export const reorderVehicleModelMedia = (vehicleModelId, orderedMediaIds) => {
  return apiClient.post(`/vehicle-models/${vehicleModelId}/media/reorder`, {
    ordered_media_ids: orderedMediaIds,
  });
};

// Fetch all colors for a vehicle model
// Fetch all colors for a vehicle model
export const fetchVehicleModelColors = (vehicleModelId) =>
  apiClient.get(`/vehicle-models/${vehicleModelId}/colors`);
export const fetchAllVehicleModelsForDropdown = () => apiClient.get('/vehicle-models/list-all');
// Add a color to a vehicle model
export const addVehicleModelColor = (vehicleModelId, colorData) =>
  apiClient.post(`/vehicle-models/${vehicleModelId}/colors`, colorData);
export const updateVehicleModelColors = (vehicleModelId, colors) =>
  apiClient.put(`/vehicle-models/${vehicleModelId}/colors`, { colors });
export const deleteVehicleModelColor = (vehicleModelId, colorHex) =>
  apiClient.delete(`/vehicle-models/${vehicleModelId}/colors/${encodeURIComponent(colorHex)}`);
export default apiClient;