const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http'); // Added for Socket.IO
const { Server } = require('socket.io'); // Added Socket.IO

// Load environment variables FIRST
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('🔍 Environment Check:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'NOT FOUND');
console.log('CLIENT_URL:', process.env.CLIENT_URL);

// Import database connection
const connectDB = require('./config/database');

// Import all route files
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const translatorRoutes = require('./routes/translatorRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Import error handling middleware
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB(process.env.MONGODB_URI);


// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting - more generous for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS - Configure for development and production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware with increased limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON format'
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Request logging middleware for development
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes - Organized by functionality
console.log('📡 Setting up API routes...');

// Core functionality
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);

// AI-powered features
app.use('/api/ai', aiRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Booking and travel services
app.use('/api/booking', bookingRoutes);
app.use('/api/weather', weatherRoutes);

// Utility services
app.use('/api/currency', currencyRoutes);
app.use('/api/translator', translatorRoutes);

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Handle user joining a trip room
  socket.on('join-trip', (tripId) => {
    console.log(`📍 User ${socket.id} joined trip: ${tripId}`);
    socket.join(`trip-${tripId}`);
    socket.emit('trip-joined', { tripId, message: 'Successfully joined trip room' });
  });

  // Handle starting journey monitoring
  socket.on('start-journey', (data) => {
    const { tripId } = data;
    console.log(`🚀 Journey started for trip: ${tripId}`);
    socket.to(`trip-${tripId}`).emit('journey-started', {
      message: 'Journey monitoring has started',
      timestamp: new Date().toISOString(),
      tripId
    });
  });

  // Handle stopping journey monitoring
  socket.on('stop-journey', (data) => {
    const { tripId } = data;
    console.log(`🛑 Journey stopped for trip: ${tripId}`);
    socket.to(`trip-${tripId}`).emit('journey-stopped', {
      message: 'Journey monitoring has stopped',
      timestamp: new Date().toISOString(),
      tripId
    });
  });

  // Handle real-time location updates
  socket.on('location-update', (data) => {
    const { tripId, location } = data;
    console.log(`📍 Location update for trip ${tripId}:`, location);
    
    // Broadcast location update to other users in the same trip
    socket.to(`trip-${tripId}`).emit('location-update', {
      location,
      timestamp: new Date().toISOString(),
      tripId
    });

    // Simulate location-based alerts (you can replace with real logic)
    if (location.lat && location.lng) {
      // Example: Alert for specific coordinates (you can customize this)
      const alerts = [
        {
          type: 'weather',
          message: 'Light rain expected in your area in 30 minutes',
          severity: 'medium',
          timestamp: new Date().toISOString()
        }
      ];

      socket.emit('location-alert', { alerts, location });
    }
  });

  // Handle starting real-time monitoring
  socket.on('start-monitoring', (data) => {
    const { tripId } = data;
    console.log(`📊 Real-time monitoring started for trip: ${tripId}`);
    socket.join(`monitoring-${tripId}`);
    
    // Simulate sending periodic updates (replace with real monitoring logic)
    const monitoringInterval = setInterval(() => {
      // Send weather updates
      socket.emit('weather-update', {
        type: 'weather',
        message: 'Weather conditions are favorable',
        severity: 'low',
        timestamp: new Date().toISOString()
      });

      // Send security updates
      socket.emit('security-update', {
        type: 'security',
        message: 'Security level: LOW - Area is safe',
        severity: 'low',
        timestamp: new Date().toISOString()
      });
    }, 60000); // Send updates every minute

    // Store interval ID to clear it later
    socket.monitoringInterval = monitoringInterval;
  });

  // Handle stopping real-time monitoring
  socket.on('stop-monitoring', (data) => {
    const { tripId } = data;
    console.log(`📊 Real-time monitoring stopped for trip: ${tripId}`);
    
    // Clear monitoring interval
    if (socket.monitoringInterval) {
      clearInterval(socket.monitoringInterval);
      socket.monitoringInterval = null;
    }
    
    socket.leave(`monitoring-${tripId}`);
  });

  // Handle travel alerts
  socket.on('send-travel-alert', (data) => {
    const { tripId, alertType, message, severity } = data;
    console.log(`🚨 Travel alert for trip ${tripId}: ${message}`);
    
    // Broadcast alert to all users in the trip
    io.to(`trip-${tripId}`).emit('travel-alert', {
      type: alertType,
      message,
      severity,
      timestamp: new Date().toISOString(),
      tripId
    });
  });

  // Handle emergency alerts
  socket.on('emergency-alert', (data) => {
    const { tripId, message, location } = data;
    console.log(`🚨 EMERGENCY ALERT for trip ${tripId}: ${message}`);
    
    // Broadcast emergency alert to all users
    io.emit('emergency-alert', {
      type: 'emergency',
      message,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      tripId,
      location
    });
  });

  // Handle client disconnection
  socket.on('disconnect', (reason) => {
    console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
    
    // Clean up monitoring interval if exists
    if (socket.monitoringInterval) {
      clearInterval(socket.monitoringInterval);
      socket.monitoringInterval = null;
    }
  });
});

