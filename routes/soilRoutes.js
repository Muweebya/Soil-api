const express = require('express');
const router = express.Router();
const SoilData = require('../models/SoilData');

// Add soil reading
router.post('/', async (req, res) => {
  try {
    const soilData = new SoilData(req.body);
    await soilData.save();
    res.status(201).json(soilData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all soil readings
router.get('/', async (req, res) => {
  try {
    const data = await SoilData.find().sort({ timestamp: -1 }).limit(100);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get readings by sensor
router.get('/sensor/:sensorId', async (req, res) => {
  try {
    const data = await SoilData.find({ sensorId: req.params.sensorId }).sort({ timestamp: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Query by district
router.get('/district/:district', async (req, res) => {
  try {
    const data = await SoilData.find({ 'location.district': req.params.district }).sort({ timestamp: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Query by geolocation
router.get('/near', async (req, res) => {
  try {
    const { lng, lat, radius } = req.query;
    const data = await SoilData.find({
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378137]
        }
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
