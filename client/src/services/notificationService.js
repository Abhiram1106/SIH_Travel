const socketIo = require('socket.io');

class NotificationService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    
    this.connectedUsers = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      socket.on('join-trip', (tripId) => {
        socket.join(tripId);
        this.connectedUsers.set(socket.id, { tripId, socketId: socket.id });
      });
      
      socket.on('start-journey', (data) => {
        this.handleJourneyStart(socket, data);
      });
      
      socket.on('location-update', (data) => {
        this.handleLocationUpdate(socket, data);
      });
      
      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id);
        console.log('User disconnected:', socket.id);
      });
    });
  }

  handleJourneyStart(socket, data) {
    const { tripId } = data;
    // Start monitoring weather and security for the trip
    this.startRealTimeMonitoring(tripId);
    
    socket.emit('journey-started', {
      message: 'Journey tracking started. You will receive real-time updates.',
      timestamp: new Date()
    });
  }

  handleLocationUpdate(socket, data) {
    const { tripId, location } = data;
    // Check for nearby alerts or route changes
    this.checkLocationAlerts(tripId, location, socket);
  }

  async startRealTimeMonitoring(tripId) {
    // This would integrate with your monitoring systems
    const interval = setInterval(async () => {
      try {
        await this.checkForAlerts(tripId);
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    // Store interval ID for cleanup
    this.monitoringIntervals = this.monitoringIntervals || new Map();
    this.monitoringIntervals.set(tripId, interval);
  }

  async checkForAlerts(tripId) {
    // Implementation would check weather, security, and traffic APIs
    // and emit notifications when needed
    const alerts = await this.gatherAlerts(tripId);
    
    if (alerts.length > 0) {
      this.io.to(tripId).emit('travel-alert', {
        alerts,
        timestamp: new Date()
      });
    }
  }

  async gatherAlerts(tripId) {
    // This would integrate with your weather, security, and maps services
    const alerts = [];
    
    // Example alert structure
    if (Math.random() > 0.8) { // Simulate occasional alerts
      alerts.push({
        type: 'weather',
        severity: 'medium',
        message: 'Weather conditions changing. Consider indoor activities.',
        action: 'Show alternative indoor attractions'
      });
    }
    
    return alerts;
  }

  async checkLocationAlerts(tripId, location, socket) {
    // Check if user's current location has any immediate alerts
    const nearbyAlerts = await this.getNearbyAlerts(location);
    
    if (nearbyAlerts.length > 0) {
      socket.emit('location-alert', {
        alerts: nearbyAlerts,
        location,
        timestamp: new Date()
      });
    }
  }

  async getNearbyAlerts(location) {
    // Implementation would check for nearby incidents, construction, etc.
    return [];
  }

  sendTripAlert(tripId, alert) {
    this.io.to(tripId).emit('trip-alert', {
      ...alert,
      timestamp: new Date()
    });
  }

  sendEmergencyAlert(tripId, alert) {
    this.io.to(tripId).emit('emergency-alert', {
      ...alert,
      timestamp: new Date(),
      priority: 'high'
    });
  }
}

module.exports = NotificationService;