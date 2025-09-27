
//Dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');

//import user model
const soil = require("./models/Soil");


require('dotenv').config();
//instantiations
const app = express();
const PORT = 3001;
//import routes
const soilRoutes = require("./routes/soilRoutes");

app.use('/api/v1/soil', soilRoutes);
app.use('/api/v1/devices', deviceRoutes);


//configurations
app.locals.moment = moment;
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  mongoose.connection
    .on('open', () => {
      console.log('Mongoose connection open');
    })
    .on('error', (err) => {
      console.log(`Connection error: ${err.message}`);
    });
app.set("view engine", "pug")


//middleware
//express session configs
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
//passport configs

//routes/using imported routes
app.use("/", soilRoutes)
app.use("/", deviceRoutes)



//bootstraping the server
app.listen(PORT, () => console.log(`listening on port ${PORT}`))
