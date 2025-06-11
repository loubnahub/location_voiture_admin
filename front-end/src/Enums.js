export const VehicleStatus = Object.freeze({
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  UNAVAILABLE: 'unavailable',
  PENDING_INSPECTION: 'pending_inspection',
  DAMAGED: 'damaged',
});
export const PromotionCodeStatus = Object.freeze({
    ACTIVE: { value: 'active', label: 'Active' },
    USED: { value: 'used', label: 'Used' },
    EXPIRED: { value: 'expired', label: 'Expired' },
    INACTIVE: { value: 'inactive', label: 'Inactive' },
    // Add PENDING if you have it in your PHP enum and need it
  
});

// If you prefer to export it directly for the alias `PromotionCodeStatusEnum`
// export const PromotionCodeStatusEnum = PromotionCodeStatus;
export const DamageReportStatus = Object.freeze({
    // These statuses exist in both and remain unchanged
    PENDING_ASSESSMENT: 'pending_assessment',
    UNDER_ASSESSMENT: 'under_assessment',
    ASSESSMENT_COMPLETE: 'assessment_complete',
    REPAIR_IN_PROGRESS: 'repair_in_progress',
    REPAIR_PENDING_PARTS: 'repair_pending_parts',
    REPAIRED_PENDING_QC: 'repaired_pending_qc',
    RESOLVED_NO_COST: 'resolved_no_cost',
    RESOLVED_AWAITING_PAYMENT: 'resolved_awaiting_payment',
    RESOLVED_PAID: 'resolved_paid',
    DISPUTED: 'disputed',
    CLOSED: 'closed',
});

export const PaymentStatus = Object.freeze({
    PENDING: { value: 'pending', label: 'Pending' },
    COMPLETED: { value: 'completed', label: 'Completed' },
    FAILED: { value: 'failed', label: 'Failed' },
    REFUNDED: { value: 'refunded', label: 'Refunded' },
    PARTIALLY_REFUNDED: { value: 'partially_refunded', label: 'Partially Refunded' },
    // Add any other statuses your backend App\Enums\PaymentStatus supports
});

// Helper for dropdowns
export const paymentStatusOptions = Object.values(PaymentStatus).map(status => ({
    value: status.value,
    label: status.label,
}));
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
