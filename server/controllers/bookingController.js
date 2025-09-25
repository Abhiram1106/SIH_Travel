const axios = require('axios');

// Enhanced flight search with realistic data and filtering
const searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, passengers, class: travelClass = 'economy' } = req.body;

    console.log(`✈️ Searching flights from ${origin} to ${destination}...`);

    // Generate realistic flight data
    const airlines = [
      { code: 'AI', name: 'Air India', rating: 4.2 },
      { code: 'EK', name: 'Emirates', rating: 4.8 },
      { code: '6E', name: 'IndiGo', rating: 4.1 },
      { code: 'SG', name: 'SpiceJet', rating: 3.9 },
      { code: 'UK', name: 'Vistara', rating: 4.5 },
      { code: 'BA', name: 'British Airways', rating: 4.3 },
      { code: 'LH', name: 'Lufthansa', rating: 4.4 }
    ];

    const generateFlightTime = (isReturn = false) => {
      const hours = Math.floor(Math.random() * 12) + 6; // 6-18 hours
      const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const generatePrice = (basePrice, classMultiplier = 1) => {
      const variation = Math.random() * 0.4 + 0.8; // ±20% variation
      return Math.floor(basePrice * variation * classMultiplier);
    };

    const classMultipliers = {
      economy: 1,
      premium: 1.5,
      business: 3,
      first: 5
    };

    const basePrice = 300 + Math.floor(Math.random() * 500); // $300-800 base
    const mockFlights = [];

    // Generate 8-12 flight options
    const flightCount = Math.floor(Math.random() * 5) + 8;

    for (let i = 0; i < flightCount; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const departureTime = generateFlightTime();
      const flightDuration = `${Math.floor(Math.random() * 8) + 2}h ${Math.floor(Math.random() * 60)}m`;
      const stops = Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 1 : 0;

      const flight = {
        id: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
        airline: airline.name,
        airlineCode: airline.code,
        airlineRating: airline.rating,
        flightNumber: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departureDate: departureDate,
        departureTime: departureTime,
        arrivalTime: generateFlightTime(),
        duration: flightDuration,
        stops: stops,
        stopDetails: stops > 0 ? [`${Math.floor(Math.random() * 3)}h ${Math.floor(Math.random() * 60)}m layover`] : [],
        price: generatePrice(basePrice, classMultipliers[travelClass]),
        originalPrice: Math.floor(generatePrice(basePrice, classMultipliers[travelClass]) * 1.2),
        currency: 'USD',
        availableSeats: Math.floor(Math.random() * 20) + 5,
        class: travelClass,
        aircraft: ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A330'][Math.floor(Math.random() * 4)],
        amenities: {
          meals: travelClass !== 'economy',
          wifi: Math.random() > 0.3,
          entertainment: Math.random() > 0.2,
          powerOutlets: travelClass !== 'economy' || Math.random() > 0.5,
          extraLegroom: travelClass !== 'economy'
        },
        baggage: {
          carry: travelClass === 'economy' ? '7kg' : '10kg',
          checked: travelClass === 'economy' ? '20kg' : '30kg'
        },
        cancellation: {
          allowed: Math.random() > 0.3,
          fee: travelClass === 'economy' ? 50 : 25
        },
        bookingClass: travelClass.toUpperCase()
      };

      // Add return flight if requested
      if (returnDate) {
        flight.returnFlight = {
          departureDate: returnDate,
          departureTime: generateFlightTime(),
          arrivalTime: generateFlightTime(),
          flightNumber: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
          duration: flightDuration
        };
        flight.price = Math.floor(flight.price * 1.8); // Round trip pricing
        flight.tripType = 'round-trip';
      } else {
        flight.tripType = 'one-way';
      }

      mockFlights.push(flight);
    }

    // Sort by price
    const sortedFlights = mockFlights.sort((a, b) => a.price - b.price);

    // Add flight recommendations
    const recommendations = {
      cheapest: sortedFlights[0],
      fastest: sortedFlights.reduce((prev, curr) => 
        parseInt(prev.duration) < parseInt(curr.duration) ? prev : curr
      ),
      bestValue: sortedFlights.find(f => f.airlineRating >= 4.3 && f.stops === 0) || sortedFlights[2],
      recommended: sortedFlights.filter(f => f.airlineRating >= 4.0 && f.stops <= 1).slice(0, 3)
    };

    console.log(`✅ Found ${sortedFlights.length} flights from ${origin} to ${destination}`);

    res.json({
      success: true,
      data: {
        flights: sortedFlights,
        recommendations: recommendations,
        searchCriteria: {
          origin,
          destination,
          departureDate,
          returnDate,
          passengers,
          class: travelClass
        },
        meta: {
          totalResults: sortedFlights.length,
          priceRange: {
            min: sortedFlights[0].price,
            max: sortedFlights[sortedFlights.length - 1].price
          },
          searchedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search flights',
      error: error.message
    });
  }
};

// Enhanced hotel search with detailed information
const searchHotels = async (req, res) => {
  try {
    const { destination, checkIn, checkOut, guests, rooms = 1, budget } = req.body;

    console.log(`🏨 Searching hotels in ${destination}...`);

    const hotelChains = [
      { name: 'Marriott', rating: 4.5, priceMultiplier: 1.8 },
      { name: 'Hilton', rating: 4.6, priceMultiplier: 1.9 },
      { name: 'Hyatt', rating: 4.4, priceMultiplier: 1.7 },
      { name: 'IHG', rating: 4.2, priceMultiplier: 1.5 },
      { name: 'Radisson', rating: 4.1, priceMultiplier: 1.4 },
      { name: 'Local Boutique', rating: 4.3, priceMultiplier: 1.2 },
      { name: 'Budget Inn', rating: 3.8, priceMultiplier: 0.8 }
    ];

    const amenitiesList = [
      'Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa', 'Restaurant', 
      'Bar/Lounge', 'Room Service', 'Concierge', 'Business Center', 'Parking',
      'Airport Shuttle', 'Pet Friendly', 'Air Conditioning', 'Laundry Service'
    ];

    const neighborhoods = [
      'City Center', 'Historic District', 'Business District', 'Waterfront',
      'Tourist Area', 'Shopping District', 'Cultural Quarter', 'Airport Area'
    ];

    const mockHotels = [];
    const hotelCount = Math.floor(Math.random() * 8) + 12; // 12-20 hotels

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const basePrice = budget ? budget / nights / rooms : 80 + Math.floor(Math.random() * 120);

    for (let i = 0; i < hotelCount; i++) {
      const chain = hotelChains[Math.floor(Math.random() * hotelChains.length)];
      const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
      const hotelAmenities = amenitiesList
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 8) + 4);

      const nightlyRate = Math.floor(basePrice * chain.priceMultiplier * (0.8 + Math.random() * 0.4));
      const totalPrice = nightlyRate * nights * rooms;
      const taxesAndFees = Math.floor(totalPrice * 0.18); // 18% taxes and fees

      const hotel = {
        id: `hotel_${i + 1}`,
        name: `${chain.name} ${destination} ${neighborhood}`,
        chain: chain.name,
        address: `${Math.floor(Math.random() * 999) + 1} ${neighborhood}, ${destination}`,
        neighborhood: neighborhood,
        rating: Math.round((chain.rating + (Math.random() - 0.5) * 0.6) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 2000) + 100,
        stars: Math.floor(chain.rating),
        price: nightlyRate,
        totalPrice: totalPrice,
        taxesAndFees: taxesAndFees,
        finalPrice: totalPrice + taxesAndFees,
        currency: 'USD',
        priceType: 'per night',
        originalPrice: Math.floor(nightlyRate * 1.2),
        discount: Math.floor(nightlyRate * 0.2),
        images: [
          `https://images.unsplash.com/1600x900/?hotel,luxury,${destination.toLowerCase()}`,
          `https://images.unsplash.com/1600x900/?hotel,room,${destination.toLowerCase()}`,
          `https://images.unsplash.com/1600x900/?hotel,lobby,${destination.toLowerCase()}`
        ],
        amenities: hotelAmenities,
        roomType: guests <= 2 ? 'Standard Room' : guests <= 4 ? 'Suite' : 'Family Room',
        bedType: guests === 1 ? 'King Bed' : 'Two Queen Beds',
        roomSize: `${Math.floor(Math.random() * 20) + 25} sqm`,
        availableRooms: Math.floor(Math.random() * 10) + 3,
        distanceFromCenter: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
        walkingScore: Math.floor(Math.random() * 40) + 60,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        cancellation: {
          free: Math.random() > 0.3,
          deadline: Math.random() > 0.5 ? '24 hours before' : '48 hours before'
        },
        paymentOptions: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer'],
        sustainability: {
          ecoFriendly: Math.random() > 0.6,
          certifications: Math.random() > 0.7 ? ['Green Key', 'LEED Certified'] : []
        },
        highlights: [
          `${Math.floor(Math.random() * 5) + 3} minutes walk to attractions`,
          'Highly rated by business travelers',
          'Great location for exploring',
          'Excellent customer service'
        ].slice(0, Math.floor(Math.random() * 3) + 2)
      };

      mockHotels.push(hotel);
    }

    // Sort by value (price vs rating)
    const sortedHotels = mockHotels.sort((a, b) => {
      const aValue = a.rating / a.price;
      const bValue = b.rating / b.price;
      return bValue - aValue;
    });

    // Create recommendations
    const recommendations = {
      bestValue: sortedHotels[0],
      luxury: sortedHotels.reduce((prev, curr) => prev.rating > curr.rating ? prev : curr),
      budget: sortedHotels.reduce((prev, curr) => prev.price < curr.price ? prev : curr),
      popular: sortedHotels.filter(h => h.rating >= 4.2 && h.reviewCount >= 500).slice(0, 3)
    };

    console.log(`✅ Found ${sortedHotels.length} hotels in ${destination}`);

    res.json({
      success: true,
      data: {
        hotels: sortedHotels,
        recommendations: recommendations,
        searchCriteria: {
          destination,
          checkIn,
          checkOut,
          guests,
          rooms,
          nights
        },
        meta: {
          totalResults: sortedHotels.length,
          priceRange: {
            min: Math.min(...sortedHotels.map(h => h.price)),
            max: Math.max(...sortedHotels.map(h => h.price))
          },
          searchedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Hotel search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search hotels',
      error: error.message
    });
  }
};

// Enhanced booking functionality
const bookFlight = async (req, res) => {
  try {
    const { flightId, passengerInfo, contactInfo, paymentInfo, specialRequests } = req.body;

    // Validate required information
    if (!flightId || !passengerInfo || !contactInfo || !paymentInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Generate realistic booking confirmation
    const confirmationNumber = 'FL' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const bookingDate = new Date();
    const totalAmount = passengerInfo.length * (299 + Math.floor(Math.random() * 400));

    const bookingConfirmation = {
      confirmationNumber: confirmationNumber,
      bookingReference: `PNR${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      flightId: flightId,
      status: 'confirmed',
      bookingDate: bookingDate,
      passengers: passengerInfo.map((passenger, index) => ({
        ...passenger,
        seatNumber: `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
        eTicketNumber: `${Math.random().toString().substr(2, 13)}`
      })),
      contact: contactInfo,
      totalAmount: totalAmount,
      paymentStatus: 'completed',
      paymentMethod: paymentInfo.method,
      specialRequests: specialRequests || [],
      checkInStatus: 'pending',
      eTicketSent: true,
      cancellationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      importantInfo: [
        'Check-in opens 24 hours before departure',
        'Arrive at airport 2 hours before domestic flights, 3 hours before international',
        'Carry valid photo ID and boarding pass',
        'Check airline baggage policies before packing'
      ]
    };

    console.log(`✅ Flight booked successfully: ${confirmationNumber}`);

    res.json({
      success: true,
      message: 'Flight booked successfully! Confirmation email sent.',
      data: bookingConfirmation
    });
  } catch (error) {
    console.error('Flight booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book flight. Please try again.',
      error: error.message
    });
  }
};

