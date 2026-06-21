import express from 'express';
import {
  generateItinerary,
  getItinerary,
  updateItinerary,
  chat,
  getChatHistory,
  replanItinerary,
  generatePackingList,
  getPackingList,
  updatePackingList,
  getLocalRecommendations
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate-itinerary', generateItinerary);
router.get('/itinerary/:tripId', getItinerary);
router.put('/itinerary/:tripId', updateItinerary);

router.post('/chat', chat);
router.get('/chat/:tripId', getChatHistory);

router.post('/replan', replanItinerary);

router.post('/packing-list', generatePackingList);
router.get('/packing-list/:tripId', getPackingList);
router.put('/packing-list/:tripId', updatePackingList);

router.get('/local-recommendations/:tripId', getLocalRecommendations);

export default router;
