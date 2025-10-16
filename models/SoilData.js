const mongoose = require('mongoose');

const SoilDataSchema = new mongoose.Schema({
  sensorId: {
    type: mongoose.Schema.Types.String, // references Sensor.sensorId
    ref: 'Sensor',
    required: true,
    index: true
  },
  
  location: {
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      index: '2dsphere'
    },
    district: { type: String, required: true },
    subcounty: String,
    village: String
  },

  soil: {
    ph: { type: Number, required: true, min: 0, max: 14 },
    moisture: { type: Number, required: true, min: 0, max: 100 },
    humidity: { type: Number, required: false, min: 0, max: 100 }, 
    temperature: { type: Number, required: true, min: -10, max: 60 },
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    electricalConductivity: Number,
    organicMatter: Number
    //HUMIDITY


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
}, { timestamps: true, collection: 'soil_data' });

SoilDataSchema.index({ sensorId: 1, timestamp: -1 });
SoilDataSchema.index({ 'location.district': 1, timestamp: -1 });
SoilDataSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('SoilData', SoilDataSchema);

