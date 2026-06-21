import Trip from '../models/Trip.js';
import Itinerary from '../models/Itinerary.js';
import Expense from '../models/Expense.js';
import Chat from '../models/Chat.js';
import PackingList from '../models/PackingList.js';

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req, res, next) => {
  try {
    const { destination, startDate, endDate, budget, travelers, travelStyle, foodPreferences } = req.body;

    const trip = await Trip.create({
      user: req.user._id,
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      travelStyle,
      foodPreferences
    });

    // Initialize an empty Chat thread for this trip
    await Chat.create({ trip: trip._id, messages: [] });

    // Initialize an empty PackingList for this trip
    await PackingList.create({ trip: trip._id, items: [] });

    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all trips for user
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ startDate: 1 });
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    res.json(trip);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    const { destination, startDate, endDate, budget, travelers, travelStyle, foodPreferences } = req.body;

    trip.destination = destination || trip.destination;
    trip.startDate = startDate || trip.startDate;
    trip.endDate = endDate || trip.endDate;
    trip.budget = budget !== undefined ? budget : trip.budget;
    trip.travelers = travelers !== undefined ? travelers : trip.travelers;
    trip.travelStyle = travelStyle || trip.travelStyle;
    trip.foodPreferences = foodPreferences || trip.foodPreferences;

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a trip & clean up related records
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    // Clean up dependent resources
    await Itinerary.deleteOne({ trip: trip._id });
    await Expense.deleteMany({ trip: trip._id });
    await Chat.deleteOne({ trip: trip._id });
    await PackingList.deleteOne({ trip: trip._id });
    
    // Delete the trip itself
    await Trip.deleteOne({ _id: trip._id });

    res.json({ message: 'Trip and all associated itineraries, expenses, checklists, and chats purged successfully' });
  } catch (error) {
    next(error);
  }
};
