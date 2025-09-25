const axios = require('axios');

// Get comprehensive weather data with forecast and travel advisories
const getWeather = async (req, res) => {
  try {
    const { location } = req.params;
    console.log(`🌤️ Fetching weather data for ${location}...`);

    let weatherData;

    if (process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== 'your-openweather-api-key') {
      // Real OpenWeatherMap API integration
      try {
        const [currentResponse, forecastResponse] = await Promise.all([
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`),
          axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`)
        ]);

        const current = currentResponse.data;
        const forecast = forecastResponse.data;

        weatherData = {
          location: current.name,
          country: current.sys.country,
          temperature: Math.round(current.main.temp),
          feelsLike: Math.round(current.main.feels_like),
          condition: current.weather[0].main,
          description: current.weather[0].description,
          humidity: current.main.humidity,
          windSpeed: Math.round(current.wind.speed * 3.6), // Convert m/s to km/h
          pressure: current.main.pressure,
          visibility: Math.round(current.visibility / 1000), // Convert to km
          uvIndex: 5, // OpenWeather free tier doesn't include UV
          sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString(),
          sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString(),
          forecast: forecast.list.slice(0, 7).map(item => ({
            date: new Date(item.dt * 1000),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            condition: item.weather[0].main,
            description: item.weather[0].description,
            humidity: item.main.humidity,
            windSpeed: Math.round(item.wind.speed * 3.6),
            precipitation: item.rain ? item.rain['3h'] || 0 : 0
          }))
        };
      } catch (apiError) {
        console.log('OpenWeather API failed, using enhanced mock data');
        throw new Error('API_FALLBACK');
      }
    } else {
      throw new Error('NO_API_KEY');
    }

    // Add travel advisories and recommendations
    weatherData.travelAdvisory = generateTravelAdvisory(weatherData);
    weatherData.clothingRecommendations = getClothingRecommendations(weatherData);
    weatherData.activitySuggestions = getActivitySuggestions(weatherData);

    res.json({
      success: true,
      data: weatherData,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.log('Using enhanced mock weather data...');

    // Enhanced mock weather data with realistic patterns
    const mockWeatherData = generateEnhancedMockWeather(location);

    res.json({
      success: true,
      data: mockWeatherData,
      lastUpdated: new Date().toISOString(),
      source: 'demo_data'
    });
  }
};

// Generate enhanced mock weather data
const generateEnhancedMockWeather = (location) => {
  const baseTemp = Math.floor(Math.random() * 20) + 15; // 15-35°C range
  const conditions = ['Clear', 'Clouds', 'Rain', 'Thunderstorm', 'Mist'];
  const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];

  const mockData = {
    location: location,
    country: 'Demo',
    temperature: baseTemp,
    feelsLike: baseTemp + Math.floor(Math.random() * 6) - 3,
    condition: currentCondition,
    description: getWeatherDescription(currentCondition),
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
    pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
    visibility: Math.floor(Math.random() * 8) + 5, // 5-13 km
    uvIndex: Math.floor(Math.random() * 8) + 1, // 1-8
    sunrise: '06:30',
    sunset: '18:45',
    forecast: Array.from({length: 7}, (_, i) => {
      const dayTemp = baseTemp + Math.floor(Math.random() * 10) - 5;
      const dayCondition = conditions[Math.floor(Math.random() * conditions.length)];
      return {
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        high: dayTemp + Math.floor(Math.random() * 5),
        low: dayTemp - Math.floor(Math.random() * 8),
        condition: dayCondition,
        description: getWeatherDescription(dayCondition),
        humidity: Math.floor(Math.random() * 30) + 50,
        windSpeed: Math.floor(Math.random() * 15) + 8,
        precipitation: dayCondition === 'Rain' ? Math.floor(Math.random() * 10) + 1 : 0
      };
    })
  };

  // Add travel advisories and recommendations
  mockData.travelAdvisory = generateTravelAdvisory(mockData);
  mockData.clothingRecommendations = getClothingRecommendations(mockData);
  mockData.activitySuggestions = getActivitySuggestions(mockData);

  return mockData;
};

const getWeatherDescription = (condition) => {
  const descriptions = {
    'Clear': 'clear sky',
    'Clouds': 'scattered clouds',
    'Rain': 'moderate rain',
    'Thunderstorm': 'thunderstorm with rain',
    'Mist': 'mist'
  };
  return descriptions[condition] || 'partly cloudy';
};

