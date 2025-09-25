import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { apiService } from '../services/apiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  type?: string;
  suggestions?: string[];
  data?: any;
  timestamp: string;
}

// Comprehensive Travel Knowledge Base
const travelKnowledge: { [key: string]: any } = {
  // Destinations
  'bali': {
    message: "🏝️ **Bali, Indonesia** is perfect for tropical getaways!\n\n**Best Time:** April-October (dry season)\n**Budget:** $50-150/day depending on style\n**Must Visit:** Ubud rice terraces, Tanah Lot temple, Seminyak beaches\n**Activities:** Surfing, temple hopping, volcano hiking, spa treatments\n**Food:** Try nasi goreng, satay, and fresh seafood",
    suggestions: ['Bali budget breakdown', 'Bali 7-day itinerary', 'Bali weather info', 'Bali visa requirements'],
    data: { 
      destination: 'Bali',
      budget: { min: 50, max: 150, currency: 'USD' },
      bestMonths: ['April', 'May', 'June', 'July', 'August', 'September', 'October'],
      activities: ['Surfing', 'Temple visits', 'Volcano hiking', 'Spa treatments']
    }
  },
  'paris': {
    message: "🗼 **Paris, France** - The City of Light!\n\n**Best Time:** May-September, October-November\n**Budget:** $100-300/day\n**Must Visit:** Eiffel Tower, Louvre, Notre-Dame, Champs-Élysées\n**Tips:** Book museums in advance, learn basic French phrases\n**Food:** Croissants, cheese, wine, macarons",
    suggestions: ['Paris museum pass', 'Paris budget guide', 'Paris romantic spots', 'Paris metro guide'],
    data: {
      destination: 'Paris',
      budget: { min: 100, max: 300, currency: 'USD' },
      mustSee: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Arc de Triomphe']
    }
  },
  'japan': {
    message: "🌸 **Japan** offers incredible culture and experiences!\n\n**Best Time:** Spring (March-May) for cherry blossoms, Autumn (September-November)\n**Budget:** $100-200/day\n**Must Visit:** Tokyo, Kyoto, Osaka, Mount Fuji\n**Tips:** Get JR Pass for trains, learn basic bowing etiquette\n**Food:** Sushi, ramen, tempura, wagyu beef",
    suggestions: ['Japan JR Pass guide', 'Cherry blossom forecast', 'Japanese etiquette', 'Tokyo vs Kyoto'],
    data: {
      destination: 'Japan',
      specialSeasons: ['Cherry Blossom (March-May)', 'Autumn Colors (Sep-Nov)'],
      transport: 'JR Pass recommended for tourists'
    }
  },
  'thailand': {
    message: "🍜 **Thailand** - Amazing food, culture, and beaches!\n\n**Best Time:** November-April (cool & dry)\n**Budget:** $30-80/day\n**Must Visit:** Bangkok, Chiang Mai, Phuket, Koh Phi Phi\n**Activities:** Thai cooking classes, temple visits, island hopping\n**Food:** Pad thai, som tam, mango sticky rice",
    suggestions: ['Thailand islands guide', 'Bangkok street food', 'Thai visa info', 'Best Thai beaches'],
    data: {
      destination: 'Thailand',
      budget: { min: 30, max: 80, currency: 'USD' },
      regions: ['Bangkok (Culture)', 'North (Mountains)', 'South (Beaches)', 'Islands']
    }
  },

  // Travel Planning
  'budget': {
    message: "💰 **Smart Travel Budgeting:**\n\n**Daily Budget Breakdown:**\n• Accommodation: 40-50%\n• Food: 25-30%\n• Transport: 10-15%\n• Activities: 10-15%\n• Miscellaneous: 5-10%\n\n**Money-saving Tips:**\n• Book flights 2-8 weeks ahead\n• Use travel reward credit cards\n• Stay in hostels or Airbnb\n• Cook some meals\n• Use public transport",
    suggestions: ['Budget calculator', 'Cheap flights tips', 'Budget destinations', 'Travel apps for deals'],
    data: {
      budgetTips: [
        'Book flights 2-8 weeks in advance',
        'Use incognito mode when searching flights',
        'Consider shoulder season travel',
        'Use public transportation',
        'Cook some meals yourself',
        'Look for free walking tours'
      ]
    }
  },
  'packing': {
    message: "🎒 **Essential Packing Checklist:**\n\n**Documents:**\n• Passport + copies\n• Visa (if required)\n• Travel insurance\n• Flight confirmations\n\n**Electronics:**\n• Phone + charger\n• Universal adapter\n• Power bank\n• Camera\n\n**Clothing:**\n• Weather-appropriate clothes\n• Comfortable walking shoes\n• One dressy outfit\n\n**Health & Safety:**\n• Medications\n• First aid kit\n• Sunscreen\n• Hand sanitizer",
    suggestions: ['Packing for different climates', 'Carry-on restrictions', 'Travel gear recommendations', 'Packing cubes guide'],
    data: {
      essentials: ['Passport', 'Chargers', 'Comfortable shoes', 'Medications', 'Weather-appropriate clothes'],
      packingTips: ['Roll clothes to save space', 'Pack one extra day of clothes', 'Keep valuables in carry-on']
    }
  },
  'visa': {
    message: "📋 **Visa & Travel Documents:**\n\n**Passport Requirements:**\n• Valid for 6+ months from travel date\n• At least 2 blank pages\n• Keep copies separate from original\n\n**Visa Types:**\n• Tourist visa (most common)\n• Visa on arrival (some countries)\n• eVisa (online application)\n• Visa-free (depends on citizenship)\n\n**Apply early:** 2-8 weeks before travel",
    suggestions: ['Visa requirements by country', 'Passport renewal', 'eVisa applications', 'Travel document safety'],
    data: {
      visaFreeCountries: 'Depends on your citizenship',
      processingTime: '2-8 weeks typically'
    }
  },
  'insurance': {
    message: "🛡️ **Travel Insurance Essentials:**\n\n**Coverage Types:**\n• Medical emergencies\n• Trip cancellation/interruption\n• Lost/stolen luggage\n• Emergency evacuation\n• Adventure sports coverage\n\n**Cost:** Usually 4-10% of trip cost\n**When to buy:** Within 14 days of first trip payment\n\n**Top providers:** World Nomads, Allianz, SafetyWing",
    suggestions: ['Compare insurance plans', 'Adventure sports coverage', 'Annual travel insurance', 'Insurance claims process'],
    data: {
      emergencyContacts: {
        international: 'Keep insurance provider emergency number saved in phone'
      }
    }
  },
  'flights': {
    message: "✈️ **Smart Flight Booking:**\n\n**Best Booking Times:**\n• Domestic: 1-3 months ahead\n• International: 2-8 months ahead\n• Tuesday/Wednesday often cheaper\n\n**Money-saving Tricks:**\n• Use incognito mode\n• Be flexible with dates\n• Consider nearby airports\n• Book one-way tickets separately\n• Set price alerts\n\n**Best sites:** Skyscanner, Google Flights, Momondo",
    suggestions: ['Flight price alerts', 'Alternative airports', 'Airline miles programs', 'Best day to book'],
    data: {
      bookingTips: [
        'Clear browser cookies before searching',
        'Compare prices across multiple sites',
        'Consider budget airlines for short flights'
      ]
    }
  },

  // Travel Types
  'solo': {
    message: "🚶 **Solo Travel Guide:**\n\n**Benefits:**\n• Complete freedom to choose activities\n• Meet locals and other travelers\n• Personal growth and confidence\n• Go at your own pace\n\n**Safety Tips:**\n• Share itinerary with family\n• Stay in well-reviewed places\n• Trust your instincts\n• Keep emergency contacts handy\n\n**Best solo destinations:** Japan, New Zealand, Portugal, Thailand",
    suggestions: ['Solo female travel safety', 'Solo travel destinations', 'Meeting people while traveling', 'Solo travel budgeting']
  },
  'family': {
    message: "👨‍👩‍👧‍👦 **Family Travel Tips:**\n\n**Planning Essentials:**\n• Book family-friendly accommodations\n• Plan shorter travel days\n• Pack entertainment for kids\n• Research family attractions\n\n**What to bring:**\n• Stroller/carrier for young kids\n• Snacks and activities\n• First aid kit\n• Child identification tags\n\n**Best family destinations:** Orlando, Costa Rica, Australia, Singapore",
    suggestions: ['Family travel packing list', 'Kid-friendly destinations', 'Family travel deals', 'Entertaining kids on flights']
  }
};

