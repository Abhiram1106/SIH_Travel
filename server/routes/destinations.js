// Add these routes to your Express.js router

const express = require('express');
const router = express.Router();
const destinationsController = require('./controllers/destinationsController'); // Adjust path as needed

// Routes for destinations
router.get('/destinations/top', destinationsController.getTopDestinations);
router.get('/destinations/search', destinationsController.searchDestinations);
router.get('/destinations/:destinationId/attractions', destinationsController.getDestinationAttractions);

module.exports = router;

// Example usage in main app.js:
// const destinationsRoutes = require('./routes/destinations');
// app.use('/api', destinationsRoutes);