const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required:true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  
  location: {
    coordinates: {
      type: [Number], // [lng, lat]
      
    },
    district: String,
    subcounty: String,
    village: String
  },
  installedAt: {
    type: Date,
    default: Date.now
  }
  
}, { timestamps: true });

SensorSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Sensor', SensorSchema);
