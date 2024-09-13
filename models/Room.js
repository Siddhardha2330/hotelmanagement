const mongoose = require('mongoose');

// Define Review schema
const reviewSchema = new mongoose.Schema({
  id: { type: Number, default: null },
  rating: { type: Number, default: null }
});

// Define Room schema
const roomSchema = new mongoose.Schema({
  img1:{type:String,required:true},
  availability: { type: String, required: true },
  type: { type: String, required: true },
  facing: { type: String, required: true },
  size: { type: Number, required: true },
  bedcapacity: { type: Number, required: true },
  price: { type: Number, required: true },
  reviews: [reviewSchema]
});

// Create Room model
const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
