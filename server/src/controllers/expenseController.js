import Expense from '../models/Expense.js';
import Trip from '../models/Trip.js';

// @desc    Record a new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res, next) => {
  try {
    const { trip: tripId, title, amount, category, date } = req.body;

    // Verify trip ownership
    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    const expense = await Expense.create({
      trip: tripId,
      title,
      amount,
      category,
      date
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses for a trip
// @route   GET /api/expenses/:tripId
// @access  Private
export const getExpensesByTripId = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    // Verify trip ownership
    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    const expenses = await Expense.find({ trip: tripId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
      res.status(404);
      return next(new Error('Expense not found'));
    }

    // Verify trip ownership
    const trip = await Trip.findOne({ _id: expense.trip, user: req.user._id });
    if (!trip) {
      res.status(401);
      return next(new Error('Unauthorized transaction deletion request'));
    }

    await Expense.deleteOne({ _id: id });
    res.json({ message: 'Expense record successfully removed' });
  } catch (error) {
    next(error);
  }
};
