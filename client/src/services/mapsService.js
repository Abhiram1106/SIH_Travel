const axios = require('axios');

class MapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  async getRoute(origin, destination, waypoints = []) {
    try {
      const waypointsStr = waypoints.length > 0 
        ? waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|')
        : '';
      
      const response = await axios.get(`${this.baseUrl}/directions/json`, {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          waypoints: waypointsStr,
          departure_time: 'now',
          traffic_model: 'best_guess',
          key: this.apiKey
        }
      });
      
      return this.processRouteData(response.data);
    } catch (error) {
      throw new Error(`Maps API error: ${error.message}`);
    }
  }

  async getPlacesNearby(location, type, radius = 5000) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, {
        params: {
          location: `${location.lat},${location.lng}`,
          radius,
          type,
          key: this.apiKey
        }
      });
      
      return response.data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        rating: place.rating,
        priceLevel: place.price_level,
        types: place.types,
        vicinity: place.vicinity
      }));
    } catch (error) {
      throw new Error(`Places API error: ${error.message}`);
    }
  }

  processRouteData(data) {
    if (data.status !== 'OK' || !data.routes.length) {
      throw new Error('No route found');
    }
    
    const route = data.routes;
    const leg = route.legs;
    
    return {
      distance: leg.distance,
      duration: leg.duration,
      durationInTraffic: leg.duration_in_traffic,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance,
        duration: step.duration,
        startLocation: step.start_location,
        endLocation: step.end_location
      })),
      polyline: route.overview_polyline.points,
      warnings: route.warnings || []
    };
  }

  async checkTrafficAlerts(route) {
    // Simulate traffic alert checking
    const alerts = [];
    
    if (route.durationInTraffic && route.duration) {
      const delay = route.durationInTraffic.value - route.duration.value;
      if (delay > 600) { // More than 10 minutes delay
        alerts.push({
          type: 'traffic_delay',
          message: `Heavy traffic expected. ${Math.round(delay/60)} minutes delay.`,
          severity: 'medium'
        });
      }
    }
    
    return alerts;
  }
}

module.exports = new MapsService();