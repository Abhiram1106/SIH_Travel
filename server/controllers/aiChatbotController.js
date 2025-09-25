const axios = require('axios');

// AI Chatbot responses with travel expertise
const getChatResponse = async (req, res) => {
  try {
    const { message, conversationId, userId } = req.body;
    
    console.log(`🤖 Processing chat message: "${message}"`);

    // Analyze message for travel-related intents
    const intent = detectIntent(message.toLowerCase());
    const response = await generateResponse(message, intent, userId);

    const chatResponse = {
      id: Math.random().toString(36).substr(2, 9),
      message: response.text,
      type: response.type,
      suggestions: response.suggestions || [],
      data: response.data || null,
      timestamp: new Date().toISOString(),
      conversationId: conversationId || 'conv_' + Math.random().toString(36).substr(2, 9)
    };

    console.log(`✅ Generated AI response for intent: ${intent}`);

    res.json({
      success: true,
      data: chatResponse
    });
  } catch (error) {
    console.error('Chat response error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again.',
      error: error.message
    });
  }
};

// Detect user intent from message
const detectIntent = (message) => {
  const intents = {
    greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    weather: ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'climate'],
    booking: ['book', 'reserve', 'flight', 'hotel', 'ticket', 'room'],
    recommendations: ['recommend', 'suggest', 'best', 'top', 'good', 'places', 'restaurants'],
    budget: ['budget', 'cost', 'price', 'expensive', 'cheap', 'money', 'spend'],
    transport: ['transport', 'taxi', 'bus', 'train', 'metro', 'uber', 'getting around'],
    food: ['food', 'restaurant', 'eat', 'cuisine', 'lunch', 'dinner', 'breakfast'],
    emergency: ['emergency', 'help', 'urgent', 'police', 'hospital', 'lost', 'stolen'],
    currency: ['currency', 'exchange', 'money', 'convert', 'rate', 'dollar', 'euro'],
    language: ['translate', 'language', 'speak', 'phrase', 'word'],
    itinerary: ['itinerary', 'plan', 'schedule', 'day', 'visit', 'trip'],
    packing: ['pack', 'luggage', 'bring', 'clothes', 'items'],
    visa: ['visa', 'passport', 'documents', 'permit', 'entry'],
    culture: ['culture', 'customs', 'tradition', 'etiquette', 'local'],
    goodbye: ['bye', 'goodbye', 'see you', 'thanks', 'thank you']
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return intent;
    }
  }
  return 'general';
};

