import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const chatSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      unique: true // One chat thread per trip
    },
    messages: [messageSchema]
  },
  {
    timestamps: true
  }
);

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
