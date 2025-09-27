const express = require("express");
const router = express.Router();

// Import models
const Soil = require("../models/Soil");
const Device = require("../models/Device");


// Main soil data endpoint
app.post('/api/v1/soil-data', validateDevice, async (req, res) => {
  try {
    // Extract data from request body
    const { deviceId, location, timestamp, sensorData } = req.body;
    
    // Validate required fields
    if (!deviceId || !location || !sensorData) {
      return res.status(400).json({
        error: 'Missing required data',
        message: 'deviceId, location, and sensorData are required'
      });
    }
    
    // Process and clean the data
    const processedData = {
      deviceId: deviceId,
      location: {
        coordinates: [location.longitude, location.latitude], // GeoJSON format
        district: location.district,
        subcounty: location.subcounty
      },
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      soil: {
        ph: parseFloat(sensorData.ph),
        moisture: parseFloat(sensorData.moisture),
        temperature: parseFloat(sensorData.temperature),
        nitrogen: parseFloat(sensorData.nitrogen),
        phosphorus: parseFloat(sensorData.phosphorus),
        potassium: parseFloat(sensorData.potassium)
      },
      receivedAt: new Date() // When server received the data
    };
    
    // Save to database
    const soilReading = new SoilData(processedData);
    await soilReading.save();
    
    // Update device's last seen timestamp
    await IoTDevice.findByIdAndUpdate(req.device._id, {
      lastSeen: new Date(),
      lastLocation: processedData.location
    });
    
    // Send success response back to IoT device
    res.status(201).json({
      success: true,
      message: 'Soil data received successfully',
      dataId: soilReading._id,
      processedAt: new Date().toISOString()
    });
    
    // Optional: Trigger real-time updates or alerts
    // socketIO.emit('new-soil-data', processedData);
    // checkForSoilAlerts(processedData);
    
  } catch (error) {
    console.error('Error processing soil data:', error);
    res.status(500).json({
      error: 'Processing failed',
      message: 'Unable to process soil data'
    });
  }
});
module.exports = router;