// Generate appropriate response based on intent
const generateResponse = async (message, intent, userId) => {
  const responses = {
    greeting: {
      text: "Hello! 👋 I'm your AI travel assistant. I can help you with trip planning, bookings, recommendations, weather updates, and much more. What would you like to know about your travels?",
      type: 'greeting',
      suggestions: ['Plan a trip', 'Check weather', 'Find hotels', 'Get recommendations']
    },

    weather: {
      text: "I can help you check the weather for any destination! 🌤️ Just tell me which city you'd like to know about, or I can provide weather forecasts for your planned destinations.",
      type: 'weather',
      suggestions: ['Weather in Paris', 'Tokyo forecast', 'Best time to visit London'],
      data: {
        action: 'weather_query',
        needsLocation: true
      }
    },

    booking: {
      text: "I can help you find and compare flights, hotels, and other accommodations! ✈️🏨 Would you like to search for flights, hotels, or both? Just provide your travel dates and destinations.",
      type: 'booking',
      suggestions: ['Search flights', 'Find hotels', 'Compare prices', 'Booking tips'],
      data: {
        action: 'booking_search',
        needsDetails: true
      }
    },

    recommendations: {
      text: "I'd love to give you personalized recommendations! 🎯 Tell me your destination and interests, and I'll suggest the best places to visit, restaurants to try, and activities to enjoy.",
      type: 'recommendations',
      suggestions: ['Best restaurants in Rome', 'Top attractions in Bali', 'Hidden gems in Paris', 'Adventure activities'],
      data: {
        action: 'get_recommendations',
        needsPreferences: true
      }
    },

    budget: {
      text: "Let me help you plan your travel budget! 💰 I can provide cost estimates, budget-saving tips, and help you find the best deals for your destination. Which aspect of budgeting would you like help with?",
      type: 'budget',
      suggestions: ['Daily budget estimates', 'Money-saving tips', 'Currency converter', 'Compare costs'],
      data: {
        budgetTips: [
          'Book flights in advance for better deals',
          'Travel during shoulder seasons',
          'Mix budget and mid-range accommodations',
          'Try local street food for authentic experiences',
          'Use public transportation when possible'
        ]
      }
    },

    transport: {
      text: "I can guide you on the best transportation options! 🚌🚇 Whether it's getting around the city, airport transfers, or intercity travel, I'll help you choose the most convenient and cost-effective options.",
      type: 'transport',
      suggestions: ['Airport to city center', 'Public transport passes', 'Taxi vs Uber costs', 'Train schedules']
    },

    food: {
      text: "Foodie adventures await! 🍽️ I can recommend local cuisine, popular restaurants, street food spots, and dining etiquette for your destination. What type of culinary experience are you looking for?",
      type: 'food',
      suggestions: ['Local specialties', 'Best restaurants', 'Street food guide', 'Vegetarian options']
    },

    emergency: {
      text: "I'm here to help with travel emergencies! 🆘 For immediate emergencies, contact local authorities (police: varies by country, universal emergency: 112 in EU). I can also help with lost documents, medical assistance, and embassy contacts.",
      type: 'emergency',
      suggestions: ['Emergency contacts', 'Lost passport help', 'Medical assistance', 'Travel insurance'],
      data: {
        emergencyContacts: {
          international: '112 (Europe), 911 (US), 000 (Australia)',
          tips: [
            'Keep copies of important documents',
            'Save embassy contact numbers',
            'Have travel insurance details ready',
            'Keep emergency cash in multiple locations'
          ]
        }
      }
    },

    currency: {
      text: "I can help with currency exchange and conversion! 💱 I'll provide current exchange rates, best places to exchange money, and tips for managing money abroad.",
      type: 'currency',
      suggestions: ['Convert USD to EUR', 'Best exchange rates', 'ATM vs exchange counters', 'Digital payment options']
    },

    language: {
      text: "Language barriers? No problem! 🗣️ I can help with basic phrases, translation needs, and communication tips for your destination. What language assistance do you need?",
      type: 'language',
      suggestions: ['Basic phrases', 'Restaurant ordering', 'Asking for directions', 'Emergency phrases'],
      data: {
        commonPhrases: {
          english: {
            hello: "Hello",
            thanks: "Thank you", 
            sorry: "Sorry",
            help: "Can you help me?",
            directions: "Where is...?"
          }
        }
      }
    },

    itinerary: {
      text: "Let's create an amazing itinerary for your trip! 📅 I can suggest day-by-day plans, optimal routes, timing for attractions, and help balance your must-see spots with relaxation time.",
      type: 'itinerary',
      suggestions: ['3-day Paris itinerary', 'Tokyo in 5 days', 'Italy 2-week plan', 'Weekend getaway ideas']
    },

    packing: {
      text: "Smart packing makes travel easier! 🎒 I can create personalized packing checklists based on your destination, weather, activities, and trip duration. What's your travel style?",
      type: 'packing',
      suggestions: ['Beach vacation packing', 'Business trip essentials', 'Backpacking checklist', 'Cold weather gear'],
      data: {
        packingTips: [
          'Roll clothes instead of folding',
          'Pack one day\'s clothes in carry-on',
          'Use packing cubes for organization',
          'Leave room for souvenirs',
          'Check airline baggage restrictions'
        ]
      }
    },

    visa: {
      text: "Visa and document requirements can be complex! 📋 I can help you understand what you need for your destination, processing times, and application procedures. Which country are you visiting?",
      type: 'visa',
      suggestions: ['Visa requirements', 'Passport validity', 'Document checklist', 'Processing times']
    },

    culture: {
      text: "Understanding local culture enriches your travel experience! 🌍 I can share insights about customs, etiquette, tipping practices, dress codes, and cultural do's and don'ts for your destination.",
      type: 'culture',
      suggestions: ['Tipping guidelines', 'Dress code advice', 'Cultural etiquette', 'Local customs']
    },

    goodbye: {
      text: "Safe travels! 🌟 I'm always here whenever you need travel assistance. Don't hesitate to ask if you have more questions before or during your trip. Have an amazing adventure!",
      type: 'goodbye',
      suggestions: ['Plan another trip', 'Travel tips', 'Emergency contacts', 'Thank you']
    },

    general: {
      text: "I'm your comprehensive travel assistant! 🌍 I can help with trip planning, bookings, weather, recommendations, budgeting, cultural tips, and much more. What specific travel question can I help you with?",
      type: 'general',
      suggestions: ['Plan a trip', 'Find deals', 'Travel tips', 'Destination info']
    }
  };

  // Add contextual data based on message content
  const response = responses[intent];
  
  // Enhance response with specific location data if mentioned
  const cityNames = extractCityNames(message);
  if (cityNames.length > 0) {
    response.data = response.data || {};
    response.data.mentionedCities = cityNames;
  }

  return response;
};