const bookHotel = async (req, res) => {
  try {
    const { hotelId, guestInfo, contactInfo, paymentInfo, roomPreferences } = req.body;

    // Validate required information
    if (!hotelId || !guestInfo || !contactInfo || !paymentInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    const confirmationNumber = 'HT' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const checkInDate = new Date(guestInfo.checkIn);
    const checkOutDate = new Date(guestInfo.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const roomRate = 120 + Math.floor(Math.random() * 200);
    const totalAmount = roomRate * nights * guestInfo.rooms;
    const taxesAndFees = Math.floor(totalAmount * 0.18);

    const bookingConfirmation = {
      confirmationNumber: confirmationNumber,
      hotelBookingId: `HB${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      hotelId: hotelId,
      status: 'confirmed',
      bookingDate: new Date(),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: nights,
      rooms: guestInfo.rooms,
      guests: guestInfo.guests,
      contact: contactInfo,
      roomDetails: {
        type: roomPreferences?.roomType || 'Standard Room',
        bedType: roomPreferences?.bedType || 'Queen Bed',
        floorPreference: roomPreferences?.floor || 'Any',
        smokingPreference: roomPreferences?.smoking || 'Non-smoking',
        specialRequests: roomPreferences?.specialRequests || []
      },
      pricing: {
        roomRate: roomRate,
        nights: nights,
        subtotal: totalAmount,
        taxesAndFees: taxesAndFees,
        totalAmount: totalAmount + taxesAndFees
      },
      paymentStatus: 'completed',
      paymentMethod: paymentInfo.method,
      cancellationPolicy: 'Free cancellation until 24 hours before check-in',
      importantInfo: [
        'Check-in time: 3:00 PM',
        'Check-out time: 11:00 AM',
        'Valid photo ID required at check-in',
        'Parking available (additional charges may apply)',
        'WiFi included in all rooms'
      ]
    };

    console.log(`✅ Hotel booked successfully: ${confirmationNumber}`);

    res.json({
      success: true,
      message: 'Hotel booked successfully! Confirmation email sent.',
      data: bookingConfirmation
    });
  } catch (error) {
    console.error('Hotel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book hotel. Please try again.',
      error: error.message
    });
  }
};

// Get booking history
const getBookingHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Mock booking history
    const mockBookings = [
      {
        id: 'BK001',
        type: 'flight',
        confirmationNumber: 'FL7A8B9C2D',
        destination: 'Paris, France',
        date: '2025-08-15',
        status: 'completed',
        amount: 650
      },
      {
        id: 'BK002',
        type: 'hotel',
        confirmationNumber: 'HT3E4F5G6H',
        destination: 'Tokyo, Japan',
        date: '2025-07-22',
        status: 'confirmed',
        amount: 180
      }
    ];

    res.json({
      success: true,
      data: mockBookings
    });
  } catch (error) {
    console.error('Booking history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking history',
      error: error.message
    });
  }
};

module.exports = {
  searchFlights,
  searchHotels,
  bookFlight,
  bookHotel,
  getBookingHistory
};