// Smart response matching
const getSmartResponse = (message: string): ChatMessage | null => {
  const lowerMessage = message.toLowerCase();
  
  // Direct keyword matching
  for (const [key, knowledge] of Object.entries(travelKnowledge)) {
    if (lowerMessage.includes(key)) {
      return {
        id: `smart_${Date.now()}`,
        role: 'assistant',
        message: knowledge.message,
        suggestions: knowledge.suggestions || [],
        data: knowledge.data || null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Contextual matching
  if (lowerMessage.includes('plan') && lowerMessage.includes('trip')) {
    return {
      id: `smart_${Date.now()}`,
      role: 'assistant',
      message: "🎯 **Trip Planning Made Easy:**\n\n**Steps:**\n1. Choose your destination\n2. Set your budget\n3. Pick travel dates\n4. Book flights & accommodation\n5. Plan activities & research culture\n6. Get travel insurance\n7. Pack smart\n\n**Need help with any of these steps?**",
      suggestions: ['Help with budget planning', 'Destination recommendations', 'Booking tips', 'Packing advice'],
      timestamp: new Date().toISOString()
    };
  }

  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return {
      id: `smart_${Date.now()}`,
      role: 'assistant',
      message: "🌟 **Popular Destinations by Type:**\n\n🏖️ **Beach:** Bali, Maldives, Hawaii, Goa\n🏛️ **Culture:** Japan, Italy, India, Egypt\n🗻 **Adventure:** Nepal, New Zealand, Patagonia\n🏙️ **Cities:** Paris, Tokyo, New York, London\n💰 **Budget:** Thailand, Vietnam, India, Eastern Europe\n\nWhat type of experience interests you?",
      suggestions: ['Beach destinations', 'Cultural experiences', 'Adventure travel', 'City breaks'],
      timestamp: new Date().toISOString()
    };
  }

  if (lowerMessage.includes('weather') || lowerMessage.includes('when to visit')) {
    return {
      id: `smart_${Date.now()}`,
      role: 'assistant',
      message: "🌤️ **Best Travel Seasons:**\n\n🌸 **Spring (Mar-May):** Europe, Japan (cherry blossoms)\n☀️ **Summer (Jun-Aug):** Europe, Canada, Scandinavia\n🍂 **Fall (Sep-Nov):** India, Nepal, Japan (autumn colors)\n❄️ **Winter (Dec-Feb):** Southeast Asia, Australia, South America\n\n**Which destination are you considering?**",
      suggestions: ['Bali weather', 'Europe best time', 'Japan cherry blossoms', 'Thailand seasons'],
      timestamp: new Date().toISOString()
    };
  }

  return null;
};

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      message: "Hello! 👋 I'm your AI travel assistant. I can help you with trip planning, destination guides, budgeting, visa info, and much more. What would you like to explore today?",
      type: 'greeting',
      suggestions: ['Plan a trip to Bali', 'Budget travel tips', 'Visa requirements', 'Best destinations 2024'],
      timestamp: new Date().toISOString()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId] = useState(`conv_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Try smart response first (instant response)
    const smartResponse = getSmartResponse(message.trim());
    if (smartResponse) {
      setTimeout(() => {
        setMessages(prev => [...prev, smartResponse]);
        setIsTyping(false);
      }, 800);
      return;
    }

    // Fallback to backend API
    try {
      interface AIChatResponseData {
        id: string;
        message: string;
        type?: string;
        suggestions?: string[];
        data?: any;
        timestamp: string;
      }

      interface AIChatResponse {
        suggestions: string[] | undefined;
        timestamp: string;
        type: string | undefined;
        message: string;
        id: string;
        success: boolean;
        data?: AIChatResponseData;
      }

      const response = await apiService.post<AIChatResponse>('/ai/chat', {
        message: message.trim(),
        conversationId,
        userId: 'current_user'
      });

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          id: response.data.id,
          role: 'assistant',
          message: response.data.message,
          type: response.data.type,
          suggestions: response.data.suggestions,
          data: response.data.data,
          timestamp: response.data.timestamp
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Enhanced fallback response
      const fallbackMessage: ChatMessage = {
        id: `fallback_${Date.now()}`,
        role: 'assistant',
        message: "I apologize, but I'm having trouble connecting to my knowledge base right now. However, I can still help with basic travel information!\n\nTry asking about:\n• Popular destinations\n• Budget planning\n• Packing tips\n• Travel safety",
        suggestions: ['Tell me about Bali', 'Budget travel advice', 'Packing checklist', 'Visa information'],
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(currentMessage);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
          Travel expert at your service! 🌍✈️
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            🤖
          </div>
          <div>
            <h3 className="font-semibold">AI Travel Expert</h3>
            <p className="text-xs opacity-90">Your personal travel guide</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[400px]">
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {messages.map((message) => (
            <div key={message.id} className="mb-4">
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.message}
                </div>
              </div>

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Enhanced Special Data Display */}
              {message.data && message.data.destination && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                  <p className="font-bold text-blue-800 mb-1">🏝️ {message.data.destination} Quick Facts:</p>
                  {message.data.budget && (
                    <p className="text-blue-700">💰 Budget: ${message.data.budget.min}-{message.data.budget.max}/day</p>
                  )}
                  {message.data.bestMonths && (
                    <p className="text-blue-700">📅 Best months: {message.data.bestMonths.slice(0, 3).join(', ')}</p>
                  )}
                </div>
              )}

              {message.data && message.data.budgetTips && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
                  <p className="font-bold text-green-800 mb-2">💰 Money-Saving Tips:</p>
                  <ul className="text-green-700 space-y-1">
                    {message.data.budgetTips.slice(0, 3).map((tip: string, index: number) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span>•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {message.data && message.data.emergencyContacts && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
                  <p className="font-bold text-red-800 mb-1">🚨 Emergency Info:</p>
                  <p className="text-red-700">{message.data.emergencyContacts.international}</p>
                </div>
              )}

              {message.data && message.data.essentials && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                  <p className="font-bold text-yellow-800 mb-1">🎒 Travel Essentials:</p>
                  <div className="flex flex-wrap gap-1">
                    {message.data.essentials.slice(0, 4).map((item: string, index: number) => (
                      <span key={index} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask about destinations, budget, visas..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={!currentMessage.trim() || isTyping}
              className="px-3 py-2 text-sm"
            >
              {isTyping ? '...' : '✈️'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;
