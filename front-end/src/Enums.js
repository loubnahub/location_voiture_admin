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
    PENDING_ASSESSMENT: 'pending_assessment',       // Newly reported, awaiting review
    UNDER_ASSESSMENT: 'under_assessment',         // Actively being reviewed/inspected
    ASSESSMENT_COMPLETE: 'assessment_complete',     // Inspection done, cost/repair plan may be set
    REPAIR_PENDING_QUOTE: 'repair_pending_quote', // Waiting for a repair quote
    REPAIR_QUOTE_RECEIVED: 'repair_quote_received', // Quote received, awaiting approval
    REPAIR_APPROVED: 'repair_approved',           // Repair work approved
    REPAIR_IN_PROGRESS: 'repair_in_progress',       // Vehicle is currently being repaired
    REPAIR_PENDING_PARTS: 'repair_pending_parts',   // Repair held up waiting for parts
    REPAIRED_PENDING_QC: 'repaired_pending_qc',     // Repair done, awaiting quality check
    RESOLVED_NO_COST: 'resolved_no_cost',         // Resolved without any financial cost (e.g., minor, wear & tear)
    RESOLVED_AWAITING_PAYMENT: 'resolved_awaiting_payment', // Repair done, cost determined, awaiting payment from responsible party
    RESOLVED_PAID: 'resolved_paid',               // All costs covered
    DISPUTED: 'disputed',                         // Customer or party disputes the damage/cost
    CLOSED_ARCHIVED: 'closed_archived',             // Report is fully finalized and archived
    // Add any other statuses relevant to your workflow
});
// src/Enums/PaymentStatus.js (or part of a larger Enums.js)

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
