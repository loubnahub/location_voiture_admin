// --- DEFINE sampleNotifications HERE ---
const sampleNotificationsData = [
  {
    id: 'n1',
    type: 'contract_ready',
    title: 'Your Rental Contract for BMW X3 is Ready!',
    message: 'The rental agreement for your booking #12345 (BMW X3) is now available for review and download.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    isRead: false,
    contractDetails: {
      documentName: 'Rental_Agreement_BMW_X3_Booking_12345.pdf',
      contractId: 'C789',
      vehicleInfo: 'BMW X3 - 2024 Model',
      bookingId: 'B12345',
      downloadUrl: '/api/contracts/C789/download', // Example API endpoint
      viewUrl: '/my-account/bookings/B12345/contract', // Example client route
    },
    actions: [
      { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
    ]
  },
  {
    id: 'n2',
    type: 'promotion',
    title: 'Weekend Special: 25% Off SUVs!',
    message: 'Book any SUV this weekend and get a 25% discount. Don\'t miss out on this limited-time offer.',
    timestamp: new Date(Date.now() - 3600000 * 24 * 1).toISOString(), // 1 day ago
    isRead: false,
    promotionDetails: {
      promoCode: 'SUVWKND25',
      discount: '25%',
      appliesTo: 'All SUV Models',
      offerUrl: '/offers/suv-weekend',
      expiryDate: new Date(Date.now() + 3600000 * 24 * 3).toISOString(), // Expires in 3 days
    },
    actions: [
        { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
    ]
  },
  {
    id: 'n3',
    type: 'booking_update',
    title: 'Your Audi A4 Pickup Time Changed',
    message: 'Your pickup time for booking #B67890 (Audi A4) has been updated to 3:00 PM on July 20, 2024.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    isRead: true,
    bookingDetails: {
        bookingId: 'B67890',
        vehicleInfo: 'Audi A4',
        viewUrl: '/my-account/bookings/B67890'
    },
    actions: [
      { label: 'View Booking', type: 'view_booking', variant: 'primary', payload: { bookingId: 'B67890', viewUrl: '/my-account/bookings/B67890' } }
    ]
  },
  {
    id: 'n4',
    type: 'general_reminder',
    title: 'Upcoming: Vehicle Return',
    message: 'Friendly reminder: Your Tesla Model S is due for return tomorrow by 10:00 AM at our Downtown location.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    isRead: false,
    actions: [
        { label: 'View Details', type: 'view_details', variant: 'primary', payload: { detailsUrl: '/my-account/bookings/B11223' } },
        { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
    ]
  },
  {
    id: 'n5',
    type: 'contract_ready',
    title: 'Mercedes C-Class Contract Finalized',
    message: 'Your contract for the Mercedes C-Class (Booking #B00789) is ready. Please review and sign at your earliest convenience.',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    isRead: true,
    contractDetails: {
      documentName: 'Contract_Mercedes_CClass_B00789.pdf',
      contractId: 'C101',
      vehicleInfo: 'Mercedes C-Class - 2023 Edition',
      bookingId: 'B00789',
      downloadUrl: '/api/contracts/C101/download',
      viewUrl: '/my-account/bookings/B00789/contract',
    },
    actions: [
      // No "Mark as Read" if already read
    ]
  },
  {
    id: 'n6',
    type: 'promotion',
    title: 'Exclusive Offer for Loyal Customers!',
    message: 'As a thank you for your loyalty, enjoy an additional 10% off your next rental. Use code LOYAL10.',
    timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 days ago
    isRead: false,
    promotionDetails: {
      promoCode: 'LOYAL10',
      discount: '10% (additional)',
      appliesTo: 'Next Rental',
      offerUrl: '/my-account/rewards', // Could link to a rewards page
      // No explicit expiry, or a very long one
    },
    actions: [
        { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
    ]
  },
  {
    id: 'n7',
    type: 'general_reminder',
    title: 'Payment Due Soon',
    message: 'A payment for your upcoming rental (Booking #B99001) is due in 3 days. Ensure your payment method is up to date.',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
    isRead: false,
    actions: [
        { label: 'Update Payment', type: 'update_payment', variant: 'primary', payload: { bookingId: 'B99001', paymentUrl: '/my-account/billing' } },
        { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
    ]
  }
];
// --- END OF sampleNotificationsData DEFINITION ---