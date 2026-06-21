import Trip from '../models/Trip.js';
import Itinerary from '../models/Itinerary.js';
import Chat from '../models/Chat.js';
import PackingList from '../models/PackingList.js';
import Expense from '../models/Expense.js';
import {
  generateItineraryService,
  chatConciergeService,
  replanItineraryService,
  generatePackingListService,
  generateLocalGuidelinesService
} from '../services/aiService.js';
import axios from 'axios';

// Cache for local recommendations to avoid hitting Gemini repeatedly
const recommendationsCache = {};

// Helper to fetch coordinates for a city name (simple geocoding)
const getCoordinates = async (city) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: city, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'TripCraftAI-Agent' }
    });
    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      };
    }
  } catch (err) {
    console.error('Geocoding error:', err.message);
  }
  return { lat: 35.6762, lon: 139.6503 }; // Default to Tokyo
};

// Helper: Query weather metrics for context
const getWeatherContext = async (destination) => {
  try {
    const coords = await getCoordinates(destination);
    const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        current_weather: true
      }
    });
    return weatherRes.data?.current_weather || null;
  } catch (err) {
    return null;
  }
};

// @desc    Generate Itinerary
// @route   POST /api/ai/generate-itinerary
// @access  Private
export const generateItinerary = async (req, res, next) => {
  const { tripId } = req.body;
  try {
    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    const aiResponse = await generateItineraryService(trip);

    // Save/Update in database
    let itinerary = await Itinerary.findOne({ trip: tripId });
    if (itinerary) {
      itinerary.summary = aiResponse.summary;
      itinerary.days = aiResponse.days;
      itinerary.tips = aiResponse.tips;
      await itinerary.save();
    } else {
      itinerary = await Itinerary.create({
        trip: tripId,
        summary: aiResponse.summary,
        days: aiResponse.days,
        tips: aiResponse.tips
      });
    }

    res.json(itinerary);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Itinerary
// @route   GET /api/ai/itinerary/:tripId
// @access  Private
export const getItinerary = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    const itinerary = await Itinerary.findOne({ trip: req.params.tripId });
    res.json(itinerary);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Itinerary (Manual adjustments)
// @route   PUT /api/ai/itinerary/:tripId
// @access  Private
export const updateItinerary = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    let itinerary = await Itinerary.findOne({ trip: req.params.tripId });
    if (!itinerary) {
      itinerary = new Itinerary({ trip: req.params.tripId, days: [] });
    }

    itinerary.days = req.body.days;
    itinerary.summary = req.body.summary || itinerary.summary;
    itinerary.tips = req.body.tips || itinerary.tips;

    const savedItinerary = await itinerary.save();
    res.json(savedItinerary);
  } catch (error) {
    next(error);
  }
};

// @desc    AI Assistant Chat Integration
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res, next) => {
  const { tripId, message } = req.body;
  try {
    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    const itinerary = await Itinerary.findOne({ trip: tripId });
    const expenses = await Expense.find({ trip: tripId });
    const weather = await getWeatherContext(trip.destination);
    let chat = await Chat.findOne({ trip: tripId });

    if (!chat) {
      chat = await Chat.create({ trip: tripId, messages: [] });
    }

    // Append user message
    chat.messages.push({ sender: 'user', text: message });

    // Call Gemini with full context
    const context = { trip, itinerary, expenses, weather };
    const replyText = await chatConciergeService(context, chat.messages.slice(0, -1), message);

    // Append assistant message
    chat.messages.push({ sender: 'assistant', text: replyText });
    await chat.save();

    res.json({ reply: replyText, messages: chat.messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Chat History
// @route   GET /api/ai/chat/:tripId
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    let chat = await Chat.findOne({ trip: req.params.tripId });
    if (!chat) {
      chat = await Chat.create({ trip: req.params.tripId, messages: [] });
    }
    res.json(chat.messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Replan Itinerary via instruction
// @route   POST /api/ai/replan
// @access  Private
export const replanItinerary = async (req, res, next) => {
  const { tripId, prompt } = req.body;
  try {
    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    const itinerary = await Itinerary.findOne({ trip: tripId });
    if (!itinerary) {
      res.status(400);
      return next(new Error('No itinerary found to replan. Generate one first.'));
    }

    const updatedAIItinerary = await replanItineraryService(trip, itinerary.toObject(), prompt);

    itinerary.summary = updatedAIItinerary.summary;
    itinerary.days = updatedAIItinerary.days;
    itinerary.tips = updatedAIItinerary.tips;

    const savedItinerary = await itinerary.save();
    res.json(savedItinerary);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Packing list
// @route   POST /api/ai/packing-list
// @access  Private
export const generatePackingList = async (req, res, next) => {
  const { tripId } = req.body;
  try {
    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    const duration = Math.ceil(Math.abs(trip.endDate - trip.startDate) / (1000 * 60 * 60 * 24)) + 1;
    const aiList = await generatePackingListService(trip.destination, duration, trip.travelStyle);

    let packing = await PackingList.findOne({ trip: tripId });
    if (packing) {
      packing.items = aiList.items;
      await packing.save();
    } else {
      packing = await PackingList.create({
        trip: tripId,
        items: aiList.items
      });
    }

    res.json(packing);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Packing list
// @route   GET /api/ai/packing-list/:tripId
// @access  Private
export const getPackingList = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    let packing = await PackingList.findOne({ trip: req.params.tripId });
    if (!packing) {
      packing = await PackingList.create({ trip: req.params.tripId, items: [] });
    }
    res.json(packing);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Packing list checkboxes or custom items
// @route   PUT /api/ai/packing-list/:tripId
// @access  Private
export const updatePackingList = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    const packing = await PackingList.findOne({ trip: req.params.tripId });
    if (!packing) {
      res.status(404);
      return next(new Error('Packing list not found'));
    }

    packing.items = req.body.items;
    const savedPacking = await packing.save();
    res.json(savedPacking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Local Recommendations
// @route   GET /api/ai/local-recommendations/:tripId
// @access  Private
export const getLocalRecommendations = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    // Check cache
    const cacheKey = trip.destination.toLowerCase().trim();
    if (recommendationsCache[cacheKey]) {
      return res.json(recommendationsCache[cacheKey]);
    }

    const advice = await generateLocalGuidelinesService(trip.destination);
    recommendationsCache[cacheKey] = advice; // Cache it

    res.json(advice);
  } catch (error) {
    next(error);
  }
};
