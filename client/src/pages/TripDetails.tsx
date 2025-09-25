import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Star,
  Clock,
  Camera,
  Navigation,
  Edit3,
  Share2,
  Download,
  Bed,
  Cloud,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TripDetails {
  id: number;
  from: string;
  destination: string;
  budget: number;
  people: number;
  startDate: string;
  endDate: string;
  days: number;
  plan: DayPlan[];
  weather: WeatherData;
  createdAt: string;
  status: 'planned' | 'ongoing' | 'completed';
}

interface WeatherData {
  condition: string;
  temperature: number;
  description: string;
  icon: string;
  isGood: boolean;
}

interface PlaceData {
  name: string;
  description: string;
  rating: number;
  photos: string[];
  address: string;
  category: string;
  visitDuration: string;
  bestTime: string;
  cost: number;
}

interface HotelData {
  name: string;
  rating: number;
  photos: string[];
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
  hotel?: HotelData;
  totalCost: number;
  weather: WeatherData;
  activities: string[];
}

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  useEffect(() => {
    loadTripDetails();
  }, [id]);

  const loadTripDetails = () => {
    try {
      // Load from localStorage (simulating database)
      const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      const trip = savedTrips.find((t: TripDetails) => t.id.toString() === id);
      
      if (trip) {
        setTripDetails(trip);
      } else {
        toast.error('Trip not found');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading trip:', error);
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const updateTripStatus = (newStatus: 'planned' | 'ongoing' | 'completed') => {
    if (!tripDetails) return;
    
    try {
      const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      const updatedTrips = savedTrips.map((t: TripDetails) => 
        t.id === tripDetails.id ? { ...t, status: newStatus } : t
      );
      
      localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
      setTripDetails({ ...tripDetails, status: newStatus });
      toast.success(`Trip status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update trip status');
    }
  };

  const shareTrip = () => {
    if (!tripDetails) return;
    
    const shareText = `Check out my ${tripDetails.days}-day trip to ${tripDetails.destination}! 
🗓️ ${tripDetails.startDate} to ${tripDetails.endDate}
👥 ${tripDetails.people} people
💰 ₹${tripDetails.budget.toLocaleString()} budget
    
Planned with Smart Trip Planner`;
    
    if (navigator.share) {
      navigator.share({
        title: `Trip to ${tripDetails.destination}`,
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Trip details copied to clipboard!');
    }
  };

  const downloadItinerary = () => {
    if (!tripDetails) return;
    
    // Create downloadable content
    let itineraryText = `🏖️ TRIP ITINERARY 🏖️\n\n`;
    itineraryText += `Destination: ${tripDetails.from} → ${tripDetails.destination}\n`;
    itineraryText += `Duration: ${tripDetails.days} days (${tripDetails.startDate} to ${tripDetails.endDate})\n`;
    itineraryText += `Travelers: ${tripDetails.people} people\n`;
    itineraryText += `Budget: ₹${tripDetails.budget.toLocaleString()}\n`;
    itineraryText += `Weather: ${tripDetails.weather.condition} - ${tripDetails.weather.temperature}°C\n\n`;
    
    tripDetails.plan.forEach((day, index) => {
      itineraryText += `📅 ${day.theme}\n`;
      itineraryText += `Date: ${new Date(day.date).toLocaleDateString()}\n`;
      
      if (day.hotel) {
        itineraryText += `🏨 Hotel: ${day.hotel.name} (${day.hotel.rating}⭐) - ₹${day.hotel.pricePerNight}/night\n`;
      }
      
      if (day.places.length > 0) {
        itineraryText += `Places to Visit:\n`;
        day.places.forEach((place, i) => {
          itineraryText += `  ${i + 1}. ${place.name} (${place.rating}⭐) - ₹${place.cost}\n`;
          itineraryText += `     📍 ${place.address}\n`;
          itineraryText += `     ⏰ ${place.visitDuration}\n`;
        });
      }
      
      if (day.activities.length > 0) {
        itineraryText += `Activities:\n`;
        day.activities.forEach((activity, i) => {
          itineraryText += `  • ${activity}\n`;
        });
      }
      
      itineraryText += `💰 Day Cost: ₹${day.totalCost > 0 ? day.totalCost.toLocaleString() : 'Included'}\n\n`;
    });
    
    // Download as text file
    const blob = new Blob([itineraryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripDetails.destination}_Itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Itinerary downloaded successfully!');
  };

  const navigateToMap = () => {
    const tripData = {
      from: tripDetails?.from,
      destination: tripDetails?.destination,
      plan: tripDetails?.plan,
      weather: tripDetails?.weather
    };
    
    localStorage.setItem('currentTripForMap', JSON.stringify(tripData));
    navigate('/realtime-map');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!tripDetails) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Not Found</h2>
        <p className="text-gray-600 mb-4">The trip you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const selectedDayDetails = tripDetails.plan.find(day => day.day === selectedDay);
  const totalActivitiesCost = tripDetails.plan.reduce((sum, day) => sum + day.totalCost, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={shareTrip}
            className="flex items-center px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button
            onClick={downloadItinerary}
            className="flex items-center px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          <button
            onClick={navigateToMap}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Navigation className="w-4 h-4 mr-2" />
            View on Map
          </button>
        </div>
      </div>

      {/* Trip Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {tripDetails.from} → {tripDetails.destination}
            </h1>
            <p className="text-indigo-100">
              {new Date(tripDetails.startDate).toLocaleDateString()} - {new Date(tripDetails.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-indigo-200 mb-1">Trip Status</div>
            <select
              value={tripDetails.status}
              onChange={(e) => updateTripStatus(e.target.value as 'planned' | 'ongoing' | 'completed')}
              className="bg-white/20 text-white rounded-lg px-3 py-1 text-sm"
            >
              <option value="planned">📋 Planned</option>
              <option value="ongoing">🚀 Ongoing</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="text-sm">Duration</span>
            </div>
            <div className="text-xl font-bold">{tripDetails.days} days</div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 mr-2" />
              <span className="text-sm">Travelers</span>
            </div>
            <div className="text-xl font-bold">{tripDetails.people} people</div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 mr-2" />
              <span className="text-sm">Total Budget</span>
            </div>
            <div className="text-xl font-bold">₹{tripDetails.budget.toLocaleString()}</div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Cloud className="w-5 h-5 mr-2" />
              <span className="text-sm">Weather</span>
            </div>
            <div className="text-xl font-bold">{tripDetails.weather.temperature}°C</div>
            <div className="text-sm text-indigo-200">{tripDetails.weather.condition}</div>
          </div>
        </div>
      </motion.div>

      {/* Day Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Select Day to View Details</h3>
        <div className="flex flex-wrap gap-2">
          {tripDetails.plan.map((day) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day.day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === day.day
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Day {day.day}
              {day.type === 'travel' && ' 🚗'}
              {day.type === 'explore' && ' 🎯'}
              {day.type === 'return' && ' 🏠'}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDayDetails && (
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedDayDetails.theme}</h2>
              <p className="text-gray-600">
                {new Date(selectedDayDetails.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Day Cost</div>
              <div className="text-xl font-bold text-indigo-600">
                ₹{selectedDayDetails.totalCost > 0 ? selectedDayDetails.totalCost.toLocaleString() : 'Included'}
              </div>
            </div>
          </div>

          {/* Hotel Information */}
          {selectedDayDetails.hotel && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex">
                  <Bed className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-bold text-blue-800 text-lg">{selectedDayDetails.hotel.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-blue-700">{selectedDayDetails.hotel.rating} rating</span>
                      <span className="ml-4 text-blue-600">₹{selectedDayDetails.hotel.pricePerNight}/night</span>
                    </div>
                    <p className="text-blue-600 text-sm mt-1">📍 {selectedDayDetails.hotel.address}</p>
                    <div className="mt-2">
                      <div className="text-sm text-blue-700 font-medium mb-1">Amenities:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedDayDetails.hotel.amenities.map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activities (for travel days) */}
          {selectedDayDetails.activities.length > 0 && (selectedDayDetails.type === 'travel' || selectedDayDetails.type === 'return') && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Day Activities</h3>
              <div className="space-y-3">
                {selectedDayDetails.activities.map((activity, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mr-4">{activity.split(' ')[0]}</div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {activity.substring(activity.indexOf(' ') + 1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Places to Visit (for exploration days) */}
          {selectedDayDetails.places.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Places to Visit ({selectedDayDetails.places.length} locations)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedDayDetails.places.map((place, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Place Image */}
                    {place.photos.length > 0 && (
                      <div className="relative">
                        <img 
                          src={place.photos[0]} 
                          alt={place.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(place.name)}`;
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                          ₹{place.cost}/person
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-800 text-lg leading-tight">{place.name}</h4>
                        <div className="flex items-center ml-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium ml-1">{place.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{place.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{place.visitDuration} • {place.bestTime}</span>
                        </div>
                        <div className="flex items-start text-gray-500">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{place.address}</span>
                        </div>
                        <div className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                          {place.category}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Trip Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Trip Budget Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-green-700 text-sm font-medium">Activities & Attractions</div>
            <div className="text-2xl font-bold text-green-800">₹{totalActivitiesCost.toLocaleString()}</div>
            <div className="text-green-600 text-sm">Entrance fees, tours, experiences</div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-blue-700 text-sm font-medium">Budget Utilized</div>
            <div className="text-2xl font-bold text-blue-800">
              {((totalActivitiesCost / tripDetails.budget) * 100).toFixed(1)}%
            </div>
            <div className="text-blue-600 text-sm">Of total budget</div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-purple-700 text-sm font-medium">Remaining Budget</div>
            <div className="text-2xl font-bold text-purple-800">
              ₹{(tripDetails.budget - totalActivitiesCost).toLocaleString()}
            </div>
            <div className="text-purple-600 text-sm">For food, transport, shopping</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/trip-planner')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
          >
            <Edit3 className="w-5 h-5 mr-2 text-gray-500" />
            <span className="text-gray-700">Plan New Trip</span>
          </button>
          
          <button
            onClick={navigateToMap}
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Navigation className="w-5 h-5 mr-2" />
            <span>View on Map</span>
          </button>
          
          <button
            onClick={shareTrip}
            className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Share2 className="w-5 h-5 mr-2" />
            <span>Share Trip</span>
          </button>
          
          <button
            onClick={downloadItinerary}
            className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;