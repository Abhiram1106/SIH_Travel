# Smart Travel App - SIH 2025

A comprehensive travel planning and management application built with React, TypeScript, Node.js, and MongoDB. This project was developed for Smart India Hackathon 2025.

## Features

### Core Features
- **User Authentication & Profile Management**: Secure login/registration with role-based access
- **AI-Powered Travel Recommendations**: Personalized destination and activity suggestions
- **Intelligent Itinerary Generator**: AI-generated travel plans based on preferences and budget
- **Flight & Hotel Booking Integration**: Search and compare travel options
- **Real-Time Navigation & Maps**: GPS navigation with offline support
- **Expense Management**: Budget tracking and expense categorization
- **AI Chatbot**: 24/7 virtual travel assistant
- **Weather Forecasting**: Real-time weather updates and travel advisories
- **Local Recommendations**: Discover attractions, restaurants, and events
- **Currency Converter**: Live exchange rates
- **Language Translator**: Multi-language communication support

### Advanced Features
- **Dynamic Pricing with AI**: Optimized travel deals using price prediction
- **Voice Command Assistant**: Hands-free trip planning
- **Augmented Reality Navigation**: AR-based exploration guides
- **Smart Luggage Tracking**: Real-time baggage location
- **Predictive Analytics**: Price forecasting and travel trend analysis
- **Multi-Currency Payment**: Secure payment processing
- **Emergency Assistance**: AI-powered safety alerts and support

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

### Development Tools
- **MongoDB Compass** for database management
- **Nodemon** for development server
- **Jest** for testing
- **ESLint** and **Prettier** for code quality

## Project Structure

```
travel-app/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Helper functions
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   ├── middlewares/      # Custom middleware
│   ├── config/           # Configuration files
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd travel-app
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../client
npm install
```

4. **Environment Setup**
Copy `.env.example` to `.env` in the root directory and fill in your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/travel-app

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# API Keys (optional for basic functionality)
OPENWEATHER_API_KEY=your-openweather-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
OPENAI_API_KEY=your-openai-api-key
```

### Running the Application

1. **Start MongoDB**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Ensure your connection string is correct

2. **Start the backend server**
```bash
cd server
npm run dev
```

3. **Start the frontend development server**
```bash
cd client
npm start
```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - API Health Check: http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify` - Verify JWT token

### Trips
- `GET /api/trips` - Get user trips
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### AI Services
- `POST /api/ai/recommendations` - Get travel recommendations
- `POST /api/ai/generate-itinerary` - Generate AI itinerary

### Weather
- `GET /api/weather/:location` - Get weather data

### Booking
- `POST /api/booking/flights/search` - Search flights
- `POST /api/booking/hotels/search` - Search hotels

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use meaningful component and variable names
- Add JSDoc comments for complex functions

### Git Workflow
1. Create feature branches from `main`
2. Make small, focused commits
3. Write descriptive commit messages
4. Create pull requests for review

### Testing
```bash
# Run frontend tests
cd client && npm test

# Run backend tests
cd server && npm test
```

## Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `cd client && npm run build`
2. Deploy the `build` folder to your hosting service
3. Update environment variables in your hosting dashboard

### Backend Deployment (Heroku/Railway/DigitalOcean)
1. Set up environment variables on your hosting platform
2. Ensure MongoDB Atlas is configured for production
3. Deploy the server code
4. Update CORS settings for your production domain

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is developed for Smart India Hackathon 2025 and is available under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## Acknowledgments

- Smart India Hackathon 2025 organizers
- Open source libraries and contributors
- Testing and feedback from the community

---

**Team**: [Your Team Name]  
**SIH 2025 Problem Statement**: SIH25137 - Travel & Tourism  
**Version**: 1.0.0
