const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const weatherService = require('./services/weatherService');
const securityService = require('./services/securityService');
const mapsService = require('./services/mapsService');
const aiService = require('./services/aiService');
const NotificationService = require('./services/notificationService');
const Trip = require('./models/Trip'); // Assuming you have a Trip model

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize notification service
const notificationService = new NotificationService(server);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Trip planning endpoint
app.post('/api/plan-trip', async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, preferences } = req.body;
    
    // Get coordinates for destination
    const geocoding = await mapsService.geocodeAddress(destination);
    const { lat, lng } = geocoding;
    
    // Check weather conditions
    const weatherData = await weatherService.checkWeatherAlerts(lat, lng);
    const forecast = await weatherService.getWeatherForecast(lat, lng);
    
    // Check security threats
    const securityData = await securityService.checkSecurityThreats(
      geocoding.country, 
      geocoding.city
    );
    
    // If destination is not safe or weather is severe, suggest alternatives
    if (!securityData.isSafe || !weatherData.isSafe) {
      const alternatives = await aiService.suggestAlternativeDestination(
        destination,
        budget,
        geocoding.country,
        !securityData.isSafe ? 'security concerns' : 'severe weather conditions'
      );
      
      return res.json({
        success: false,
        reason: !securityData.isSafe ? 'security' : 'weather',
        originalDestination: destination,
        alternatives,
        securityData,
        weatherData
      });
    }
    
    // Generate AI-powered itinerary
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const itinerary = await aiService.generateItinerary(
      destination,
      days,
      budget,
      preferences,
      { alerts: weatherData.alerts },
      securityData
    );
    
    // Get nearby hotels
    const hotels = await mapsService.getPlacesNearby(
      { lat, lng },
      'lodging',
      5000
    );
    
    // Save trip to database
    const trip = new Trip({
      destination,
      startDate,
      endDate,
      budget,
      weather: { forecast, alerts: weatherData.alerts },
      security: securityData,
      itinerary: itinerary.dailyItinerary,
      hotels: itinerary.accommodationRecommendations
    });
    
    await trip.save();
    
    res.json({
      success: true,
      tripId: trip._id,
      itinerary,
      weatherData,
      securityData,
      hotels: itinerary.accommodationRecommendations,
      totalCost: itinerary.totalEstimatedCost
    });
    
  } catch (error) {
    console.error('Trip planning error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Real-time route optimization
app.post('/api/optimize-route', async (req, res) => {
  try {
    const { origin, destination, waypoints, tripId } = req.body;
    
    const route = await mapsService.getRoute(origin, destination, waypoints);
    const alerts = await mapsService.checkTrafficAlerts(route);
    
    if (alerts.length > 0) {
      // Notify connected users about traffic issues
      notificationService.sendTripAlert(tripId, {
        type: 'traffic',
        message: 'Traffic conditions have changed on your route.',
        alerts,
        suggestedAction: 'Consider alternative route'
      });
    }
    
    res.json({
      success: true,
      route,
      alerts
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Weather monitoring endpoint
app.get('/api/weather-monitor/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Get current weather for destination
    const geocoding = await mapsService.geocodeAddress(trip.destination);
    const weatherData = await weatherService.checkWeatherAlerts(
      geocoding.lat, 
      geocoding.lng
    );
    
    // If weather conditions have changed significantly, send alert
    if (!weatherData.isSafe) {
      notificationService.sendTripAlert(tripId, {
        type: 'weather',
        severity: 'high',
        message: 'Weather conditions have deteriorated at your destination.',
        alerts: weatherData.alerts,
        suggestedAction: 'Consider postponing outdoor activities'
      });
    }
    
    res.json({
      success: true,
      weatherData
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌟 Smart Travel AI server running on port ${PORT}`);
});
