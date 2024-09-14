const mongoose = require('mongoose');

// Define Booking schema
const BookingSchema = new mongoose.Schema({
  
  userid: {
    type: mongoose.Schema.Types.ObjectId,  // ObjectId type for userid
    required: true
   
  },
  roomid: {
    type:Number,  // ObjectId type for roomid
    required: true
   
  },
  checkin: { type: Date, default: null },  // Added check-in date
  checkout: { type: Date, default: null }
  
});

// Create Booking model
const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
