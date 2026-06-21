import express from 'express';
import {
  createExpense,
  getExpensesByTripId,
  deleteExpense
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { expenseSchema } from '../validators/expenseValidator.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(expenseSchema), createExpense);
router.get('/:tripId', getExpensesByTripId);
router.delete('/:id', deleteExpense);

export default router;
