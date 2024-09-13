const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
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
app.get('/luxuryrooms', (req,res)=>{
  res.render("luxuryrooms");
 })
 app.get('/acrooms', (req,res)=>{
  res.render("acrooms");
 })
 app.get('/nonacrooms', (req,res)=>{
  res.render("nonacrooms");
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
    res.send(`Welcome ${req.session.user.username}`);
  } else {
    res.redirect('/login');
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
