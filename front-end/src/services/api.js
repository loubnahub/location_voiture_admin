import axios from 'axios';

// Configure an Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Your Laravel API URL
  withCredentials: true, // ESSENTIAL for Sanctum SPA cookie-based authentication
  headers: {
    'Accept': 'application/json',
  },
});

// Interceptor to dynamically set Content-Type for FormData
apiClient.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']; // Let Axios set it for FormData
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'; // Default for JSON
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// --- Authentication Functions ---
export const login = async (credentials) => {
  await apiClient.get('/sanctum/csrf-cookie');
  return apiClient.post('/login', credentials);
};
export const fetchCurrentUser = () => apiClient.get('/user');
export const logout = () => apiClient.post('/logout');

// --- User Functions (Admin) ---
export const fetchAllUsersForAdmin = (params = {}) => apiClient.get('/admin/users', { params });
export const createUserAdmin = (userData) => apiClient.post('/admin/users', userData);
export const fetchUserAdmin = (id) => apiClient.get(`/admin/users/${id}`);
export const updateUserAdmin = (id, userData) => {
  if (userData instanceof FormData) { // Handle FormData for potential file uploads like profile pics
    return apiClient.post(`/admin/users/${id}`, userData); // POST with _method=PUT for FormData
  }
  return apiClient.put(`/admin/users/${id}`, userData);
};
export const deleteUserAdmin = (id) => apiClient.delete(`/admin/users/${id}`);
export const fetchAvailableRoles = () => apiClient.get('/admin/roles-list');

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

// --- Vehicle Model Functions ---
export const fetchAllVehicleModels = (params = {}) => apiClient.get('/vehicle-models', { params });
// Add CUD for Vehicle Models if needed

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
export const fetchAllFeatures = (params = {}) => apiClient.get('/features', { params });
export const createFeature = (data) => apiClient.post('/features', data);
export const updateFeature = (id, data) => apiClient.put(`/features/${id}`, data);
export const deleteFeature = (id) => apiClient.delete(`/features/${id}`);

// --- Extra Functions ---
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
// Add CUD for Addresses if managed globally, or use user-specific address endpoints

// --- Damage Report Functions ---
export const fetchAllDamageReports = (params = {}) => apiClient.get('/damage-reports', { params });
export const createDamageReport = (data) => apiClient.post('/damage-reports', data);
export const fetchDamageReport = (id) => apiClient.get(`/damage-reports/${id}`);
export const updateDamageReport = (id, data) => {
  if (data instanceof FormData) {
    return apiClient.post(`/damage-reports/${id}`, data); // POST with _method=PUT
  }
  return apiClient.put(`/damage-reports/${id}`, data);
};
export const deleteDamageReport = (id) => apiClient.delete(`/damage-reports/${id}`);

// --- Rental Agreement Functions ---
export const fetchAllRentalAgreements = (params = {}) => {
  return apiClient.get('/rental-agreements', { params });
};

/**
 * Generates a new rental agreement.
 * @param {object} agreementData - Object containing booking_id, notes (optional),
 *                                signed_by_renter_at (optional), signed_by_platform_at (optional).
 */
export const generateRentalAgreement = async (agreementData) => {
  return apiClient.post('/rental-agreements/generate', agreementData);
};

export const fetchRentalAgreement = async (id) => {
  return apiClient.get(`/rental-agreements/${id}`);
};

// Updates notes or signing status of an existing agreement
export const updateRentalAgreement = async (id, agreementData) => {
  return apiClient.put(`/rental-agreements/${id}`, agreementData);
};

export const deleteRentalAgreement = async (id) => {
  return apiClient.delete(`/rental-agreements/${id}`);
};

export const getRentalAgreementDownloadUrl = (agreementId) => {
  const baseUrl = apiClient.defaults.baseURL || 'http://localhost:8000/api';
  return `${baseUrl}/rental-agreements/${agreementId}/download`;
};

/**
 * Triggers sending an in-app rental agreement notification to the customer.
 * @param {string} agreementId - The ID of the rental agreement.
 */
export const sendRentalAgreementNotification = async (agreementId) => {
  return apiClient.post(`/rental-agreements/${agreementId}/send-notification`);
};
// ... (other imports and apiClient setup) ...

// --- Promotion Campaign Functions ---
export const fetchAllPromotionCampaigns = (params = {}) => {
  return apiClient.get('/promotion-campaigns', { params });
};

export const fetchPromotionCampaign = async (id) => {
  return apiClient.get(`/promotion-campaigns/${id}`);
};

// MODIFIED: Ensure campaignData can include reward_type and code_validity_days
export const createPromotionCampaign = async (campaignData) => {
  // campaignData might look like:
  // { name: "...", description: "...", required_rental_count: 5, reward_value: 10,
  //   reward_type: "percentage", code_validity_days: 30, is_active: true, ... }
  return apiClient.post('/promotion-campaigns', campaignData);
};

// MODIFIED: Ensure campaignData can include reward_type and code_validity_days
export const updatePromotionCampaign = async (id, campaignData) => {
  return apiClient.put(`/promotion-campaigns/${id}`, campaignData);
};

export const deletePromotionCampaign = async (id) => {
  return apiClient.delete(`/promotion-campaigns/${id}`);
};
// ... (other imports and apiClient setup) ...


// --- Promotion Code Functions ---
export const fetchAllPromotionCodes = (params = {}) => {
  return apiClient.get('/promotion-codes', { params });
};

export const fetchPromotionCode = async (id) => {
  return apiClient.get(`/promotion-codes/${id}`);
};

// For manually creating a code (if you decide to add this button)
export const createPromotionCode = async (codeData) => {
  // codeData would include: promotion_campaign_id, user_id (optional), code_string, expires_at, status
  return apiClient.post('/promotion-codes', codeData);
};

// For updating a code (e.g., status, expires_at)
export const updatePromotionCode = async (id, codeData) => {
  return apiClient.put(`/promotion-codes/${id}`, codeData);
};

export const deletePromotionCode = async (id) => {
  return apiClient.delete(`/promotion-codes/${id}`);
};

// --- Helper functions to fetch lists for dropdowns in the modal form ---
export const fetchUsersForPromotionCodeDropdown = (params = {}) => {
    // This route was defined as 'promotion-codes/lov/users'
    return apiClient.get('/promotion-codes/lov/users', { params });
};

export const fetchCampaignsForPromotionCodeDropdown = (params = {}) => {
    // This route was defined as 'promotion-codes/lov/campaigns'
    return apiClient.get('/promotion-codes/lov/campaigns', { params });
};

export const validatePromotionCode = async (codeString, context = {}) => {
  // context might include: booking_subtotal, user_id, vehicle_id
  return apiClient.post('/promotion-codes/validate-apply', {
    code_string: codeString,
    ...context
  });
};

// In src/services/api.js

// ... (axios instance and other functions) ...

export const fetchAllPayments = (params) => apiClient.get('/payments', { params });
export const createPayment = (data) => apiClient.post('/payments', data);
export const updatePayment = (id, data) => apiClient.put(`/payments/${id}`, data);
export const deletePayment = (id) => apiClient.delete(`/payments/${id}`);

// Example for fetching bookings for dropdown
export const fetchBookingsForDropdown = () => apiClient.get('/bookings-for-dropdown'); // You need to implement this endpoint

// Example for fetching payment statuses if not hardcoded on frontend
export const fetchPaymentStatusOptions = () => apiClient.get('/payment-status-options');
// Export the apiClient instance if it's used directly elsewhere (e.g., for interceptors in app setup)
export default apiClient;