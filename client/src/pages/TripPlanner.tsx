import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Plane, 
  CheckCircle,
  Cloud,
  Navigation,
  Clock,
  Star,
  TrendingUp,
  Bed,
  Thermometer,
  Umbrella,
  Sun
} from 'lucide-react';
import toast from 'react-hot-toast';

// API Keys
const WEATHER_API_KEY = 'c888ef299fa05ccaf2ba38a6b485250a';

interface TripForm {
  from: string;
  destination: string;
  budget: number;
  people: number;
  startDate: string;
  endDate: string;
}

interface WeatherData {
  condition: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  isGood: boolean;
}

interface PlaceData {
  name: string;
  description: string;
  rating: number;
  address: string;
  category: string;
  visitDuration: string;
  bestTime: string;
  cost: number;
  tips: string;
}

interface HotelData {
  name: string;
  rating: number;
  address: string;
  pricePerNight: number;
  amenities: string[];
}

interface DayPlan {
  day: number;
  date: string;
  theme: string;
  type: 'travel' | 'explore' | 'return';
  places: PlaceData[];
  hotel: HotelData;
  totalCost: number;
  weather: WeatherData;
  activities: string[];
  schedule: {
    morning: string;
    afternoon: string;
    evening: string;
  };
}

const TripPlanner: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [tripPlan, setTripPlan] = useState<DayPlan[] | null>(null);
  const [showPlan, setShowPlan] = useState(false);
  
  const [tripForm, setTripForm] = useState<TripForm>({
    from: '',
    destination: '',
    budget: 50000,
    people: 2,
    startDate: '',
    endDate: ''
  });

  // Calculate number of days
  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // SIMPLIFIED: Get famous places for destination (without API dependency)
  const getFamousPlaces = (destination: string): PlaceData[] => {
    const destinationLower = destination.toLowerCase();
    
    // Famous places database
    const placesDB: { [key: string]: PlaceData[] } = {
      'goa': [
        {
          name: 'Baga Beach',
          description: 'Famous beach with water sports, nightlife, and beach shacks',
          rating: 4.2,
          address: 'Baga, North Goa',
          category: 'Beach',
          visitDuration: '3-4 hours',
          bestTime: 'Morning/Evening',
          cost: 0,
          tips: 'Perfect for water sports and sunset views'
        },
        {
          name: 'Basilica of Bom Jesus',
          description: 'UNESCO World Heritage Site with Portuguese colonial architecture',
          rating: 4.5,
          address: 'Old Goa',
          category: 'Religious/Historical',
          visitDuration: '1-2 hours',
          bestTime: 'Morning',
          cost: 25,
          tips: 'Carry camera, dress modestly'
        },
        {
          name: 'Dudhsagar Falls',
          description: 'Four-tiered waterfall, one of India\'s tallest waterfalls',
          rating: 4.4,
          address: 'Goa-Karnataka border',
          category: 'Nature',
          visitDuration: '5-6 hours',
          bestTime: 'Full Day',
          cost: 800,
          tips: 'Best during monsoon, carry swimwear'
        },
        {
          name: 'Fort Aguada',
          description: '17th-century Portuguese fort with lighthouse and sea views',
          rating: 4.1,
          address: 'Sinquerim, North Goa',
          category: 'Historical',
          visitDuration: '2-3 hours',
          bestTime: 'Evening',
          cost: 25,
          tips: 'Great for photography and sunset'
        },
        {
          name: 'Anjuna Flea Market',
          description: 'Famous weekly market with handicrafts, clothes, and food',
          rating: 4.0,
          address: 'Anjuna Beach, North Goa',
          category: 'Shopping',
          visitDuration: '2-3 hours',
          bestTime: 'Evening',
          cost: 500,
          tips: 'Open on Wednesdays, bargain for better prices'
        },
        {
          name: 'Calangute Beach',
          description: 'Queen of beaches with water sports and beach activities',
          rating: 4.0,
          address: 'Calangute, North Goa',
          category: 'Beach',
          visitDuration: '3-4 hours',
          bestTime: 'Morning',
          cost: 0,
          tips: 'Try parasailing and jet skiing'
        }
      ],
      'kerala': [
        {
          name: 'Munnar Tea Gardens',
          description: 'Sprawling tea plantations with scenic mountain views',
          rating: 4.6,
          address: 'Munnar, Kerala',
          category: 'Nature',
          visitDuration: '4-5 hours',
          bestTime: 'Morning',
          cost: 150,
          tips: 'Visit tea factory, carry warm clothes'
        },
        {
          name: 'Alleppey Backwaters',
          description: 'Network of canals, lagoons perfect for houseboat stays',
          rating: 4.5,
          address: 'Alappuzha, Kerala',
          category: 'Nature',
          visitDuration: '6-8 hours',
          bestTime: 'Full Day',
          cost: 2000,
          tips: 'Book houseboat in advance, try Kerala meals'
        },
        {
          name: 'Periyar Wildlife Sanctuary',
          description: 'Wildlife sanctuary famous for elephants and boat safari',
          rating: 4.3,
          address: 'Thekkady, Kerala',
          category: 'Wildlife',
          visitDuration: '3-4 hours',
          bestTime: 'Morning',
          cost: 300,
          tips: 'Early morning for better wildlife spotting'
        },
        {
          name: 'Fort Kochi',
          description: 'Historic area with colonial architecture and Chinese nets',
          rating: 4.4,
          address: 'Kochi, Kerala',
          category: 'Historical',
          visitDuration: '3-4 hours',
          bestTime: 'Evening',
          cost: 0,
          tips: 'Walk around, visit spice markets'
        },
        {
          name: 'Kovalam Beach',
          description: 'Crescent-shaped beach famous for Ayurvedic treatments',
          rating: 4.1,
          address: 'Kovalam, Kerala',
          category: 'Beach',
          visitDuration: '3-4 hours',
          bestTime: 'Evening',
          cost: 0,
          tips: 'Try Ayurvedic massage, lighthouse visit'
        }
      ],
      'rajasthan': [
        {
          name: 'Amber Fort',
          description: 'Hilltop fort with stunning Rajput architecture and mirror work',
          rating: 4.5,
          address: 'Amer, Jaipur',
          category: 'Historical',
          visitDuration: '3-4 hours',
          bestTime: 'Morning',
          cost: 200,
          tips: 'Elephant ride available, carry water'
        },
        {
          name: 'City Palace Udaipur',
          description: 'Royal palace complex overlooking Lake Pichola',
          rating: 4.4,
          address: 'Udaipur, Rajasthan',
          category: 'Palace',
          visitDuration: '2-3 hours',
          bestTime: 'Morning',
          cost: 300,
          tips: 'Photography allowed, museum inside'
        },
        {
          name: 'Thar Desert Safari',
          description: 'Camel safari in golden sand dunes with cultural performances',
          rating: 4.6,
          address: 'Jaisalmer, Rajasthan',
          category: 'Adventure',
          visitDuration: '6-8 hours',
          bestTime: 'Evening/Night',
          cost: 1500,
          tips: 'Carry sunscreen, enjoy folk dance'
        },
        {
          name: 'Hawa Mahal',
          description: 'Iconic pink sandstone palace with 953 windows',
          rating: 4.2,
          address: 'Jaipur, Rajasthan',
          category: 'Historical',
          visitDuration: '1-2 hours',
          bestTime: 'Morning',
          cost: 50,
          tips: 'Perfect for photography, early visit recommended'
        }
      ],
      'agra': [
        {
          name: 'Taj Mahal',
          description: 'UNESCO World Heritage Site, one of Seven Wonders of World',
          rating: 4.8,
          address: 'Agra, Uttar Pradesh',
          category: 'Historical',
          visitDuration: '3-4 hours',
          bestTime: 'Early Morning',
          cost: 1100,
          tips: 'Sunrise visit best, closed on Fridays'
        },
        {
          name: 'Agra Fort',
          description: 'Red sandstone fort complex, UNESCO World Heritage Site',
          rating: 4.5,
          address: 'Agra, Uttar Pradesh',
          category: 'Historical',
          visitDuration: '2-3 hours',
          bestTime: 'Morning',
          cost: 650,
          tips: 'Combine with Taj Mahal visit'
        },
        {
          name: 'Mehtab Bagh',
          description: 'Moonlight garden with stunning Taj Mahal sunset views',
          rating: 4.3,
          address: 'Agra, Uttar Pradesh',
          category: 'Garden',
          visitDuration: '1-2 hours',
          bestTime: 'Evening',
          cost: 30,
          tips: 'Perfect for Taj Mahal photography'
        }
      ]
    };

    // Find matching destination
    for (const key in placesDB) {
      if (destinationLower.includes(key) || key.includes(destinationLower)) {
        return placesDB[key];
      }
    }

    // Default generic places for unknown destinations
    return [
      {
        name: `${destination} City Center`,
        description: `Explore the main attractions and local culture of ${destination}`,
        rating: 4.0,
        address: `${destination} City Center`,
        category: 'City Tour',
        visitDuration: '3-4 hours',
        bestTime: 'Morning',
        cost: 200,
        tips: 'Start with local guide for better experience'
      },
      {
        name: `${destination} Heritage Museum`,
        description: `Learn about the rich history and culture of ${destination}`,
        rating: 4.2,
        address: `${destination} Museum District`,
        category: 'Cultural',
        visitDuration: '2-3 hours',
        bestTime: 'Afternoon',
        cost: 150,
        tips: 'Audio guide available, photography extra'
      },
      {
        name: `${destination} Local Market`,
        description: `Traditional market for authentic shopping and street food`,
        rating: 3.9,
        address: `${destination} Market Area`,
        category: 'Shopping',
        visitDuration: '2-3 hours',
        bestTime: 'Evening',
        cost: 300,
        tips: 'Bargain for better prices, try local food'
      }
    ];
  };

  // Check weather conditions with detailed info
  const checkWeatherConditions = async (destination: string): Promise<WeatherData> => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${destination}&appid=${WEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather API failed');
      }
      
      const data = await response.json();
      
      const weather: WeatherData = {
        condition: data.weather[0].main,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind?.speed || 0),
        isGood: data.weather[0].main !== 'Thunderstorm' && 
               data.weather[0].main !== 'Snow' && 
               data.weather[0].main !== 'Extreme' &&
               data.main.temp > 5 && 
               data.main.temp < 45
      };
      
      return weather;
    } catch (error) {
      console.error('Weather check failed:', error);
      // Fallback weather
      return {
        condition: 'Clear',
        temperature: 28,
        description: 'clear sky',
        humidity: 60,
        windSpeed: 5,
        isGood: true
      };
    }
  };

  // Generate hotel info
  const getHotelInfo = (destination: string): HotelData => {
    return {
      name: `Premium Hotel ${destination}`,
      rating: 4.2,
      address: `${destination} City Center`,
      pricePerNight: 3000,
      amenities: ['WiFi', 'AC', 'Restaurant', 'Pool', 'Room Service']
    };
  };

  // MAIN: Generate complete trip plan with REAL PLACES
  const generateCompleteTripPlan = (
    days: number, 
    places: PlaceData[], 
    hotel: HotelData, 
    weather: WeatherData
  ): DayPlan[] => {
    const plan: DayPlan[] = [];
    const dailyBudget = tripForm.budget / days;

    // DAY 1: Travel Day
    const startDate = new Date(tripForm.startDate);
    plan.push({
      day: 1,
      date: startDate.toISOString().split('T')[0],
      theme: `Travel Day - ${tripForm.from} to ${tripForm.destination}`,
      type: 'travel',
      places: [],
      hotel: hotel,
      totalCost: 0,
      weather: weather,
      activities: [
        '🌅 Morning preparation and departure',
        `🚗 Travel from ${tripForm.from} to ${tripForm.destination}`,
        '🏨 Hotel check-in and rest',
        '🍽️ Welcome dinner at local restaurant'
      ],
      schedule: {
        morning: 'Departure preparations and travel start',
        afternoon: `Journey to ${tripForm.destination}`,
        evening: 'Hotel check-in and local dinner'
      }
    });

    // MIDDLE DAYS: Exploration with REAL PLACES
    const explorationDays = days - 2;
    const placesPerDay = Math.ceil(places.length / Math.max(explorationDays, 1));

    for (let i = 1; i <= explorationDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Get places for this day
      const startIndex = (i - 1) * placesPerDay;
      const endIndex = Math.min(startIndex + placesPerDay, places.length);
      const dayPlaces = places.slice(startIndex, endIndex);
      
      // If no places assigned, use some from the list
      if (dayPlaces.length === 0 && places.length > 0) {
        dayPlaces.push(places[Math.floor(Math.random() * places.length)]);
      }

      const dayCost = dayPlaces.reduce((sum, place) => sum + place.cost, 0) * tripForm.people;

      // Create schedule based on places
      let morningActivity = 'Breakfast and preparation';
      let afternoonActivity = 'Local exploration';
      let eveningActivity = 'Dinner and relaxation';

      if (dayPlaces.length > 0) {
        morningActivity = `Visit ${dayPlaces[0].name}`;
        if (dayPlaces.length > 1) {
          afternoonActivity = `Visit ${dayPlaces[1].name}`;
        }
        if (dayPlaces.length > 2) {
          eveningActivity = `Visit ${dayPlaces[2].name} and dinner`;
        }
      }

      plan.push({
        day: i + 1,
        date: date.toISOString().split('T')[0],
        theme: `Day ${i + 1}: Explore ${tripForm.destination}`,
        type: 'explore',
        places: dayPlaces,
        hotel: hotel,
        totalCost: dayCost,
        weather: weather,
        activities: [
          '🌅 Morning breakfast at hotel',
          `🎯 Visit ${dayPlaces.length} amazing attractions`,
          '🍽️ Lunch at local restaurant',
          '📸 Sightseeing and photography',
          '🌙 Evening leisure and dinner'
        ],
        schedule: {
          morning: morningActivity,
          afternoon: afternoonActivity,
          evening: eveningActivity
        }
      });
    }

    // LAST DAY: Return Journey
    if (days > 1) {
      const returnDate = new Date(startDate);
      returnDate.setDate(startDate.getDate() + days - 1);
      
      plan.push({
        day: days,
        date: returnDate.toISOString().split('T')[0],
        theme: `Return Day - ${tripForm.destination} to ${tripForm.from}`,
        type: 'return',
        places: [],
        hotel: hotel,
        totalCost: 0,
        weather: weather,
        activities: [
          '🌅 Final breakfast at hotel',
          '🛍️ Last minute shopping',
          '🏨 Hotel check-out',
          `✈️ Return journey to ${tripForm.from}`,
          '🏠 Reach home safely'
        ],
        schedule: {
          morning: 'Final breakfast and packing',
          afternoon: 'Shopping and hotel check-out',
          evening: `Journey back to ${tripForm.from}`
        }
      });
    }

    return plan;
  };

  // Main trip planning function
  const handlePlanTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!tripForm.from || !tripForm.destination || !tripForm.startDate || !tripForm.endDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const startDate = new Date(tripForm.startDate);
    const endDate = new Date(tripForm.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate <= today) {
      toast.error('Start date must be in the future');
      return;
    }
    
    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }
    
    const days = calculateDays(tripForm.startDate, tripForm.endDate);
    
    if (days > 30) {
      toast.error('Trip cannot exceed 30 days');
      return;
    }
    
    if (days < 2) {
      toast.error('Trip must be at least 2 days');
      return;
    }
    
    if (tripForm.budget < 5000) {
      toast.error('Budget must be at least ₹5,000');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Step 1: Check weather
      toast('🌤️ Checking weather conditions...', { duration: 2000 });
      const weather = await checkWeatherConditions(tripForm.destination);
      setWeatherData(weather);
      
      // Step 2: Weather alert if bad
      if (!weather.isGood) {
        toast.error(`⚠️ Weather Alert: ${weather.condition} (${weather.temperature}°C) - Consider changing dates!`, {
          duration: 6000
        });
        setIsLoading(false);
        return;
      }
      
      toast.success(`✅ Great weather! ${weather.condition} - ${weather.temperature}°C`);
      
      // Step 3: Get famous places (no API dependency)
      toast('🎯 Loading famous places to visit...', { duration: 2000 });
      const places = getFamousPlaces(tripForm.destination);
      
      // Step 4: Get hotel info
      const hotel = getHotelInfo(tripForm.destination);
      
      // Step 5: Generate complete trip plan
      toast('📅 Creating your complete itinerary...', { duration: 2000 });
      const completePlan = generateCompleteTripPlan(days, places, hotel, weather);
      
      setTripPlan(completePlan);
      setShowPlan(true);
      
      toast.success(`🎉 Complete ${days}-day trip planned with ${places.length} places!`);
      
    } catch (error) {
      console.error('Trip planning error:', error);
      toast.error('Failed to plan trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to map
  const handleNavigateToMap = () => {
    const tripData = {
      from: tripForm.from,
      destination: tripForm.destination,
      plan: tripPlan,
      weather: weatherData
    };
    
    localStorage.setItem('currentTripForMap', JSON.stringify(tripData));
    navigate('/realtime-map');
  };

  // Save trip
  const saveTripToDashboard = async () => {
    try {
      const tripToSave = {
        id: Date.now(),
        from: tripForm.from,
        destination: tripForm.destination,
        budget: tripForm.budget,
        people: tripForm.people,
        startDate: tripForm.startDate,
        endDate: tripForm.endDate,
        days: calculateDays(tripForm.startDate, tripForm.endDate),
        plan: tripPlan,
        weather: weatherData,
        createdAt: new Date().toISOString(),
        status: 'planned'
      };
      
      const existingTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      existingTrips.push(tripToSave);
      localStorage.setItem('savedTrips', JSON.stringify(existingTrips));
      
      toast.success('💾 Trip saved to dashboard!');
      navigate(`/trip-details/${tripToSave.id}`);
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save trip');
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-indigo-900 mb-4 flex items-center justify-center">
          <Plane className="w-10 h-10 mr-3" />
          Smart Trip Planner
        </h1>
        <p className="text-lg text-gray-600">
          Plan your trip with real places, weather check, and detailed schedule
        </p>
      </motion.div>

      {/* Trip Form */}
      {!showPlan && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Plan Your Trip</h2>
          
          <form onSubmit={handlePlanTrip} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Navigation className="w-4 h-4 mr-2" />
                  From
                </label>
                <input
                  type="text"
                  value={tripForm.from}
                  onChange={(e) => setTripForm({...tripForm, from: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your starting city"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  Destination
                </label>
                <input
                  type="text"
                  value={tripForm.destination}
                  onChange={(e) => setTripForm({...tripForm, destination: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Goa, Kerala, Rajasthan, Agra..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Budget (₹)
                </label>
                <input
                  type="number"
                  value={tripForm.budget}
                  onChange={(e) => setTripForm({...tripForm, budget: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="5000"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  People
                </label>
                <select
                  value={tripForm.people}
                  onChange={(e) => setTripForm({...tripForm, people: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={tripForm.startDate}
                  onChange={(e) => setTripForm({...tripForm, startDate: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min={getTomorrowDate()}
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  End Date
                </label>
                <input
                  type="date"
                  value={tripForm.endDate}
                  onChange={(e) => setTripForm({...tripForm, endDate: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min={tripForm.startDate || getTomorrowDate()}
                  required
                />
              </div>
            </div>

            {tripForm.startDate && tripForm.endDate && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-indigo-800 font-medium">
                  Trip Duration: {calculateDays(tripForm.startDate, tripForm.endDate)} days
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Planning Your Trip...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Plan My Trip
                </span>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* FIXED: Trip Plan Display with REAL PLACES */}
      {showPlan && tripPlan && weatherData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Weather Details */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Cloud className="w-6 h-6 mr-2 text-blue-500" />
              Weather Details for {tripForm.destination}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Thermometer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-800">{weatherData.temperature}°C</div>
                <div className="text-blue-600 text-sm">{weatherData.condition}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Umbrella className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-800">{weatherData.humidity}%</div>
                <div className="text-green-600 text-sm">Humidity</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Sun className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-800">{weatherData.windSpeed} km/h</div>
                <div className="text-yellow-600 text-sm">Wind Speed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-800">
                  {weatherData.isGood ? 'Perfect' : 'Caution'}
                </div>
                <div className="text-purple-600 text-sm">For Travel</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-blue-800">
                <strong>Conditions:</strong> {weatherData.description} - 
                {weatherData.isGood ? ' Excellent weather for sightseeing!' : ' Pack accordingly for weather conditions.'}
              </p>
            </div>
          </div>

          {/* Trip Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Complete Trip Plan</h2>
              <div className="flex space-x-4">
                <button
                  onClick={handleNavigateToMap}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  View on Map
                </button>
                <button
                  onClick={saveTripToDashboard}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Trip
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-indigo-600 text-sm">Route</div>
                <div className="font-bold">{tripForm.from} → {tripForm.destination}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-sm">Duration</div>
                <div className="font-bold">{calculateDays(tripForm.startDate, tripForm.endDate)} days</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-yellow-600 text-sm">Budget</div>
                <div className="font-bold">₹{tripForm.budget.toLocaleString()}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-sm">Travelers</div>
                <div className="font-bold">{tripForm.people} people</div>
              </div>
            </div>
          </div>

          {/* Day-wise Plan with REAL PLACES */}
          {tripPlan.map((day) => (
            <div key={day.day} className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{day.theme}</h3>
                  <p className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Weather</div>
                  <div className="font-medium">{day.weather.temperature}°C, {day.weather.condition}</div>
                </div>
              </div>

              {/* Hotel Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Bed className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-800">{day.hotel.name}</h4>
                  <div className="ml-auto flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>{day.hotel.rating}</span>
                  </div>
                </div>
                <p className="text-blue-600 text-sm">📍 {day.hotel.address} • ₹{day.hotel.pricePerNight}/night</p>
              </div>

              {/* PLACES TO VISIT */}
              {day.places.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">
                    🎯 Places to Visit ({day.places.length} locations)
                  </h4>
                  <div className="space-y-4">
                    {day.places.map((place, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-bold text-gray-800 text-lg">{place.name}</h5>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-sm font-medium mr-4">{place.rating}</span>
                              <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                {place.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-indigo-600">
                              {place.cost === 0 ? 'Free' : `₹${place.cost * tripForm.people}`}
                            </div>
                            <div className="text-sm text-gray-500">Total Cost</div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{place.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{place.visitDuration}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Sun className="w-4 h-4 mr-2" />
                            <span>Best: {place.bestTime}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{place.address}</span>
                          </div>
                        </div>
                        
                        {place.tips && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                            <div className="text-sm text-yellow-800">
                              <strong>💡 Tip:</strong> {place.tips}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">📅 Day Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="font-semibold text-yellow-800 mb-2">🌅 Morning</div>
                    <div className="text-yellow-700">{day.schedule.morning}</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-800 mb-2">☀️ Afternoon</div>
                    <div className="text-blue-700">{day.schedule.afternoon}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-800 mb-2">🌙 Evening</div>
                    <div className="text-purple-700">{day.schedule.evening}</div>
                  </div>
                </div>
              </div>

              {/* Day Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Day {day.day} Total Cost:</span>
                  <span className="font-bold text-lg text-indigo-600">
                    {day.totalCost === 0 ? 'Included in Package' : `₹${day.totalCost.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Trip Total */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Trip Total</h3>
                <p className="text-indigo-100">
                  {calculateDays(tripForm.startDate, tripForm.endDate)} days • {tripForm.people} people • {tripPlan.reduce((sum, day) => sum + day.places.length, 0)} places
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  ₹{tripPlan.reduce((sum, day) => sum + day.totalCost, 0).toLocaleString()}
                </div>
                <div className="text-sm text-indigo-200">
                  Activities Cost Only
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TripPlanner;