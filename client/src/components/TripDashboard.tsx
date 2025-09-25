import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus,
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Star,
  Clock,
  Plane,
  Navigation,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Search,
  TrendingUp,
  Cloud,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TripData {
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

interface DayPlan {
  day: number;
  date: string;
  theme: string;
  type: 'travel' | 'explore' | 'return';
  places: any[];
  hotel?: any;
  totalCost: number;
  weather: WeatherData;
  activities: string[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'ongoing' | 'completed'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = () => {
    try {
      const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      // Sort by creation date (newest first)
      const sortedTrips = savedTrips.sort((a: TripData, b: TripData) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTrips(sortedTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = (id: number) => {
    try {
      const updatedTrips = trips.filter(trip => trip.id !== id);
      setTrips(updatedTrips);
      localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
      toast.success('Trip deleted successfully');
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  const updateTripStatus = (id: number, newStatus: 'planned' | 'ongoing' | 'completed') => {
    try {
      const updatedTrips = trips.map(trip => 
        trip.id === id ? { ...trip, status: newStatus } : trip
      );
      setTrips(updatedTrips);
      localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
      toast.success(`Trip status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating trip status:', error);
      toast.error('Failed to update trip status');
    }
  };

  // Filter trips based on search and status
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.from.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: trips.length,
    planned: trips.filter(t => t.status === 'planned').length,
    ongoing: trips.filter(t => t.status === 'ongoing').length,
    completed: trips.filter(t => t.status === 'completed').length,
    totalBudget: trips.reduce((sum, trip) => sum + trip.budget, 0),
    totalDays: trips.reduce((sum, trip) => sum + trip.days, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Calendar className="w-4 h-4" />;
      case 'ongoing': return <PlayCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Travel Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and track all your trips in one place</p>
        </div>
        <button
          onClick={() => navigate('/trip-planner')}
          className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Plan New Trip
        </button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-gray-600 text-sm">Total Trips</div>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Plane className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.ongoing}</div>
              <div className="text-gray-600 text-sm">Active Trips</div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <PlayCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">₹{(stats.totalBudget / 1000).toFixed(0)}K</div>
              <div className="text-gray-600 text-sm">Total Budget</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalDays}</div>
              <div className="text-gray-600 text-sm">Total Days</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips by destination or origin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="planned">Planned</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredTrips.length} of {trips.length} trips
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-16"
        >
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {trips.length === 0 ? 'No trips planned yet' : 'No trips match your search'}
          </h3>
          <p className="text-gray-500 mb-6">
            {trips.length === 0 
              ? 'Start planning your first amazing trip!'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {trips.length === 0 && (
            <button
              onClick={() => navigate('/trip-planner')}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Plan Your First Trip
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Trip Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {trip.from} → {trip.destination}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(trip.status)}`}>
                    {getStatusIcon(trip.status)}
                    <span className="capitalize">{trip.status}</span>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{trip.days} days</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{trip.people} people</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>₹{(trip.budget / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Cloud className="w-4 h-4 mr-2" />
                    <span>{trip.weather.temperature}°C</span>
                  </div>
                </div>

                {/* Places Preview */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Places to visit:</div>
                  <div className="flex flex-wrap gap-1">
                    {trip.plan
                      .flatMap(day => day.places)
                      .slice(0, 3)
                      .map((place, i) => (
                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                          {place.name}
                        </span>
                      ))
                    }
                    {trip.plan.flatMap(day => day.places).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{trip.plan.flatMap(day => day.places).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trip Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Created {new Date(trip.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/trip-details/${trip.id}`)}
                      className="p-2 text-gray-600 hover:bg-white hover:text-indigo-600 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {trip.status === 'planned' && (
                      <button
                        onClick={() => updateTripStatus(trip.id, 'ongoing')}
                        className="p-2 text-gray-600 hover:bg-white hover:text-green-600 rounded-lg transition-colors"
                        title="Start Trip"
                      >
                        <PlayCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    {trip.status === 'ongoing' && (
                      <button
                        onClick={() => updateTripStatus(trip.id, 'completed')}
                        className="p-2 text-gray-600 hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
                        title="Complete Trip"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        const tripData = {
                          from: trip.from,
                          destination: trip.destination,
                          plan: trip.plan,
                          weather: trip.weather
                        };
                        localStorage.setItem('currentTripForMap', JSON.stringify(tripData));
                        navigate('/realtime-map');
                      }}
                      className="p-2 text-gray-600 hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
                      title="View on Map"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteModal(trip.id)}
                      className="p-2 text-gray-600 hover:bg-white hover:text-red-600 rounded-lg transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Trip</h3>
                <p className="text-gray-600 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this trip? All trip data including itinerary, places, and hotels will be permanently removed.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTrip(showDeleteModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Trip
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Travel Summary</h3>
            <p className="text-indigo-100">
              You've planned {stats.total} trips covering {stats.totalDays} days with a total budget of ₹{(stats.totalBudget / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.planned}</div>
              <div className="text-indigo-200 text-sm">Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.ongoing}</div>
              <div className="text-indigo-200 text-sm">Ongoing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-indigo-200 text-sm">Completed</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default Dashboard;