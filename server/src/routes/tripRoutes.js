import express from 'express';
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip
} from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { tripSchema } from '../validators/tripValidator.js';

const router = express.Router();

// Apply auth protection to all trip routes
router.use(protect);

router.route('/')
  .post(validate(tripSchema), createTrip)
  .get(getTrips);

router.route('/:id')
  .get(getTripById)
  .put(validate(tripSchema), updateTrip)
  .delete(deleteTrip);

export default router;
