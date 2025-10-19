const express = require('express');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const passport = require('passport');
const sensorRoutes = require('./routes/sensorRoutes');
const soilRoutes = require('./routes/soilRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();
const cors = require('cors');
const session = require('express-session')({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
});

//import models
const Registration = require("./models/Registration");
const Soil = require("./models/SoilData");
const Sensor = require("./models/Sensor");


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/farmer', require('./routes/farmerRoutes'));
app.use('/api/auth', authRoutes);

app.use(express.urlencoded({ extended: true })); //helps to parse data from forms
//express session configs
app.use(session);
app.use(cors());


//Passprt setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(Registration.createStrategy());
passport.serializeUser(Registration.serializeUser());
passport.deserializeUser(Registration.deserializeUser());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
  require('./scripts/hourlyGenerator');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => console.error('MongoDB connection error:', err));

