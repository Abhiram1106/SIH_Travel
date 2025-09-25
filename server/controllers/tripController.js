const Trip = require('../models/Trip');

const getTrips = async (req, res) => {
  try {
    console.log('📋 Fetching trips for user:', req.user._id);
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log(`✅ Found ${trips.length} trips`);
    res.json({ success: true, data: trips, count: trips.length });
  } catch (error) {
    console.error('❌ Get trips error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trips', error: error.message });
  }
};

const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching trip:', id);
    const trip = await Trip.findOne({ _id: id, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    console.log('✅ Trip found:', trip.title);
    res.json({ success: true, data: trip });
  } catch (error) {
    console.error('❌ Get trip error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trip', error: error.message });
  }
};

const createTrip = async (req, res) => {
  try {
    console.log('📝 Creating new trip...');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id);

    const { title, destination, startDate, endDate, budget, groupSize = 1, travelStyle = 'mid-range', interests = [], notes = '' } = req.body;

    if (!title || !destination || !startDate || !endDate || !budget) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, destination, startDate, endDate, budget'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      return res.status(400).json({ success: false, message: 'Budget must be a positive number' });
    }

    const tripData = {
      user: req.user._id,
      title: title.trim(),
      destination: destination.trim(),
      startDate: start,
      endDate: end,
      budget: budgetNum,
      groupSize: parseInt(groupSize) || 1,
      travelStyle: travelStyle || 'mid-range',
      interests: Array.isArray(interests) ? interests : [],
      status: 'planned',
      totalEstimatedCost: 0,
      itinerary: []
    };

    console.log('Trip data to save:', tripData);

    const newTrip = new Trip(tripData);
    const savedTrip = await newTrip.save();

    console.log('✅ Trip created successfully:', savedTrip._id);

    res.status(201).json({
      success: true,
      data: savedTrip,
      message: 'Trip created successfully!'
    });

  } catch (error) {
    console.error('❌ Create trip error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create trip',
      error: error.message
    });
  }
};

const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log('📝 Updating trip:', id);
    delete updates.user;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    const trip = await Trip.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    console.log('✅ Trip updated successfully');
    res.json({ success: true, data: trip, message: 'Trip updated successfully' });
  } catch (error) {
    console.error('❌ Update trip error:', error);
    res.status(500).json({ success: false, message: 'Failed to update trip', error: error.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting trip:', id);
    const trip = await Trip.findOneAndDelete({ _id: id, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    console.log('✅ Trip deleted successfully');
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('❌ Delete trip error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete trip', error: error.message });
  }
};

const getTripStats = async (req, res) => {
  try {
    console.log('📊 Getting trip stats for user:', req.user._id);
    const trips = await Trip.find({ user: req.user._id });
    const now = new Date();
    const stats = {
      totalTrips: trips.length,
      upcomingTrips: trips.filter(trip => new Date(trip.startDate) > now).length,
      completedTrips: trips.filter(trip => trip.status === 'completed').length,
      totalBudget: trips.reduce((sum, trip) => sum + (trip.budget || 0), 0),
      totalEstimatedCost: trips.reduce((sum, trip) => sum + (trip.totalEstimatedCost || 0), 0),
      averageBudget: trips.length > 0 ? Math.round(trips.reduce((sum, trip) => sum + (trip.budget || 0), 0) / trips.length) : 0
    };
    console.log('✅ Trip stats calculated:', stats);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Get trip stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get trip statistics', error: error.message });
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripStats
};
