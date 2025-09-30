const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String, // e.g. "soil_probe", "drone_sensor"
    required: true
  },
  location: {
    coordinates: {
      type: [Number], // [lng, lat]
      index: '2dsphere'
    },
    district: String,
    subcounty: String,
    village: String
  },
  installedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Sensor', SensorSchema);
