export const venues = [
    {
      id: "football-arena",
      name: "Green Arena Football Turf",
      category: "Turfs",
      sport: "Football",
      price_per_hour: 1000,
      location: "Koramangala, Pune",
      rating: 5.0,
      capacity: 22,
      images: ["/football.jpg"],
  
      // ✅ ADD THESE
      amenities: [
        "Parking",
        "Showers",
        "Lockers",
        "Cafe",
        "Free WiFi",
        "Equipment",
        "Air Con",
        "First Aid"
      ],
  
      slots: [
        "6:00 PM to 7:00 PM",
        "7:00 PM to 8:00 PM",
        "8:00 PM to 9:00 PM",
        "9:00 PM to 10:00 PM",
        "11:00 PM to 12:00 PM"
      ],
  
      add_ons: [
        { name: "Football Kit Rental", price: 800 },
        { name: "Shoes Rental", price: 300 },
        { name: "Extra Lighting (Night)", price: 900 },
        { name: "Water & refreshments", price: 200 }
      ]
    },
  
    {
      id: "badminton-court",
      name: "Badminton Court",
      category: "Turfs",
      sport: "Badminton",
      price_per_hour: 800,
      location: "Indiranagar, Pune",
      rating: 4.8,
      capacity: 4,
      images: ["/badminton.jpg"],
  
      amenities: [
        "Parking",
        "Changing Room",
        "Equipment",
        "Drinking Water"
      ],
  
      slots: [
        "5:00 PM to 6:00 PM",
        "6:00 PM to 7:00 PM",
        "7:00 PM to 8:00 PM"
      ],
  
      add_ons: [
        { name: "Racket Rental", price: 200 },
        { name: "Shuttle Pack", price: 150 }
      ]
    },
  
    {
      id: "tennis-club",
      name: "Tennis Club",
      category: "Turfs",
      sport: "Tennis",
      price_per_hour: 900,
      location: "Baner, Pune",
      rating: 4.9,
      capacity: 2,
      images: ["/tennis.jpg"],
  
      amenities: [
        "Parking",
        "Restrooms",
        "Coaching Available"
      ],
  
      slots: [
        "4:00 PM to 5:00 PM",
        "5:00 PM to 6:00 PM",
        "6:00 PM to 7:00 PM"
      ],
  
      add_ons: [
        { name: "Ball Set", price: 250 }
      ]
    },
  
    {
      id: "elite-coach",
      name: "Elite Football Coaching",
      category: "Coaching",
      sport: "Football",
      price_per_hour: 1200,
      location: "Kothrud, Pune",
      rating: 4.7,
      capacity: 15,
      images: ["/coach.jpg"],
  
      amenities: ["Certified Coach", "Training Equipment"],
  
      slots: [
        "6:00 AM to 7:00 AM",
        "7:00 AM to 8:00 AM"
      ],
  
      add_ons: []
    },
  
    {
      id: "power-gym",
      name: "Power Fitness Gym",
      category: "Gyms",
      sport: "Fitness",
      price_per_hour: 500,
      location: "Hinjewadi, Pune",
      rating: 4.6,
      capacity: 50,
      images: ["/gym.jpg"],
  
      amenities: [
        "Cardio Machines",
        "Weights",
        "Locker Room",
        "Trainer Support"
      ],
  
      slots: [
        "6:00 AM to 7:00 AM",
        "7:00 AM to 8:00 AM",
        "8:00 AM to 9:00 AM"
      ],
  
      add_ons: []
    }
  ];