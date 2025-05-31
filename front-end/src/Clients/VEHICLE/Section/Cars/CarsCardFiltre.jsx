const allCarsData = [
  {
    id: 1,
    name: 'Luxury Bentley SUV ',
    brand: 'Bentley',
    type: 'Luxury SUV',
    price: 450,
    seats: 5,
    location: 'New York',
    modelName: 'Bentayga',
    transmission: 'Automatic',
    mileage: '12,000 km',
    bags: 4,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg',
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/Toyota.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'SUV',
    makeYear: '2023',
    fuelType: 'Petrol',
    capacityGroup: '+8', 
    description:
      'Experience ultimate luxury and performance with the Bentley Bentayga in New York. Top-tier comfort and cutting-edge technology.',
    extras: [
      { name: 'Full Tank of Fuel (Prepaid)', price: 120.0 },
      { name: 'Additional Driver', price: 25.0 },
      { name: 'GPS Navigation Unit', price: 15.00 }
    ],
    featuresListToUse : [
      {
        category: 'Interior & Comfort',
        items: [
          { name: 'Seating Material', value: 'Premium Leather' },
          { name: 'Front Seats', value: 'Heated & Ventilated Massage Seats' },
          { name: 'Climate Control', value: 'Four-zone automatic climate control' },
          { name: 'Sunroof', value: 'Panoramic Glass Roof' },
          { name: 'Audio System', value: 'Naim for Bentley Premium Audio' }
        ]
      },
      {
        category: 'Performance & Safety',
        items: [
            { name: 'Engine', value: 'W12 Twin-Turbo' },
            { name: 'Air Suspension', value: 'Adaptive Air Suspension' },
            { name: 'Driver Assistance', value: 'Advanced ADAS Package' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Sporty Convertible ',
    brand: 'Porsche',
    type: 'Convertible',
    price: 380,
    seats: 2,
    location: 'Miami',
    modelName: '911 Carrera Cabriolet',
    transmission: 'Automatic',
    mileage: '5,500 km',
    bags: 2,
    doors: 2,
    imageUrl: '/images/Cars/Bentley.jpg', 
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Sport',
    makeYear: '2024', 
    fuelType: 'Petrol',
    capacityGroup: '+2',
    description:
      'Feel the Miami breeze in this iconic Porsche 911 Cabriolet. Exhilarating performance and timeless design.',
    extras: [
      { name: 'Weekend Special Insurance', price: 50.0 },
      { name: 'Valet Parking Pass', price: 30.0 }
    ],
    featuresListToUse : [
      {
        category: 'Performance',
        items: [
          { name: 'Engine', value: 'Flat-Six Turbo' },
          { name: 'Top Speed', value: '180 mph' },
          { name: 'Acceleration (0-60)', value: '3.8s' }
        ]
      },
      {
        category: 'Interior Features',
        items: [
          { name: 'Seats', value: 'Sport Seats Plus' },
          { name: 'Infotainment', value: 'Porsche Communication Management (PCM)' },
          { name: 'Convertible Top', value: 'Fully Automatic Fabric Roof' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Reliable Sedan ',
    brand: 'Toyota',
    type: 'Sedan',
    price: 120,
    seats: 5,
    location: 'Oujda',
    modelName: 'Camry XLE',
    transmission: 'Automatic',
    mileage: '22,000 km',
    bags: 3,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg', 
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Sedan',
    makeYear: '2022',
    fuelType: 'Hybrid',
    capacityGroup: '+4',
    description:
      'A comfortable and fuel-efficient Toyota Camry, perfect for city driving and longer journeys in Oujda.',
    extras: [
      { name: 'Child Safety Seat', price: 10.0 },
      { name: 'Mobile Wi-Fi Hotspot', price: 8.00 }
      // Removed duplicate 'Mobile Wi-Fi Hotspot' entries
    ],
    featuresListToUse : [
      {
        category: 'Interior & Comfort',
        items: [
          { name: 'Seating Material', value: 'Fabric with Leather Trim' },
          { name: 'Infotainment', value: '7-inch Touchscreen Display' },
          { name: 'Climate Control', value: 'Dual-zone Automatic Climate Control' }
          // Removed duplicate 'Climate Control' entries
        ]
      },
      {
        category: 'Safety',
        items: [
          { name: 'Airbags', value: 'Advanced Airbag System' },
          { name: 'Safety Sense', value: 'Toyota Safety Sense 2.5+' }
          // Removed duplicate 'Safety Sense' entries
        ]
      }
    ]
  },
  {
    id: 4,
    name: 'Tesla Model S ',
    brand: 'Tesla',
    type: 'Electric Sedan',
    price: 300,
    seats: 5,
    location: 'New York',
    modelName: 'Model S Plaid',
    transmission: 'Automatic',
    mileage: '8,000 km',
    bags: 3,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg',
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Electric',
    makeYear: '2023',
    fuelType: 'Electric',
    capacityGroup: '+4',
    description:
      'Experience the future of driving with the Tesla Model S in New York. Blazing acceleration and long range.',
    extras: [
      { name: 'Full Self-Driving (Supervised)', price: 100.0 },
      { name: 'Premium Connectivity', price: 10.0 }
    ],
    featuresListToUse : [
      {
        category: 'Technology',
        items: [
          { name: 'Autopilot', value: 'Enhanced Autopilot' },
          { name: 'Display', value: '17-inch Cinematic Display' },
          { name: 'Range', value: '390+ miles (EPA est.)' }
        ]
      }
    ]
  },
  {
    id: 5,
    name: 'Luxury Bentley SUV ',
    brand: 'Bentley',
    type: 'Luxury SUV',
    price: 450,
    seats: 5,
    location: 'New York',
    modelName: 'Bentayga',
    transmission: 'Automatic',
    mileage: '12,000 km',
    bags: 4,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg',
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/Toyota.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'SUV',
    makeYear: '2023',
    fuelType: 'Petrol',
    capacityGroup: '+8', 
    description:
      'Experience ultimate luxury and performance with the Bentley Bentayga in New York. Top-tier comfort and cutting-edge technology.',
    extras: [
      { name: 'Full Tank of Fuel (Prepaid)', price: 120.0 },
      { name: 'Additional Driver', price: 25.0 },
      { name: 'GPS Navigation Unit', price: 15.00 }
    ],
    featuresListToUse : [
      {
        category: 'Interior & Comfort',
        items: [
          { name: 'Seating Material', value: 'Premium Leather' },
          { name: 'Front Seats', value: 'Heated & Ventilated Massage Seats' },
          { name: 'Climate Control', value: 'Four-zone automatic climate control' },
          { name: 'Sunroof', value: 'Panoramic Glass Roof' },
          { name: 'Audio System', value: 'Naim for Bentley Premium Audio' }
        ]
      },
      {
        category: 'Performance & Safety',
        items: [
            { name: 'Engine', value: 'W12 Twin-Turbo' },
            { name: 'Air Suspension', value: 'Adaptive Air Suspension' },
            { name: 'Driver Assistance', value: 'Advanced ADAS Package' }
        ]
      }
    ]
  },
  {
    id: 6,
    name: 'Sporty Convertible ',
    brand: 'Porsche',
    type: 'Convertible',
    price: 380,
    seats: 2,
    location: 'Miami',
    modelName: '911 Carrera Cabriolet',
    transmission: 'Automatic',
    mileage: '5,500 km',
    bags: 2,
    doors: 2,
    imageUrl: '/images/Cars/Bentley.jpg', 
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Sport',
    makeYear: '2024', 
    fuelType: 'Petrol',
    capacityGroup: '+2',
    description:
      'Feel the Miami breeze in this iconic Porsche 911 Cabriolet. Exhilarating performance and timeless design.',
    extras: [
      { name: 'Weekend Special Insurance', price: 50.0 },
      { name: 'Valet Parking Pass', price: 30.0 }
    ],
    featuresListToUse : [
      {
        category: 'Performance',
        items: [
          { name: 'Engine', value: 'Flat-Six Turbo' },
          { name: 'Top Speed', value: '180 mph' },
          { name: 'Acceleration (0-60)', value: '3.8s' }
        ]
      },
      {
        category: 'Interior Features',
        items: [
          { name: 'Seats', value: 'Sport Seats Plus' },
          { name: 'Infotainment', value: 'Porsche Communication Management (PCM)' },
          { name: 'Convertible Top', value: 'Fully Automatic Fabric Roof' }
        ]
      }
    ]
  },
  {
    id: 7,
    name: 'Reliable Sedan ',
    brand: 'Toyota',
    type: 'Sedan',
    price: 120,
    seats: 5,
    location: 'Oujda',
    modelName: 'Camry XLE',
    transmission: 'Automatic',
    mileage: '22,000 km',
    bags: 3,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg', 
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Sedan',
    makeYear: '2022',
    fuelType: 'Hybrid',
    capacityGroup: '+4',
    description:
      'A comfortable and fuel-efficient Toyota Camry, perfect for city driving and longer journeys in Oujda.',
    extras: [
      { name: 'Child Safety Seat', price: 10.0 },
      { name: 'Mobile Wi-Fi Hotspot', price: 8.00 }
      // Removed duplicate 'Mobile Wi-Fi Hotspot' entries
    ],
    featuresListToUse : [
      {
        category: 'Interior & Comfort',
        items: [
          { name: 'Seating Material', value: 'Fabric with Leather Trim' },
          { name: 'Infotainment', value: '7-inch Touchscreen Display' },
          { name: 'Climate Control', value: 'Dual-zone Automatic Climate Control' }
          // Removed duplicate 'Climate Control' entries
        ]
      },
      {
        category: 'Safety',
        items: [
          { name: 'Airbags', value: 'Advanced Airbag System' },
          { name: 'Safety Sense', value: 'Toyota Safety Sense 2.5+' }
          // Removed duplicate 'Safety Sense' entries
        ]
      }
    ]
  },
  {
    id: 8,
    name: 'Tesla Model S ',
    brand: 'Tesla',
    type: 'Electric Sedan',
    price: 300,
    seats: 5,
    location: 'New York',
    modelName: 'Model S Plaid',
    transmission: 'Automatic',
    mileage: '8,000 km',
    bags: 3,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg',
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Electric',
    makeYear: '2023',
    fuelType: 'Electric',
    capacityGroup: '+4',
    description:
      'Experience the future of driving with the Tesla Model S in New York. Blazing acceleration and long range.',
    extras: [
      { name: 'Full Self-Driving (Supervised)', price: 100.0 },
      { name: 'Premium Connectivity', price: 10.0 }
    ],
    featuresListToUse : [
      {
        category: 'Technology',
        items: [
          { name: 'Autopilot', value: 'Enhanced Autopilot' },
          { name: 'Display', value: '17-inch Cinematic Display' },
          { name: 'Range', value: '390+ miles (EPA est.)' }
        ]
      }
    ]
  },
  {
    id: 9,
    name: 'Luxury Bentley SUV ',
    brand: 'Bentley',
    type: 'Luxury SUV',
    price: 450,
    seats: 5,
    location: 'New York',
    modelName: 'Bentayga',
    transmission: 'Automatic',
    mileage: '12,000 km',
    bags: 4,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg',
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/Toyota.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'SUV',
    makeYear: '2023',
    fuelType: 'Petrol',
    capacityGroup: '+8', 
    description:
      'Experience ultimate luxury and performance with the Bentley Bentayga in New York. Top-tier comfort and cutting-edge technology.',
    extras: [
      { name: 'Full Tank of Fuel (Prepaid)', price: 120.0 },
      { name: 'Additional Driver', price: 25.0 },
      { name: 'GPS Navigation Unit', price: 15.00 }
    ],
    featuresListToUse : [
      {
        category: 'Interior & Comfort',
        items: [
          { name: 'Seating Material', value: 'Premium Leather' },
          { name: 'Front Seats', value: 'Heated & Ventilated Massage Seats' },
          { name: 'Climate Control', value: 'Four-zone automatic climate control' },
          { name: 'Sunroof', value: 'Panoramic Glass Roof' },
          { name: 'Audio System', value: 'Naim for Bentley Premium Audio' }
        ]
      },
      {
        category: 'Performance & Safety',
        items: [
            { name: 'Engine', value: 'W12 Twin-Turbo' },
            { name: 'Air Suspension', value: 'Adaptive Air Suspension' },
            { name: 'Driver Assistance', value: 'Advanced ADAS Package' }
        ]
      }
    ]
  },
  {
    id: 10,
    name: 'Sporty Convertible ',
    brand: 'Porsche',
    type: 'Convertible',
    price: 380,
    seats: 2,
    location: 'Miami',
    modelName: '911 Carrera Cabriolet',
    transmission: 'Automatic',
    mileage: '5,500 km',
    bags: 2,
    doors: 2,
    imageUrl: '/images/Cars/Bentley.jpg', 
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Sport',
    makeYear: '2024', 
    fuelType: 'Petrol',
    capacityGroup: '+2',
    description:
      'Feel the Miami breeze in this iconic Porsche 911 Cabriolet. Exhilarating performance and timeless design.',
    extras: [
      { name: 'Weekend Special Insurance', price: 50.0 },
      { name: 'Valet Parking Pass', price: 30.0 }
    ],
    featuresListToUse : [
      {
        category: 'Performance',
        items: [
          { name: 'Engine', value: 'Flat-Six Turbo' },
          { name: 'Top Speed', value: '180 mph' },
          { name: 'Acceleration (0-60)', value: '3.8s' }
        ]
      },
      {
        category: 'Interior Features',
        items: [
          { name: 'Seats', value: 'Sport Seats Plus' },
          { name: 'Infotainment', value: 'Porsche Communication Management (PCM)' },
          { name: 'Convertible Top', value: 'Fully Automatic Fabric Roof' }
        ]
      }
    ]
  },
  {
    id: 11,
    name: 'Reliable Sedan ',
    brand: 'Toyota',
    type: 'Sedan',
    price: 120,
    seats: 5,
    location: 'Oujda',
    modelName: 'Camry XLE',
    transmission: 'Automatic',
    mileage: '22,000 km',
    bags: 3,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg', 
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Sedan',
    makeYear: '2022',
    fuelType: 'Hybrid',
    capacityGroup: '+4',
    description:
      'A comfortable and fuel-efficient Toyota Camry, perfect for city driving and longer journeys in Oujda.',
    extras: [
      { name: 'Child Safety Seat', price: 10.0 },
      { name: 'Mobile Wi-Fi Hotspot', price: 8.00 }
      // Removed duplicate 'Mobile Wi-Fi Hotspot' entries
    ],
    featuresListToUse : [
      {
        category: 'Interior & Comfort',
        items: [
          { name: 'Seating Material', value: 'Fabric with Leather Trim' },
          { name: 'Infotainment', value: '7-inch Touchscreen Display' },
          { name: 'Climate Control', value: 'Dual-zone Automatic Climate Control' }
          // Removed duplicate 'Climate Control' entries
        ]
      },
      {
        category: 'Safety',
        items: [
          { name: 'Airbags', value: 'Advanced Airbag System' },
          { name: 'Safety Sense', value: 'Toyota Safety Sense 2.5+' }
          // Removed duplicate 'Safety Sense' entries
        ]
      }
    ]
  },
  {
    id: 12,
    name: 'Tesla Model S ',
    brand: 'Tesla',
    type: 'Electric Sedan',
    price: 300,
    seats: 5,
    location: 'New York',
    modelName: 'Model S Plaid',
    transmission: 'Automatic',
    mileage: '8,000 km',
    bags: 3,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg',
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Electric',
    makeYear: '2023',
    fuelType: 'Electric',
    capacityGroup: '+4',
    description:
      'Experience the future of driving with the Tesla Model S in New York. Blazing acceleration and long range.',
    extras: [
      { name: 'Full Self-Driving (Supervised)', price: 100.0 },
      { name: 'Premium Connectivity', price: 10.0 }
    ],
    featuresListToUse : [
      {
        category: 'Technology',
        items: [
          { name: 'Autopilot', value: 'Enhanced Autopilot' },
          { name: 'Display', value: '17-inch Cinematic Display' },
          { name: 'Range', value: '390+ miles (EPA est.)' }
        ]
      }
    ]
  },
  {
    id: 13,
    name: 'Luxury Bentley SUV ',
    brand: 'Bentley',
    type: 'Luxury SUV',
    price: 450,
    seats: 5,
    location: 'New York',
    modelName: 'Bentayga',
    transmission: 'Automatic',
    mileage: '12,000 km',
    bags: 4,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg',
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/Toyota.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'SUV',
    makeYear: '2023',
    fuelType: 'Petrol',
    capacityGroup: '+8', 
    description:
      'Experience ultimate luxury and performance with the Bentley Bentayga in New York. Top-tier comfort and cutting-edge technology.',
    extras: [
      { name: 'Full Tank of Fuel (Prepaid)', price: 120.0 },
      { name: 'Additional Driver', price: 25.0 },
      { name: 'GPS Navigation Unit', price: 15.00 }
    ],
    featuresListToUse : [
      {
        category: 'Interior & Comfort',
        items: [
          { name: 'Seating Material', value: 'Premium Leather' },
          { name: 'Front Seats', value: 'Heated & Ventilated Massage Seats' },
          { name: 'Climate Control', value: 'Four-zone automatic climate control' },
          { name: 'Sunroof', value: 'Panoramic Glass Roof' },
          { name: 'Audio System', value: 'Naim for Bentley Premium Audio' }
        ]
      },
      {
        category: 'Performance & Safety',
        items: [
            { name: 'Engine', value: 'W12 Twin-Turbo' },
            { name: 'Air Suspension', value: 'Adaptive Air Suspension' },
            { name: 'Driver Assistance', value: 'Advanced ADAS Package' }
        ]
      }
    ]
  },
  {
    id: 14,
    name: 'Sporty Convertible ',
    brand: 'Porsche',
    type: 'Convertible',
    price: 380,
    seats: 2,
    location: 'Miami',
    modelName: '911 Carrera Cabriolet',
    transmission: 'Automatic',
    mileage: '5,500 km',
    bags: 2,
    doors: 2,
    imageUrl: '/images/Cars/Bentley.jpg', 
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Sport',
    makeYear: '2024', 
    fuelType: 'Petrol',
    capacityGroup: '+2',
    description:
      'Feel the Miami breeze in this iconic Porsche 911 Cabriolet. Exhilarating performance and timeless design.',
    extras: [
      { name: 'Weekend Special Insurance', price: 50.0 },
      { name: 'Valet Parking Pass', price: 30.0 }
    ],
    featuresListToUse : [
      {
        category: 'Performance',
        items: [
          { name: 'Engine', value: 'Flat-Six Turbo' },
          { name: 'Top Speed', value: '180 mph' },
          { name: 'Acceleration (0-60)', value: '3.8s' }
        ]
      },
      {
        category: 'Interior Features',
        items: [
          { name: 'Seats', value: 'Sport Seats Plus' },
          { name: 'Infotainment', value: 'Porsche Communication Management (PCM)' },
          { name: 'Convertible Top', value: 'Fully Automatic Fabric Roof' }
        ]
      }
    ]
  },
  {
    id: 15,
    name: 'Reliable Sedan ',
    brand: 'Toyota',
    type: 'Sedan',
    price: 120,
    seats: 5,
    location: 'Oujda',
    modelName: 'Camry XLE',
    transmission: 'Automatic',
    mileage: '22,000 km',
    bags: 3,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg', 
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Sedan',
    makeYear: '2022',
    fuelType: 'Hybrid',
    capacityGroup: '+4',
    description:
      'A comfortable and fuel-efficient Toyota Camry, perfect for city driving and longer journeys in Oujda.',
    extras: [
      { name: 'Child Safety Seat', price: 10.0 },
      { name: 'Mobile Wi-Fi Hotspot', price: 8.00 }
      // Removed duplicate 'Mobile Wi-Fi Hotspot' entries
    ],
    featuresListToUse : [
      {
        category: 'Interior & Comfort',
        items: [
          { name: 'Seating Material', value: 'Fabric with Leather Trim' },
          { name: 'Infotainment', value: '7-inch Touchscreen Display' },
          { name: 'Climate Control', value: 'Dual-zone Automatic Climate Control' }
          // Removed duplicate 'Climate Control' entries
        ]
      },
      {
        category: 'Safety',
        items: [
          { name: 'Airbags', value: 'Advanced Airbag System' },
          { name: 'Safety Sense', value: 'Toyota Safety Sense 2.5+' }
          // Removed duplicate 'Safety Sense' entries
        ]
      }
    ]
  },
  {
    id: 16,
    name: 'Tesla Model S ',
    brand: 'Tesla',
    type: 'Electric Sedan',
    price: 300,
    seats: 5,
    location: 'New York',
    modelName: 'Model S Plaid',
    transmission: 'Automatic',
    mileage: '8,000 km',
    bags: 3,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg',
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Electric',
    makeYear: '2023',
    fuelType: 'Electric',
    capacityGroup: '+4',
    description:
      'Experience the future of driving with the Tesla Model S in New York. Blazing acceleration and long range.',
    extras: [
      { name: 'Full Self-Driving (Supervised)', price: 100.0 },
      { name: 'Premium Connectivity', price: 10.0 }
    ],
    featuresListToUse : [
      {
        category: 'Technology',
        items: [
          { name: 'Autopilot', value: 'Enhanced Autopilot' },
          { name: 'Display', value: '17-inch Cinematic Display' },
          { name: 'Range', value: '390+ miles (EPA est.)' }
        ]
      }
    ]
  },
  {
    id: 17,
    name: 'Luxury Bentley SUV ',
    brand: 'Bentley',
    type: 'Luxury SUV',
    price: 450,
    seats: 5,
    location: 'New York',
    modelName: 'Bentayga',
    transmission: 'Automatic',
    mileage: '12,000 km',
    bags: 4,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg',
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/Toyota.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'SUV',
    makeYear: '2023',
    fuelType: 'Petrol',
    capacityGroup: '+8', 
    description:
      'Experience ultimate luxury and performance with the Bentley Bentayga in New York. Top-tier comfort and cutting-edge technology.',
    extras: [
      { name: 'Full Tank of Fuel (Prepaid)', price: 120.0 },
      { name: 'Additional Driver', price: 25.0 },
      { name: 'GPS Navigation Unit', price: 15.00 }
    ],
    featuresListToUse : [
      {
        category: 'Interior & Comfort',
        items: [
          { name: 'Seating Material', value: 'Premium Leather' },
          { name: 'Front Seats', value: 'Heated & Ventilated Massage Seats' },
          { name: 'Climate Control', value: 'Four-zone automatic climate control' },
          { name: 'Sunroof', value: 'Panoramic Glass Roof' },
          { name: 'Audio System', value: 'Naim for Bentley Premium Audio' }
        ]
      },
      {
        category: 'Performance & Safety',
        items: [
            { name: 'Engine', value: 'W12 Twin-Turbo' },
            { name: 'Air Suspension', value: 'Adaptive Air Suspension' },
            { name: 'Driver Assistance', value: 'Advanced ADAS Package' }
        ]
      }
    ]
  },
  {
    id: 18,
    name: 'Sporty Convertible ',
    brand: 'Porsche',
    type: 'Convertible',
    price: 380,
    seats: 2,
    location: 'Miami',
    modelName: '911 Carrera Cabriolet',
    transmission: 'Automatic',
    mileage: '5,500 km',
    bags: 2,
    doors: 2,
    imageUrl: '/images/Cars/Bentley.jpg', 
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Sport',
    makeYear: '2024', 
    fuelType: 'Petrol',
    capacityGroup: '+2',
    description:
      'Feel the Miami breeze in this iconic Porsche 911 Cabriolet. Exhilarating performance and timeless design.',
    extras: [
      { name: 'Weekend Special Insurance', price: 50.0 },
      { name: 'Valet Parking Pass', price: 30.0 }
    ],
    featuresListToUse : [
      {
        category: 'Performance',
        items: [
          { name: 'Engine', value: 'Flat-Six Turbo' },
          { name: 'Top Speed', value: '180 mph' },
          { name: 'Acceleration (0-60)', value: '3.8s' }
        ]
      },
      {
        category: 'Interior Features',
        items: [
          { name: 'Seats', value: 'Sport Seats Plus' },
          { name: 'Infotainment', value: 'Porsche Communication Management (PCM)' },
          { name: 'Convertible Top', value: 'Fully Automatic Fabric Roof' }
        ]
      }
    ]
  },
  {
    id: 19,
    name: 'Reliable Sedan ',
    brand: 'Toyota',
    type: 'Sedan',
    price: 120,
    seats: 5,
    location: 'Oujda',
    modelName: 'Camry XLE',
    transmission: 'Automatic',
    mileage: '22,000 km',
    bags: 3,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg', 
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Sedan',
    makeYear: '2022',
    fuelType: 'Hybrid',
    capacityGroup: '+4',
    description:
      'A comfortable and fuel-efficient Toyota Camry, perfect for city driving and longer journeys in Oujda.',
    extras: [
      { name: 'Child Safety Seat', price: 10.0 },
      { name: 'Mobile Wi-Fi Hotspot', price: 8.00 }
      // Removed duplicate 'Mobile Wi-Fi Hotspot' entries
    ],
    featuresListToUse : [
      {
        category: 'Interior & Comfort',
        items: [
          { name: 'Seating Material', value: 'Fabric with Leather Trim' },
          { name: 'Infotainment', value: '7-inch Touchscreen Display' },
          { name: 'Climate Control', value: 'Dual-zone Automatic Climate Control' }
          // Removed duplicate 'Climate Control' entries
        ]
      },
      {
        category: 'Safety',
        items: [
          { name: 'Airbags', value: 'Advanced Airbag System' },
          { name: 'Safety Sense', value: 'Toyota Safety Sense 2.5+' }
          // Removed duplicate 'Safety Sense' entries
        ]
      }
    ]
  },
  {
    id: 20,
    name: 'Tesla Model S ',
    brand: 'Tesla',
    type: 'Electric Sedan',
    price: 300,
    seats: 5,
    location: 'New York',
    modelName: 'Model S Plaid',
    transmission: 'Automatic',
    mileage: '8,000 km',
    bags: 3,
    doors: 4,
    imageUrl: '/images/Cars/Bentley.jpg',
    imageNoBgc: ['/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png','/images/Cars/BentlyNobgc.png'],
    category: 'Electric',
    makeYear: '2023',
    fuelType: 'Electric',
    capacityGroup: '+4',
    description:
      'Experience the future of driving with the Tesla Model S in New York. Blazing acceleration and long range.',
    extras: [
      { name: 'Full Self-Driving (Supervised)', price: 100.0 },
      { name: 'Premium Connectivity', price: 10.0 }
    ],
    featuresListToUse : [
      {
        category: 'Technology',
        items: [
          { name: 'Autopilot', value: 'Enhanced Autopilot' },
          { name: 'Display', value: '17-inch Cinematic Display' },
          { name: 'Range', value: '390+ miles (EPA est.)' }
        ]
      }
    ]
  },
];
 
export default allCarsData;