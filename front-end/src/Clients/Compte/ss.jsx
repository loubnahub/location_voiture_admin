const sampleNotificationsData = [
  {
    id: 'n1',
    type: 'contract_ready',
    title: 'Your Rental Contract for BMW X3 is Ready!',
    // THIS IS THE KEY: The message contains the link and booking ID
    message: 'The rental agreement for your Booking #45b8cd3d is ready. Please review and sign it.\n\nDownload Link: http://localhost:8000/api/rental-agreements/d72309de-8ec2-4809-bc75-11885389b9e3/download?expires=1750272158&signature=7998d0eacffdcf3beab92a3ad8c1d72f379700f8883b87bce1dff4ff17a6a0d4',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    isRead: false,
    // We might not need contractDetails if info is parsed from message
    // contractDetails: { /* ... */ }, 
    actions: [
      { label: 'Mark as Read', type: 'mark_read', variant: 'secondary' }
    ]
  },
  // ... other notifications
];