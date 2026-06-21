import { z } from 'zod';

export const expenseSchema = z.object({
  trip: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Trip ID reference'),
  title: z.string().min(1, 'Expense title is required').max(100, 'Title cannot exceed 100 characters').trim(),
  amount: z.number().positive('Expense amount must be greater than zero'),
  category: z.enum(['Hotels', 'Food', 'Shopping', 'Transport', 'Entertainment'], {
    errorMap: () => ({ message: 'Invalid category choice' })
  }),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Expense date must be a valid date'
  })
});
