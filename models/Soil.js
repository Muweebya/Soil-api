const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const SoilDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude] for GeoJSON
      required: true,
      index: '2dsphere' // Enables geographic queries
    },
    district: {
      type: String,
      required: true,
      index: true
    },
    subcounty: String,
    village: String
  },

  soil: {
    ph: {
      type: Number,
      required: true,
      min: 0,
      max: 14
    },
    moisture: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    temperature: {
      type: Number,
      required: true,
      min: -10,
      max: 60
    },
    nitrogen: { type: Number, min: 0 },
    phosphorus: { type: Number, min: 0 },
    potassium: { type: Number, min: 0 },
    electricalConductivity: { type: Number, min: 0 },
    organicMatter: { type: Number, min: 0, max: 100 }
  },

  timestamp: {
    type: Date,
    required: true,
    index: true
  },

  receivedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'soil_data'
});

// Performance indexes
SoilDataSchema.index({ deviceId: 1, timestamp: -1 });
SoilDataSchema.index({ 'location.district': 1, timestamp: -1 });
SoilDataSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('soil', soilSchema);