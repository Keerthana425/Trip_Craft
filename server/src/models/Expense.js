import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Hotels', 'Food', 'Shopping', 'Transport', 'Entertainment']
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