// Generate travel advisory based on weather conditions
const generateTravelAdvisory = (weather) => {
  const advisories = [];

  if (weather.temperature > 30) {
    advisories.push({
      type: 'heat',
      level: 'warning',
      message: 'High temperatures expected. Stay hydrated and seek shade during midday.',
      icon: '🌡️'
    });
  }

  if (weather.temperature < 5) {
    advisories.push({
      type: 'cold',
      level: 'warning',  
      message: 'Cold weather conditions. Dress warmly and protect exposed skin.',
      icon: '❄️'
    });
  }

  const rainDays = weather.forecast.filter(day => day.condition === 'Rain').length;
  if (rainDays >= 3) {
    advisories.push({
      type: 'rain',
      level: 'info',
      message: `Rain expected for ${rainDays} days. Pack waterproof gear and plan indoor activities.`,
      icon: '🌧️'
    });
  }

  if (weather.windSpeed > 25) {
    advisories.push({
      type: 'wind',
      level: 'caution',
      message: 'Strong winds expected. Secure loose items and be cautious outdoors.',
      icon: '💨'
    });
  }

  if (weather.humidity > 80) {
    advisories.push({
      type: 'humidity',
      level: 'info',
      message: 'High humidity levels. Light, breathable clothing recommended.',
      icon: '💧'
    });
  }

  if (advisories.length === 0) {
    advisories.push({
      type: 'good',
      level: 'positive',
      message: 'Great weather conditions for outdoor activities and sightseeing!',
      icon: '☀️'
    });
  }

  return advisories;
};

// Get clothing recommendations based on weather
const getClothingRecommendations = (weather) => {
  const recommendations = [];

  if (weather.temperature > 25) {
    recommendations.push('Light, breathable fabrics', 'Sun hat', 'Sunglasses', 'Sunscreen', 'Comfortable sandals');
  } else if (weather.temperature > 15) {
    recommendations.push('Light layers', 'Comfortable walking shoes', 'Light jacket for evenings', 'Long pants');
  } else {
    recommendations.push('Warm layers', 'Insulated jacket', 'Warm hat and gloves', 'Waterproof shoes', 'Thermal underwear');
  }

  if (weather.forecast.some(day => day.condition === 'Rain')) {
    recommendations.push('Waterproof jacket', 'Umbrella', 'Water-resistant shoes');
  }

  if (weather.windSpeed > 20) {
    recommendations.push('Windbreaker', 'Secure hat or avoid loose items');
  }

  return recommendations;
};

// Get activity suggestions based on weather
const getActivitySuggestions = (weather) => {
  const indoor = ['Visit museums', 'Explore shopping centers', 'Try local cafes', 'Indoor entertainment', 'Spa and wellness'];
  const outdoor = ['Walking tours', 'Outdoor photography', 'Park visits', 'Street food exploration', 'Architectural sightseeing'];
  const adventure = ['Hiking', 'Cycling', 'Water sports', 'Beach activities', 'Outdoor markets'];

  const suggestions = {
    recommended: [],
    alternative: [],
    avoid: []
  };

  if (weather.condition === 'Clear' && weather.temperature >= 20 && weather.temperature <= 28) {
    suggestions.recommended = [...outdoor, ...adventure];
    suggestions.alternative = indoor;
  } else if (weather.condition === 'Rain' || weather.condition === 'Thunderstorm') {
    suggestions.recommended = indoor;
    suggestions.alternative = ['Covered markets', 'Indoor attractions', 'Transportation sightseeing'];
    suggestions.avoid = ['Beach activities', 'Hiking', 'Outdoor photography'];
  } else if (weather.temperature > 30) {
    suggestions.recommended = [...indoor, 'Early morning activities', 'Evening strolls'];
    suggestions.alternative = ['Air-conditioned venues', 'Water activities', 'Shaded areas'];
    suggestions.avoid = ['Midday outdoor activities', 'Strenuous hiking'];
  } else if (weather.temperature < 10) {
    suggestions.recommended = [...indoor, 'Hot drinks tour', 'Heated attractions'];
    suggestions.alternative = ['Quick outdoor sightseeing', 'Warm clothing shopping'];
    suggestions.avoid = ['Long outdoor activities', 'Water sports'];
  } else {
    suggestions.recommended = [...outdoor];
    suggestions.alternative = [...indoor];
  }

  return suggestions;
};

// Get weather alerts for travel planning
const getWeatherAlerts = async (req, res) => {
  try {
    const { location, startDate, endDate } = req.body;

    // Mock weather alerts (in real app, integrate with weather alert APIs)
    const alerts = [];

    // Generate relevant alerts based on season and location
    const start = new Date(startDate);
    const month = start.getMonth();

    if (month >= 5 && month <= 8) { // Summer months
      if (Math.random() > 0.7) {
        alerts.push({
          type: 'heat_wave',
          severity: 'moderate',
          title: 'Heat Wave Warning',
          description: 'Temperatures may exceed 35°C during your visit period',
          startDate: startDate,
          endDate: endDate,
          recommendations: [
            'Plan indoor activities during midday',
            'Stay hydrated',
            'Wear light-colored, loose-fitting clothes'
          ]
        });
      }
    }

    if (month >= 11 || month <= 2) { // Winter months
      if (Math.random() > 0.6) {
        alerts.push({
          type: 'cold_snap',
          severity: 'moderate',
          title: 'Cold Weather Alert',
          description: 'Unusually cold temperatures expected',
          startDate: startDate,
          endDate: endDate,
          recommendations: [
            'Pack warm winter clothing',
            'Check heating in accommodations',
            'Plan shorter outdoor activities'
          ]
        });
      }
    }

    res.json({
      success: true,
      data: {
        location,
        alerts,
        period: { startDate, endDate },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Weather alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weather alerts',
      error: error.message
    });
  }
};

module.exports = {
  getWeather,
  getWeatherAlerts
};