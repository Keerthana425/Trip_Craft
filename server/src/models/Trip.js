import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative']
    },
    travelers: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 traveler']
    },
    travelStyle: {
      type: String,
      required: true,
      enum: ['Adventure', 'Leisure', 'Cultural', 'Business', 'Luxury', 'Budget', 'Family'],
      default: 'Leisure'
    },
    foodPreferences: {
      type: String,
      required: true,
      enum: ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'No Preference'],
      default: 'No Preference'
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'past'],
      default: 'upcoming'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to determine trip status dynamically based on current date
tripSchema.pre('save', function (next) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(this.startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(this.endDate);
  end.setHours(23, 59, 59, 999);

  if (now < start) {
    this.status = 'upcoming';
  } else if (now > end) {
    this.status = 'past';
  } else {
    this.status = 'active';
  }
  next();
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
