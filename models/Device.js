const mongoose = require(mongoose);
const passportLocalMongoose = require('passport-local-mongoose');

const DeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  name: {
    type: String,
    required: true
  },
  
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  
  owner: {
    name: String,
    contact: String,
    organization: String
  },
  
  location: {
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    district: String,
    subcounty: String
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'offline'],
    default: 'active'
  },
  
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  dataCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'iot_devices'
});

module.exports = mongoose.model('device', deviceSchema);