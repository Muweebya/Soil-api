const express = require('express');
const router = express.Router();
const Sensor = require('../models/Sensor');

// Register a new sensor
router.post('/registerSensor', async (req, res) => {
  try {
    const sensor = new Sensor(req.body);
    await sensor.save();
    res.status(201).json(sensor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all sensors
router.get('/', async (req, res) => {
  try {
    const sensors = await Sensor.find();
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one sensor
router.get('/:sensorId', async (req, res) => {
  try {
    const sensor = await Sensor.findOne({ sensorId: req.params.sensorId });
    if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
    res.json(sensor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a sensor
router.put('/:sensorId', async (req, res) => {
  try {
    const sensor = await Sensor.findOneAndUpdate(
      { sensorId: req.params.sensorId },
      req.body,
      { new: true }
    );
    if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
    res.json(sensor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a sensor
router.delete('/:sensorId', async (req, res) => {
  try {
    const sensor = await Sensor.findOneAndDelete({ sensorId: req.params.sensorId });
    if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
    res.json({ message: 'Sensor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
