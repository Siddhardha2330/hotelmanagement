const mongoose = require('mongoose');

// Define Booking schema
const BookingSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,  // ObjectId type for userid
    required: true
   
  },
  roomid: {
    type: mongoose.Schema.Types.ObjectId,  // ObjectId type for roomid
    required: true
   
  }
});

// Create Booking model
const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
