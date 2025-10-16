// scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Sensor = require('../models/Sensor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/soil_api';

async function seedSensors() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' MongoDB connected');

    // Clear any existing sensors (optional for fresh start)
    await Sensor.deleteMany({});
    console.log(' Old sensors cleared');

    // Example sensors (you can add more or adjust locations)
    const sensors = [
      {
        sensorId: 'SENSOR001',
        name: 'Kampala Sensor',
        location: {
          coordinates: [32.5825, 0.3476], // [lng, lat]
          district: 'Kampala',
          subcounty: 'Central',
          village: 'Nakasero'
        }
      },
      {
        sensorId: 'SENSOR002',
        name: 'Wakiso Sensor',
        location: {
          coordinates: [32.4753, 0.4042],
          district: 'Wakiso',
          subcounty: 'Kasangati',
          village: 'Kabanyolo'
        }
      },
      {
        sensorId: 'SENSOR003',
        name: 'Gulu Sensor',
        location: {
          coordinates: [32.29899, 2.7724],
          district: 'Gulu',
          subcounty: 'Pece',
          village: 'Layibi'
        }
      },
      {
        sensorId: 'SENSOR004',
        name: 'Mbarara Sensor',
        location: {
          coordinates: [30.6581, -0.6072],
          district: 'Mbarara',
          subcounty: 'Kakoba',
          village: 'Nyamitanga'
        }
      }
    ];

    await Sensor.insertMany(sensors);
    console.log(` Inserted ${sensors.length} sensors successfully!`);

    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error(' Error seeding sensors:', err);
    process.exit(1);
  }
}

seedSensors();
