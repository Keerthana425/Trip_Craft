import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, default: '' },
  desc: { type: String, default: '' }
}, { _id: true }); // Enable _id to make individual activities easier to edit/delete

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: '' }
}, { _id: false });

const daySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  morning: [activitySchema],
  afternoon: [activitySchema],
  evening: [activitySchema],
  restaurants: [restaurantSchema],
  budget: { type: Number, default: 0 }
}, { _id: false });

const itinerarySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      unique: true // One itinerary per trip
    },
    summary: {
      type: String,
      default: ''
    },
    days: [daySchema],
    tips: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Itinerary = mongoose.model('Itinerary', itinerarySchema);
export default Itinerary;
