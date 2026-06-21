import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['attraction', 'hotel', 'restaurant']
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Allow users to save unique items per type
favoriteSchema.index({ user: 1, type: 1, name: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
