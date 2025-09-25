import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  Camera, 
  Clock, 
  Users, 
  Compass,
  Filter,
  Heart,
  Share2,
  ChevronRight,
  Globe,
  Mountain,
  Plane,
  Building,
  Waves,
  TreePine
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  visitorsCount: string;
  bestTime: string;
  category: string;
  highlights: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface Attraction {
  id: string;
  name: string;
  description: string;
  images: string[];
  rating: number;
  reviews: number;
  category: string;
  visitDuration: string;
  entryFee: string;
  openingHours: string;
  bestTimeToVisit: string;
  tips: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface DestinationDetails {
  destination: Destination;
  attractions: Attraction[];
  totalAttractions: number;
}

const TopDestinations: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [attractionsLoading, setAttractionsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'All Destinations', icon: Globe },
    { id: 'city', name: 'Cities', icon: Building },
    { id: 'beach', name: 'Beaches', icon: Waves },
    { id: 'mountain', name: 'Mountains', icon: Mountain },
    { id: 'cultural', name: 'Cultural', icon: Compass },
    { id: 'adventure', name: 'Adventure', icon: TreePine }
  ];

  useEffect(() => {
    fetchTopDestinations();
    loadFavorites();
  }, []);

  const fetchTopDestinations = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/destinations/top');
      if (response.success && Array.isArray(response.data)) {
        setDestinations(response.data);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinationDetails = async (destinationId: string) => {
    try {
      setAttractionsLoading(true);
      const response = await apiService.get(`/destinations/${destinationId}/attractions`);
      if (response.success && response.data) {
        setSelectedDestination(response.data as DestinationDetails);
      }
    } catch (error) {
      console.error('Error fetching destination details:', error);
    } finally {
      setAttractionsLoading(false);
    }
  };

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('favoriteDestinations');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = (destinationId: string) => {
    const updatedFavorites = favorites.includes(destinationId)
      ? favorites.filter(id => id !== destinationId)
      : [...favorites, destinationId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favoriteDestinations', JSON.stringify(updatedFavorites));
  };

  const handleDestinationSelect = (destination: Destination) => {
    fetchDestinationDetails(destination.id);
  };

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || destination.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : Globe;
  };

  const shareDestination = (destination: Destination) => {
    if (navigator.share) {
      navigator.share({
        title: `Visit ${destination.name}`,
        text: destination.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(
        `Check out ${destination.name} - ${destination.description}`
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-gray-300 rounded-2xl"></div>
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
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gray-900">
          🌍 Top Destinations
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the world's most amazing places with detailed attraction guides, photos, and insider tips
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search destinations, cities, or countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        <div className="text-sm text-gray-600">
          Found {filteredDestinations.length} destinations
        </div>
      </motion.div>

      {!selectedDestination ? (
        /* Destinations Grid */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredDestinations.map((destination, index) => {
            const CategoryIcon = getCategoryIcon(destination.category);
            const isFavorite = favorites.includes(destination.id);

            return (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => handleDestinationSelect(destination)}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(destination.name)}`;
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-2">
                    <CategoryIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium capitalize">{destination.category}</span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(destination.id);
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-colors ${
                      isFavorite
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  {/* Rating */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold">{destination.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{destination.name}</h3>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{destination.country}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 line-clamp-2">{destination.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{destination.visitorsCount}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{destination.bestTime}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2">
                    {destination.highlights.slice(0, 2).map((highlight, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                    {destination.highlights.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{destination.highlights.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareDestination(destination);
                      }}
                      className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      <span className="text-sm">Share</span>
                    </button>
                    
                    <div className="flex items-center text-blue-600 font-medium">
                      <span className="text-sm">Explore</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Destination Details */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Back Button */}
          <button
            onClick={() => setSelectedDestination(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
            <span>Back to All Destinations</span>
          </button>

          {/* Destination Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-80">
              <img
                src={selectedDestination.destination.image}
                alt={selectedDestination.destination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h1 className="text-4xl font-bold mb-2">{selectedDestination.destination.name}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{selectedDestination.destination.country}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-400 fill-current" />
                    <span className="text-lg">{selectedDestination.destination.rating}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                {selectedDestination.destination.description}
              </p>
            </div>
          </div>

          {/* Attractions List */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                🎯 Top Attractions
                <span className="ml-3 text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {selectedDestination.totalAttractions} places
                </span>
              </h2>
            </div>

            {attractionsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-6">
                    <div className="h-32 w-48 bg-gray-300 rounded-xl"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {selectedDestination.attractions.map((attraction, index) => (
                  <motion.div
                    key={attraction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8 p-6 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow"
                  >
                    {/* Attraction Images */}
                    <div className="lg:w-1/3">
                      <div className="grid grid-cols-2 gap-2">
                        {attraction.images.slice(0, 4).map((image, imgIndex) => (
                          <div
                            key={imgIndex}
                            className={`relative overflow-hidden rounded-lg ${
                              imgIndex === 0 && attraction.images.length > 1
                                ? 'col-span-2 h-40'
                                : 'h-20'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${attraction.name} ${imgIndex + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodeURIComponent(attraction.name)}`;
                              }}
                            />
                            {imgIndex === 3 && attraction.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  +{attraction.images.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Attraction Details */}
                    <div className="lg:w-2/3 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {attraction.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                              <span>{attraction.rating}</span>
                              <span className="ml-1">({attraction.reviews} reviews)</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{attraction.visitDuration}</span>
                            </div>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          {attraction.category}
                        </span>
                      </div>

                      <p className="text-gray-700 leading-relaxed">
                        {attraction.description}
                      </p>

                      {/* Attraction Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Entry Fee</div>
                          <div className="text-gray-600">{attraction.entryFee}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Opening Hours</div>
                          <div className="text-gray-600">{attraction.openingHours}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Best Time</div>
                          <div className="text-gray-600">{attraction.bestTimeToVisit}</div>
                        </div>
                      </div>

                      {/* Tips */}
                      {attraction.tips.length > 0 && (
                        <div>
                          <div className="font-semibold text-gray-900 mb-2">💡 Insider Tips</div>
                          <div className="space-y-1">
                            {attraction.tips.slice(0, 2).map((tip, tipIndex) => (
                              <div key={tipIndex} className="flex items-start text-sm text-gray-600">
                                <span className="text-green-500 mr-2">•</span>
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredDestinations.length === 0 && !selectedDestination && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No destinations found</h3>
          <p className="text-gray-600 mb-8">
            Try adjusting your search criteria or browse different categories
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Show All Destinations
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default TopDestinations;