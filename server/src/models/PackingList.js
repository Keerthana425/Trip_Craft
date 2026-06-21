import mongoose from 'mongoose';

const packingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  checked: {
    type: Boolean,
    default: false
  }
});

const packingListSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      unique: true // One packing list per trip
    },
    items: [packingItemSchema]
  },
  {
    timestamps: true
  }
);

const PackingList = mongoose.model('PackingList', packingListSchema);
export default PackingList;
