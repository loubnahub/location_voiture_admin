export const VehicleStatus = Object.freeze({
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  UNAVAILABLE: 'unavailable',
  PENDING_INSPECTION: 'pending_inspection',
  DAMAGED: 'damaged',
});
// src/Enums.js
export const BookingStatus = Object.freeze({
  PENDING_CONFIRMATION: 'pending_confirmation',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED_BY_USER: 'cancelled_by_user',
  CANCELLED_BY_PLATFORM: 'cancelled_by_platform',
  // Add other statuses if any
});
// ... other enums ...