// Health check endpoint with comprehensive status
app.get('/api/health', (req, res) => {
  const healthStatus = {
    success: true,
    message: 'Smart Travel App API is running! 🚀',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: process.env.MONGODB_URI ? 'Connected' : 'Configuration needed',
      ai: process.env.OPENAI_API_KEY ? 'Available' : 'Limited (demo mode)',
      weather: process.env.OPENWEATHER_API_KEY ? 'Available' : 'Limited (demo mode)',
      maps: process.env.GOOGLE_MAPS_API_KEY ? 'Available' : 'Limited (demo mode)',
      booking: process.env.AMADEUS_CLIENT_ID ? 'Available' : 'Limited (demo mode)',
      socketio: 'Connected' // Added Socket.IO status
    },
    features: [
      '✅ User Authentication & Profiles',
      '✅ AI Trip Planning & Recommendations', 
      '✅ Smart Itinerary Generation',
      '✅ Flight & Hotel Booking',
      '✅ Real-time Weather Forecasts',
      '✅ Currency Conversion',
      '✅ Language Translation',
      '✅ AI Travel Chatbot',
      '✅ Expense Tracking',
      '✅ Travel Insights & Analytics',
      '✅ Real-time Communication', // Added Socket.IO feature
      '✅ Live Trip Monitoring' // Added Socket.IO feature
    ],
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    socketConnections: io.engine.clientsCount // Added Socket.IO connection count
  };

  res.json(healthStatus);
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  const apiDocs = {
    title: 'Smart Travel App API Documentation',
    version: '2.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      authentication: {
        'POST /auth/register': 'Register new user',
        'POST /auth/login': 'User login',
        'GET /auth/me': 'Get current user info',
        'PUT /auth/profile': 'Update user profile',
        'PUT /auth/change-password': 'Change password',
      },
      trips: {
        'GET /trips': 'Get user trips',
        'POST /trips': 'Create new trip',
        'GET /trips/:id': 'Get single trip',
        'PUT /trips/:id': 'Update trip',
        'DELETE /trips/:id': 'Delete trip',
        'POST /trips/:id/expenses': 'Add expense to trip',
      },
      ai: {
        'POST /ai/recommendations': 'Get AI travel recommendations',
        'POST /ai/generate-itinerary': 'Generate AI itinerary',
        'POST /ai/travel-insights': 'Get travel insights',
        'POST /ai/packing-suggestions': 'Get packing suggestions',
      },
      chatbot: {
        'POST /chatbot/chat': 'Send message to AI chatbot',
        'GET /chatbot/history/:conversationId': 'Get chat history',
        'POST /chatbot/smart-answer': 'Get smart travel answer',
      },
      booking: {
        'POST /booking/flights/search': 'Search flights',
        'POST /booking/hotels/search': 'Search hotels',
        'POST /booking/flights/book': 'Book flight',
        'POST /booking/hotels/book': 'Book hotel',
        'GET /booking/history': 'Get booking history',
      },
      weather: {
        'GET /weather/:location': 'Get weather data',
        'POST /weather/alerts': 'Get weather alerts',
      },
      currency: {
        'GET /currency/convert': 'Convert currency',
        'GET /currency/rates': 'Get exchange rates',
        'GET /currency/popular': 'Get popular currencies',
      },
      translator: {
        'POST /translator/translate': 'Translate text',
        'GET /translator/phrases': 'Get travel phrases',
        'GET /translator/languages': 'Get supported languages',
      }
    },
    socketio: {
      events: {
        'join-trip': 'Join a trip room for real-time updates',
        'start-journey': 'Start journey monitoring',
        'stop-journey': 'Stop journey monitoring',
        'location-update': 'Send location updates',
        'start-monitoring': 'Start real-time monitoring',
        'stop-monitoring': 'Stop real-time monitoring',
        'send-travel-alert': 'Send travel alert to trip members',
        'emergency-alert': 'Send emergency alert'
      },
      connection: `ws://localhost:${PORT}/socket.io/`
    },
    authentication: 'Most endpoints require JWT token in Authorization header: Bearer <token>',
    rateLimit: '200 requests per 15 minutes per IP',
    contentType: 'application/json'
  };

  res.json(apiDocs);
});

// API statistics endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalEndpoints: 25,
      activeServices: 9, // Updated to include Socket.IO
      supportedLanguages: 12,
      supportedCurrencies: 20,
      averageResponseTime: '< 500ms',
      uptime: `${Math.floor(process.uptime() / 60)} minutes`,
      lastRestart: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      socketConnections: io.engine.clientsCount, // Added Socket.IO stats
      activeRooms: io.sockets.adapter.rooms.size // Added Socket.IO room stats
    }
  });
});

// Catch 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: '/api/docs'
  });
});

// Global error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('💀 Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('💀 Process terminated');
  });
});

// Start server with Socket.IO
server.listen(PORT, () => {
  console.log('\n🌟 ================================');
  console.log('🚀 SMART TRAVEL APP SERVER STARTED');
  console.log('🌟 ================================');
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO URL: ws://localhost:${PORT}/socket.io/`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Features: AI Planning, Real-time Booking, Weather, Translation, Live Monitoring`);
  console.log('🌟 ================================\n');
});

module.exports = app;