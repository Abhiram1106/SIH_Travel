const Trip = require('../models/Trip');

// Generate recommendations
const generateRecommendations = async (req, res) => {
  try {
    const { destination } = req.body;
    
    const recommendations = [
      {
        _id: `hotel_${destination}_1`,
        type: 'hotel',
        name: `${destination} Grand Hotel`,
        description: `Luxury hotel in ${destination}`,
        rating: 4.5,
        priceRange: 'luxury',
        aiScore: 0.95,
        reasons: [`Perfect location in ${destination}`, 'Highly rated'],
        location: { address: `${destination} Center`, lat: 40.7128, lng: -74.0060 },
        images: [`https://example.com/hotel.jpg`]
      },
      {
        _id: `restaurant_${destination}_1`,
        type: 'restaurant',
        name: `${destination} Restaurant`,
        description: `Best restaurant in ${destination}`,
        rating: 4.6,
        priceRange: 'mid-range',
        aiScore: 0.92,
        reasons: [`Authentic ${destination} cuisine`, 'Local favorite'],
        location: { address: `${destination} Food St`, lat: 40.7614, lng: -73.9776 },
        images: [`https://example.com/restaurant.jpg`]
      },
      {
        _id: `activity_${destination}_1`,
        type: 'activity',
        name: `${destination} Tour`,
        description: `Amazing tour of ${destination}`,
        rating: 4.4,
        priceRange: 'budget',
        aiScore: 0.88,
        reasons: ['Great experience', 'Budget friendly'],
        location: { address: `${destination} Center`, lat: 40.7589, lng: -73.9851 },
        images: [`https://example.com/tour.jpg`]
      },
      {
        _id: `activity_${destination}_2`,
        type: 'activity',
        name: `Adventure Sports ${destination}`,
        description: `Thrilling outdoor activities including zip-lining, rock climbing, and water sports in ${destination}`,
        rating: 4.6,
        priceRange: 'mid-range',
        aiScore: 0.97,
        reasons: ['Perfect for adventurers', 'Adrenaline rush', 'Unique experience', 'Group activity'],
        location: { address: `${destination} Adventure Zone`, lat: 40.7282, lng: -74.0776 },
        images: [`https://example.com/adventure.jpg`]
      },
      {
        _id: `restaurant_${destination}_2`,
        type: 'restaurant',
        name: `Street Food Paradise ${destination}`,
        description: `Popular local food market with diverse vendors and authentic street food in ${destination}`,
        rating: 4.4,
        priceRange: 'budget',
        aiScore: 0.88,
        reasons: ['Local culture', 'Authentic experience', 'Budget-friendly', 'Great variety'],
        location: { address: `${destination} Market Area`, lat: 40.7505, lng: -73.9934 },
        images: [`https://example.com/streetfood.jpg`]
      },
      {
        _id: `hotel_${destination}_2`,
        type: 'hotel',
        name: `${destination} Boutique Stay`,
        description: `Charming boutique hotel with authentic local character and personalized service in ${destination}`,
        rating: 4.2,
        priceRange: 'mid-range',
        aiScore: 0.87,
        reasons: [`Unique ${destination} character`, 'Local experience', 'Great value', 'Perfect for groups'],
        location: { address: `${destination} Historic Quarter`, lat: 40.7589, lng: -73.9851 },
        images: [`https://example.com/boutique.jpg`]
      },
      {
        _id: `activity_${destination}_3`,
        type: 'activity',
        name: `${destination} Cultural Heritage Tour`,
        description: `Expert-guided tour through ${destination}'s most significant historical and cultural landmarks`,
        rating: 4.7,
        priceRange: 'budget',
        aiScore: 0.96,
        reasons: [`Learn ${destination} history`, 'Expert guides', 'Cultural insights', 'Great value'],
        location: { address: `${destination} Heritage District`, lat: 40.7589, lng: -73.9851 },
        images: [`https://example.com/heritage.jpg`]
      },
      {
        _id: `hotel_${destination}_3`,
        type: 'hotel',
        name: `Eco-Friendly ${destination} Lodge`,
        description: `Sustainable accommodation with eco-friendly practices and nature integration in ${destination}`,
        rating: 4.1,
        priceRange: 'budget',
        aiScore: 0.85,
        reasons: ['Eco-conscious', 'Unique experience', 'Budget-friendly', 'Great for nature lovers'],
        location: { address: `${destination} Green District`, lat: 40.7282, lng: -74.0776 },
        images: [`https://example.com/eco.jpg`]
      }
    ];

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
};

// Generate itinerary - NO DATABASE SAVE, just return data
const generateItinerary = async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, title } = req.body;
    
    console.log(`🗓️ Generating itinerary for ${destination}...`);

    if (!destination || !startDate || !endDate || !budget || !title) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const budgetNum = parseFloat(budget);
    const dailyBudget = budgetNum / days;

    // Generate simple itinerary
    const itinerary = [];
    let totalCost = 0;

    for (let day = 1; day <= days; day++) {
      const activities = [
        {
          day: day,
          time: '09:00',
          activity: `Explore ${destination} Morning`,
          location: `${destination} City Center`,
          description: `Start day ${day} in ${destination}`,
          cost: Math.floor(dailyBudget * 0.25)
        },
        {
          day: day,
          time: '12:30',
          activity: `${destination} Lunch`,
          location: `${destination} Restaurant`,
          description: `Authentic ${destination} cuisine`,
          cost: Math.floor(dailyBudget * 0.15)
        },
        {
          day: day,
          time: '14:30',
          activity: `${destination} Afternoon Tour`,
          location: `${destination} Attractions`,
          description: `Afternoon in ${destination}`,
          cost: Math.floor(dailyBudget * 0.30)
        },
        {
          day: day,
          time: '18:30',
          activity: `${destination} Evening`,
          location: `${destination} Entertainment`,
          description: `Evening in ${destination}`,
          cost: Math.floor(dailyBudget * 0.20)
        }
      ];

      itinerary.push(...activities);
      totalCost += activities.reduce((sum, item) => sum + item.cost, 0);
    }

    // FAKE TRIP ID for frontend (no database save)
    const fakeResponse = {
      tripId: 'fake_' + Date.now(),
      itinerary: itinerary,
      totalEstimatedCost: totalCost,
      originalBudget: budgetNum,
      budgetUtilization: Math.round((totalCost / budgetNum) * 100) + '%',
      aiConfidence: 0.92,
      durationDays: days,
      dailyAverageCost: Math.floor(totalCost / days)
    };

    console.log('✅ Returning fake response for demo');

    res.json({
      success: true,
      data: fakeResponse,
      message: `Demo trip to ${destination} ready!`
    });

  } catch (error) {
    console.error('Generate itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary',
      error: error.message
    });
  }
};

const getTravelInsights = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        bestTimeToVisit: 'Spring and Fall',
        budgetTips: ['Book early', 'Use local transport'],
        localTips: ['Try local food', 'Learn basic phrases']
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get insights' });
  }
};

const getPackingSuggestions = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        essentials: ['Passport', 'Phone charger', 'Comfortable shoes'],
        clothing: ['Weather-appropriate clothes', 'Extra outfit'],
        electronics: ['Camera', 'Power adapter']
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get packing suggestions' });
  }
};

module.exports = {
  generateRecommendations,
  generateItinerary,
  getTravelInsights,
  getPackingSuggestions
};
  