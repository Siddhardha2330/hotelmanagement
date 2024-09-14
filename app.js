const express = require('express');
const mongoose = require('mongoose');

const User = require('./models/User');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("Error connecting to MongoDB", err));

// Routes
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/check', (req,res)=>{
 res.render("check");
})
app.get('/contact',(req,res)=>{
  res.render('contact');
});
app.get('/service',(req,res)=>{
  res.render('service');
})

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const newUser = new User({ username, password });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(400).send("Error signing up. Please try again.");
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      req.session.user = user;
      res.redirect('/dashboard');
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(400).send("Error logging in. Please try again.");
  }
});

app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.render("home");
  } else {
    res.redirect('/login');
  }
});

app.get('/rooms', async (req, res) => {
  const { type, checkin, checkout } = req.query;
  
  const currentDate = new Date(); // Current date to compare with bookings

  try {
    // Fetch rooms based on type
    const rooms = await Room.find({ type });

    // Check availability of rooms based on existing bookings
    const roomStatuses = [];

    for (let room of rooms) {
      const overlappingBookings = await Booking.find({
        roomid: room.roomno,
        checkin: { $lte: currentDate },  // Booking with checkin date <= current date
        checkout: { $gte: currentDate }  // Booking with checkout date >= current date
      });

      // If no overlapping bookings, the room is available
      const isAvailable = overlappingBookings.length === 0;

      roomStatuses.push({ room, isAvailable });
    }

    // Render the rooms page with room statuses (availability)
    res.render('rooms', { roomStatuses });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).send("Error fetching rooms. Please try again.");
  }
});


// Route to show room details
// Route to show room details
// Route to show room details
// Route to show room details
// Route to show room details
app.get('/room/:id', async (req, res) => {
  const roomId = req.params.id;
  const userId = req.session.user ? req.session.user._id : null; // Assume user is logged in

  try {
    const room = await Room.findOne({ roomno: roomId });

    // Fetch past bookings for the room to get user IDs
    const bookings = await Booking.find({ roomid: roomId });

    // Fetch the username for each user who has booked the room
    const reviewsWithUserDetails = await Promise.all(
      bookings.map(async (booking) => {
        const user = await User.findById(booking.userid);

        // Ensure that `user` and `room.reviews` exist
        if (!user || !room.reviews) {
          return null; // Skip if no user or reviews are found
        }

        // Ensure that `booking.userid` and `review.id` are valid and compare them safely
        const review = room.reviews.find((rev) => rev.id && rev.id.toString() === booking.userid.toString());
        if (review) {
          return { ...review._doc, username: user.username };
        }
        return null;
      })
    );

    // Filter out null values from missing users or reviews
    const validReviews = reviewsWithUserDetails.filter(review => review !== null);

    // Check if the current user is eligible to comment (has completed a stay)
    const pastBookings = await Booking.find({
      roomid: roomId,
      userid: userId,
      checkout: { $lt: new Date() }
    });

    const eligibleToComment = pastBookings.length > 0;

    res.render('room', { room, reviews: validReviews, eligibleToComment, userId });
  } catch (error) {
    console.error("Error fetching room details:", error);
    res.status(500).send("Error fetching room details. Please try again.");
  }
});


// Route to handle comment submission
// Route to handle comment submission
app.post('/room/:id/comment', async (req, res) => {
  const roomId = req.params.id;
  const { rating, comment, userid } = req.body;

  try {
    // Validate userid to ensure it is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userid)) {
      return res.status(400).send("Invalid user ID format.");
    }

    // Verify the user has stayed in the room
    const pastBooking = await Booking.findOne({ 
      roomid: roomId, 
      userid: new mongoose.Types.ObjectId(userid), // Correctly use ObjectId
      checkout: { $lt: new Date() } 
    });

    if (!pastBooking) {
      return res.status(403).send("You can only comment if you have stayed in this room.");
    }

    // Add the new comment to the room's reviews
    await Room.updateOne(
      { roomno: roomId },
      { 
        $push: { 
          reviews: { 
            id: new mongoose.Types.ObjectId(userid), // Ensure the ID is an ObjectId
            rating: Number(rating), 
            comment: comment 
          } 
        } 
      }
    );

    res.redirect(`/room/${roomId}`);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Error adding comment. Please try again.");
  }
});

// Route to handle booking form submission
// Route to handle booking form submission
// Route to handle booking form submission
app.post('/book', async (req, res) => {
  const { userid, roomid, checkin, checkout } = req.body;

  // Log the incoming data to debug
  console.log('Booking data received:', { userid, roomid, checkin, checkout });

  try {
    // Validate the userid format
    if (!mongoose.Types.ObjectId.isValid(userid)) {
      return res.status(400).send("Invalid user ID format.");
    }

    // Create a new booking with the validated ObjectId
    const newBooking = new Booking({
      userid: new mongoose.Types.ObjectId(userid),
      roomid: parseInt(roomid, 10),
      checkin: new Date(checkin),
      checkout: new Date(checkout)
    });

    // Save the new booking
    await newBooking.save();
    res.send("Booking successful!");
  } catch (error) {
    console.error("Error booking room:", error);
    res.status(500).send("Error booking room. Please try again.");
  }
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});
