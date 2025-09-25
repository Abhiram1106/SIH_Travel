import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  Eye, 
  Thermometer, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  Search, 
  Loader,
  Umbrella,
  Gauge,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WeatherData {
  current: {
    location: string;
    country: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    feelsLike: number;
    icon: string;
    pressure: number;
    uvIndex: number;
    cloudCover: number;
  };
  forecast: {
    date: string;
    dayName: string;
    condition: string;
    high: number;
    low: number;
    humidity: number;
    windSpeed: number;
    rainChance: number;
    icon: string;
    description: string;
  }[];
  travelAdvice: {
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    message: string;
    recommendations: string[];
    score: number;
  };
}

interface WeatherProps {
  destination?: string;
  tripStartDate?: string;
  tripEndDate?: string;
}

const Weather: React.FC<WeatherProps> = ({ destination = '', tripStartDate, tripEndDate }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(destination);
  const [activeTab, setActiveTab] = useState<'current' | 'forecast' | 'advice'>('current');
  const [error, setError] = useState<string | null>(null);

  // Working OpenWeatherMap API Key
  const WEATHER_API_KEY = 'c888ef299fa05ccaf2ba38a6b485250a'; // Replace with your key

  useEffect(() => {
    if (destination && destination.trim().length > 0) {
      setLocation(destination);
      fetchWeatherData(destination);
    }
  }, [destination, tripStartDate]);

  // Fetch real weather data from OpenWeatherMap
  const fetchWeatherData = async (searchLocation: string) => {
    if (!searchLocation || searchLocation.trim().length < 2) {
      setError('Please enter a valid location name');
      toast.error('Location name too short');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🌤️ Fetching weather for:', searchLocation);
      
      // Fetch current weather and forecast from OpenWeatherMap
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchLocation)}&appid=${WEATHER_API_KEY}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(searchLocation)}&appid=${WEATHER_API_KEY}&units=metric`;

      console.log('API URLs:', { currentUrl, forecastUrl });

      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl)
      ]);

      console.log('Response status:', { 
        current: currentResponse.status, 
        forecast: forecastResponse.status 
      });

      if (!currentResponse.ok) {
        if (currentResponse.status === 404) {
          throw new Error(`Location "${searchLocation}" not found. Please check spelling or try different location.`);
        } else if (currentResponse.status === 401) {
          throw new Error('Weather API access denied. Please check API configuration.');
        } else {
          throw new Error(`Weather API error: ${currentResponse.status}`);
        }
      }

      if (!forecastResponse.ok) {
        console.warn('Forecast API failed, using current weather only');
      }

      const currentData = await currentResponse.json();
      const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;

      console.log('✅ Weather data received:', { currentData, forecastData });

      // Transform current weather data
      const transformedData: WeatherData = {
        current: {
          location: currentData.name,
          country: currentData.sys.country,
          temperature: Math.round(currentData.main.temp),
          condition: currentData.weather[0].main,
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind?.speed * 3.6 || 0), // m/s to km/h
          visibility: Math.round((currentData.visibility || 10000) / 1000), // meters to km
          feelsLike: Math.round(currentData.main.feels_like),
          icon: getWeatherEmoji(currentData.weather[0].main, currentData.weather[0].description),
          pressure: Math.round(currentData.main.pressure),
          uvIndex: 5, // Default UV index (not available in free API)
          cloudCover: currentData.clouds?.all || 0
        },
        forecast: forecastData ? processForecastData(forecastData) : [],
        travelAdvice: generateTravelAdvice(currentData, forecastData)
      };

      setWeatherData(transformedData);
      setLocation(`${currentData.name}, ${currentData.sys.country}`);
      toast.success(`✅ Weather loaded for ${currentData.name}`);

    } catch (error: any) {
      console.error('❌ Weather fetch error:', error);
      const errorMessage = error.message || 'Failed to fetch weather data. Please try again.';
      setError(errorMessage);
      setWeatherData(null);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Process 5-day forecast data
  const processForecastData = (forecastData: any) => {
    const dailyForecasts: any[] = [];
    const processedDates = new Set();

    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toDateString();
      
      if (!processedDates.has(dateStr) && dailyForecasts.length < 7) {
        processedDates.add(dateStr);
        
        dailyForecasts.push({
          date: date.toISOString().split('T')[0],
          dayName: dailyForecasts.length === 0 ? 'Today' : 
                   dailyForecasts.length === 1 ? 'Tomorrow' : 
                   date.toLocaleDateString('en-US', { weekday: 'long' }),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind?.speed * 3.6 || 0),
          rainChance: Math.round((item.pop || 0) * 100),
          icon: getWeatherEmoji(item.weather[0].main, item.weather[0].description)
        });
      }
    });

    return dailyForecasts;
  };

  // Convert weather conditions to emojis
  const getWeatherEmoji = (main: string, description: string): string => {
    const mainLower = main.toLowerCase();
    const descLower = description.toLowerCase();

    if (mainLower.includes('clear')) return '☀️';
    if (mainLower.includes('cloud')) {
      if (descLower.includes('few')) return '🌤️';
      if (descLower.includes('scattered')) return '⛅';
      return '☁️';
    }
    if (mainLower.includes('rain')) {
      if (descLower.includes('light')) return '🌦️';
      if (descLower.includes('heavy')) return '🌧️';
      return '🌧️';
    }
    if (mainLower.includes('thunder')) return '⛈️';
    if (mainLower.includes('snow')) return '🌨️';
    if (mainLower.includes('mist') || mainLower.includes('fog')) return '🌫️';
    if (mainLower.includes('drizzle')) return '🌦️';
    
    return '🌤️';
  };

  // Generate travel advice
  const generateTravelAdvice = (currentData: any, forecastData: any) => {
    const temp = currentData.main.temp;
    const condition = currentData.weather[0].main.toLowerCase();
    const humidity = currentData.main.humidity;
    const windSpeed = currentData.wind?.speed * 3.6 || 0;

    let score = 100;
    let rating: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    let message = '';
    let recommendations: string[] = [];

    // Temperature scoring
    if (temp < 0 || temp > 40) score -= 30;
    else if (temp < 5 || temp > 35) score -= 20;
    else if (temp < 10 || temp > 30) score -= 10;

    // Weather condition scoring
    if (condition.includes('storm') || condition.includes('severe')) score -= 40;
    else if (condition.includes('rain') || condition.includes('snow')) score -= 25;
    else if (condition.includes('cloud')) score -= 10;

    // Wind scoring
    if (windSpeed > 50) score -= 25;
    else if (windSpeed > 30) score -= 15;
    else if (windSpeed > 20) score -= 5;

    // Humidity scoring
    if (humidity > 90) score -= 10;
    else if (humidity < 20) score -= 10;

    // Determine rating
    if (score >= 80) {
      rating = 'excellent';
      message = `Perfect weather conditions! ${Math.round(temp)}°C with ${condition} conditions.`;
      recommendations = [
        '🌞 Excellent conditions for all outdoor activities',
        '👕 Comfortable clothing recommended',
        '📸 Great weather for photography and sightseeing',
        '🚶‍♂️ Perfect for walking tours and exploration',
        '🕶️ Don\'t forget sunglasses and sunscreen'
      ];
    } else if (score >= 60) {
      rating = 'good';
      message = `Good travel weather with ${Math.round(temp)}°C and ${condition} conditions.`;
      recommendations = [
        '🧥 Pack layers for temperature changes',
        '☂️ Light rain gear recommended as backup',
        '👟 Comfortable walking shoes essential',
        '🌤️ Most outdoor activities will be enjoyable',
        '📱 Check weather updates regularly'
      ];
    } else if (score >= 40) {
      rating = 'fair';
      message = `Fair weather conditions. ${Math.round(temp)}°C with ${condition} - plan accordingly.`;
      recommendations = [
        '🧥 Weather-appropriate clothing essential',
        '🏠 Have indoor activity alternatives ready',
        '☔ Waterproof gear highly recommended',
        '🌡️ Monitor temperature changes closely',
        '📅 Flexible itinerary advised'
      ];
    } else {
      rating = 'poor';
      message = `Challenging weather: ${Math.round(temp)}°C with ${condition}. Consider postponing outdoor activities.`;
      recommendations = [
        '❌ Avoid outdoor activities if possible',
        '🏨 Focus on indoor attractions and activities',
        '🧥 Heavy weather-protective clothing required',
        '📱 Monitor weather alerts and warnings',
        '🔄 Consider rescheduling trip if possible'
      ];
    }

    return { rating, message, recommendations, score: Math.max(0, score) };
  };

  const handleLocationSearch = () => {
    const trimmedLocation = location.trim();
    if (trimmedLocation.length < 2) {
      setError('Please enter at least 2 characters');
      toast.error('Location name too short');
      return;
    }
    
    fetchWeatherData(trimmedLocation);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLocationSearch();
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'fair': return 'bg-yellow-500 text-white';
      case 'poor': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRatingBorder = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'border-green-200 bg-green-50';
      case 'good': return 'border-blue-200 bg-blue-50';
      case 'fair': return 'border-yellow-200 bg-yellow-50';
      case 'poor': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Cloud className="w-16 h-16 text-blue-500" />
            </motion.div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Fetching Real Weather Data</h3>
              <p className="text-gray-600">Getting live weather information for {location}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl shadow-2xl p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-3 flex items-center">
              <Cloud className="w-10 h-10 mr-4" />
              Live Weather Forecast
            </h1>
            <p className="text-blue-100 text-lg">
              Get accurate, real-time weather data for any location worldwide
            </p>
          </div>
          
          <div className="flex flex-col items-end space-y-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MapPin className="w-5 h-5 text-gray-300 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter city name (e.g., Mumbai, New York, Tokyo)"
                  className="pl-12 pr-6 py-3 text-gray-800 border-0 rounded-xl focus:ring-4 focus:ring-white/30 w-96 text-lg"
                />
              </div>
              <button
                onClick={handleLocationSearch}
                disabled={loading}
                className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors flex items-center disabled:opacity-50 text-lg font-semibold"
              >
                {loading ? (
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 mr-2" />
                )}
                Get Weather
              </button>
            </div>
            <div className="text-blue-200 text-sm">
              ✨ Real-time data • 7-day forecast • Travel advice
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/20 border border-red-300 rounded-xl flex items-center"
          >
            <AlertCircle className="w-6 h-6 text-red-300 mr-3" />
            <span className="text-red-100">{error}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Weather Data Display */}
      {weatherData && !error && (
        <>
          {/* Weather Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex border-b-2">
              {[
                { id: 'current', label: 'Current Weather', icon: <Thermometer className="w-5 h-5" /> },
                { id: 'forecast', label: '7-Day Forecast', icon: <Calendar className="w-5 h-5" /> },
                { id: 'advice', label: 'Travel Advice', icon: <MapPin className="w-5 h-5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-8 py-6 flex items-center justify-center space-x-3 transition-all text-lg font-semibold ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-b-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* Current Weather Tab */}
              {activeTab === 'current' && (
                <div className="space-y-8">
                  {/* Main Weather Display */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Primary Weather Info */}
                    <div className="lg:col-span-2">
                      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white rounded-2xl p-8 h-full">
                        <div className="flex items-center justify-between h-full">
                          <div className="space-y-4">
                            <div>
                              <h2 className="text-3xl font-bold">{weatherData.current.location}</h2>
                              <p className="text-blue-100 text-lg">{weatherData.current.country}</p>
                              <p className="text-blue-200">{new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</p>
                            </div>
                            <div className="flex items-center space-x-6">
                              <span className="text-7xl font-light">{weatherData.current.temperature}°C</span>
                              <div>
                                <p className="text-2xl font-semibold">{weatherData.current.condition}</p>
                                <p className="text-blue-200 text-lg">Feels like {weatherData.current.feelsLike}°C</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-8xl">{weatherData.current.icon}</div>
                        </div>
                      </div>
                    </div>

                    {/* Weather Details */}
                    <div className="space-y-4">
                      {[
                        { 
                          icon: <Droplets className="w-6 h-6 text-blue-500" />, 
                          label: 'Humidity', 
                          value: `${weatherData.current.humidity}%`,
                          bg: 'bg-blue-50'
                        },
                        { 
                          icon: <Wind className="w-6 h-6 text-green-500" />, 
                          label: 'Wind Speed', 
                          value: `${weatherData.current.windSpeed} km/h`,
                          bg: 'bg-green-50'
                        },
                        { 
                          icon: <Eye className="w-6 h-6 text-purple-500" />, 
                          label: 'Visibility', 
                          value: `${weatherData.current.visibility} km`,
                          bg: 'bg-purple-50'
                        },
                        { 
                          icon: <Gauge className="w-6 h-6 text-orange-500" />, 
                          label: 'Pressure', 
                          value: `${weatherData.current.pressure} hPa`,
                          bg: 'bg-orange-50'
                        },
                        { 
                          icon: <Cloud className="w-6 h-6 text-gray-500" />, 
                          label: 'Cloud Cover', 
                          value: `${weatherData.current.cloudCover}%`,
                          bg: 'bg-gray-50'
                        }
                      ].map((item, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`${item.bg} rounded-xl p-6 border-l-4 border-l-current`}
                        >
                          <div className="flex items-center space-x-4">
                            {item.icon}
                            <div>
                              <p className="text-gray-600 font-medium">{item.label}</p>
                              <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 7-Day Forecast Tab */}
              {activeTab === 'forecast' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Calendar className="w-7 h-7 mr-3 text-blue-600" />
                    7-Day Weather Forecast
                  </h3>
                  <div className="grid gap-4">
                    {weatherData.forecast.map((day, index) => (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                          {/* Day & Weather */}
                          <div className="flex items-center space-x-4">
                            <div className="text-5xl">{day.icon}</div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-800">{day.dayName}</h4>
                              <p className="text-gray-600 capitalize">{day.description}</p>
                            </div>
                          </div>

                          {/* Temperature */}
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-3xl font-bold text-gray-800">{day.high}°</span>
                              <span className="text-xl text-gray-500">/ {day.low}°</span>
                            </div>
                            <p className="text-sm text-gray-600">High / Low</p>
                          </div>

                          {/* Weather Stats */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-100 rounded-lg p-3">
                              <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                              <p className="text-sm font-semibold text-blue-800">{day.humidity}%</p>
                              <p className="text-xs text-blue-600">Humidity</p>
                            </div>
                            <div className="bg-green-100 rounded-lg p-3">
                              <Wind className="w-5 h-5 text-green-600 mx-auto mb-1" />
                              <p className="text-sm font-semibold text-green-800">{day.windSpeed} km/h</p>
                              <p className="text-xs text-green-600">Wind</p>
                            </div>
                            <div className="bg-purple-100 rounded-lg p-3">
                              <Umbrella className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                              <p className="text-sm font-semibold text-purple-800">{day.rainChance}%</p>
                              <p className="text-xs text-purple-600">Rain</p>
                            </div>
                          </div>

                          {/* Rain Alert */}
                          <div className="flex items-center justify-end">
                            {day.rainChance > 50 ? (
                              <div className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full text-sm">
                                <CloudRain className="w-4 h-4 mr-2" />
                                Rain Likely
                              </div>
                            ) : day.rainChance > 20 ? (
                              <div className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-full text-sm">
                                <Cloud className="w-4 h-4 mr-2" />
                                Possible Rain
                              </div>
                            ) : (
                              <div className="flex items-center bg-green-500 text-white px-4 py-2 rounded-full text-sm">
                                <Sun className="w-4 h-4 mr-2" />
                                Clear
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Advice Tab */}
              {activeTab === 'advice' && (
                <div className="space-y-8">
                  {/* Weather Rating */}
                  <div className={`rounded-2xl p-8 border-2 ${getRatingBorder(weatherData.travelAdvice.rating)}`}>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`rounded-full p-4 ${getRatingColor(weatherData.travelAdvice.rating)}`}>
                        <div className="text-3xl">
                          {weatherData.travelAdvice.rating === 'excellent' && '🌟'}
                          {weatherData.travelAdvice.rating === 'good' && '👍'}
                          {weatherData.travelAdvice.rating === 'fair' && '⚠️'}
                          {weatherData.travelAdvice.rating === 'poor' && '❌'}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 capitalize">
                          {weatherData.travelAdvice.rating} Weather Conditions
                        </h3>
                        <p className="text-gray-600 text-lg">{weatherData.travelAdvice.message}</p>
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Travel Score:</span>
                            <div className="bg-gray-200 rounded-full w-32 h-3">
                              <div 
                                className={`h-3 rounded-full ${getRatingColor(weatherData.travelAdvice.rating)}`}
                                style={{ width: `${weatherData.travelAdvice.score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold">{weatherData.travelAdvice.score}/100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                    <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <Activity className="w-6 h-6 mr-3 text-blue-600" />
                      Travel Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {weatherData.travelAdvice.recommendations.map((rec, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                        >
                          <div className="bg-green-500 rounded-full p-1 mt-0.5">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-gray-700 font-medium">{rec}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Default State */}
      {!weatherData && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center"
        >
          <div className="text-6xl mb-6">🌍</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Weather Anywhere in the World</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Enter any city, town, or location worldwide to get accurate, real-time weather data with detailed forecasts and travel recommendations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              { icon: '🌡️', title: 'Real-time Data', desc: 'Live temperature & conditions' },
              { icon: '📅', title: '7-Day Forecast', desc: 'Extended weather outlook' },
              { icon: '✈️', title: 'Travel Advice', desc: 'Smart recommendations' },
              { icon: '🌍', title: 'Global Coverage', desc: 'Any location worldwide' }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Weather;