// Extract city names from message (simple implementation)
const extractCityNames = (message) => {
  const commonCities = [
    'paris', 'london', 'tokyo', 'new york', 'rome', 'barcelona', 'amsterdam',
    'berlin', 'prague', 'vienna', 'budapest', 'istanbul', 'athens', 'lisbon',
    'madrid', 'florence', 'venice', 'milan', 'munich', 'dublin', 'edinburgh',
    'copenhagen', 'stockholm', 'oslo', 'zurich', 'geneva', 'brussels',
    'bangkok', 'singapore', 'hong kong', 'seoul', 'beijing', 'shanghai',
    'mumbai', 'delhi', 'bangalore', 'sydney', 'melbourne', 'auckland'
  ];

  return commonCities.filter(city => 
    message.toLowerCase().includes(city)
  );
};

// Get chat conversation history
const getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Mock conversation history
    const mockHistory = [
      {
        id: '1',
        role: 'user',
        message: 'Hi, I need help planning a trip to Japan',
        timestamp: new Date(Date.now() - 30000).toISOString()
      },
      {
        id: '2',
        role: 'assistant',
        message: 'Hello! I\'d love to help you plan your trip to Japan! 🇯🇵 Japan is amazing with its blend of traditional culture and modern innovation. What time of year are you planning to visit?',
        timestamp: new Date(Date.now() - 25000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        conversationId,
        messages: mockHistory
      }
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
      error: error.message
    });
  }
};

// Smart travel Q&A
const getSmartAnswer = async (req, res) => {
  try {
    const { question, destination, context } = req.body;
    
    const smartAnswers = {
      'best time to visit': `The best time to visit ${destination || 'most destinations'} depends on weather preferences and budget. Generally, shoulder seasons (spring and fall) offer pleasant weather with fewer crowds and better prices.`,
      
      'what to pack': `For ${destination || 'your destination'}, pack based on the season and planned activities. Essential items include comfortable walking shoes, weather-appropriate clothing, travel documents, and a first-aid kit.`,
      
      'local customs': `Understanding local customs in ${destination || 'your destination'} shows respect and enhances your experience. Research tipping practices, dress codes, greeting customs, and dining etiquette before you travel.`,
      
      'transportation': `Getting around ${destination || 'your destination'} efficiently depends on the city. Research public transportation passes, ride-sharing availability, walking distances, and airport transfer options.`,
      
      'budget estimate': `Daily budget for ${destination || 'most destinations'} varies by travel style: Budget ($30-60), Mid-range ($60-120), Luxury ($120+). Include accommodation, meals, transport, and activities.`,
      
      'language barrier': `Language barriers in ${destination || 'foreign countries'} can be overcome with translation apps, learning basic phrases, carrying a phrasebook, and using gestures with patience and a smile.`,
      
      'safety tips': `Stay safe in ${destination || 'any destination'} by researching local safety conditions, keeping valuables secure, staying aware of surroundings, and having emergency contacts readily available.`,
      
      'food recommendations': `Food experiences in ${destination || 'your destination'} are highlights of travel! Try local specialties, visit markets, ask locals for recommendations, and be adventurous while considering dietary restrictions.`
    };

    // Find best matching answer
    let bestAnswer = 'I can help you with specific travel questions! Try asking about the best time to visit, what to pack, local customs, transportation, budget estimates, or food recommendations.';
    
    for (const [key, answer] of Object.entries(smartAnswers)) {
      if (question.toLowerCase().includes(key)) {
        bestAnswer = answer;
        break;
      }
    }

    res.json({
      success: true,
      data: {
        question,
        answer: bestAnswer,
        destination: destination || null,
        relatedTopics: ['Weather', 'Attractions', 'Budget', 'Culture', 'Transportation'],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Smart answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate smart answer',
      error: error.message
    });
  }
};

module.exports = {
  getChatResponse,
  getChatHistory,
  getSmartAnswer
};
