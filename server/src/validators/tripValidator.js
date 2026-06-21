import { z } from 'zod';

export const tripSchema = z.object({
  destination: z.string().min(1, 'Destination is required').trim(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Start date must be a valid date'
  }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'End date must be a valid date'
  }),
  budget: z.number().nonnegative('Budget cannot be negative'),
  travelers: z.number().int().min(1, 'Travelers must be at least 1'),
  travelStyle: z.enum(['Adventure', 'Leisure', 'Cultural', 'Business', 'Luxury', 'Budget', 'Family'], {
    errorMap: () => ({ message: 'Invalid travel style choice' })
  }),
  foodPreferences: z.enum(['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'No Preference'], {
    errorMap: () => ({ message: 'Invalid food preference choice' })
  })
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'End date must be on or after start date',
  path: ['endDate']
});
