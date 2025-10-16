// jobs/hourlyGenerator.js
const cron = require('node-cron');
const Sensor = require('../models/Sensor');
const SoilData = require('../models/SoilData');

// Helper: generate realistic soil data values
function generateSoilReading() {
  return {
    ph: +(6 + Math.random() * 2).toFixed(2), // 6–8
    moisture: +(30 + Math.random() * 50).toFixed(2), // %
    humidity: +(40 + Math.random() * 30).toFixed(2), // add humidity %
    temperature: +(15 + Math.random() * 20).toFixed(2), // °C
    nitrogen: +(Math.random() * 50).toFixed(2),
    phosphorus: +(Math.random() * 30).toFixed(2),
    potassium: +(Math.random() * 40).toFixed(2),
    electricalConductivity: +(Math.random() * 5).toFixed(2),
    organicMatter: +(Math.random() * 10).toFixed(2),
    
  };
}

// This function runs every hour
async function generateHourlyAverages() {
  try {
    const sensors = await Sensor.find();
    if (!sensors.length) {
      console.log(' No sensors found. Run seed.js first.');
      return;
    }

    const now = new Date();
    const timestamp = new Date(now.setMinutes(0, 0, 0)); // top of the hour

    const readings = sensors.map(sensor => ({
      deviceId: sensor.sensorId,
      location: sensor.location,
      soil: generateSoilReading(),
      timestamp,
      receivedAt: new Date()
    }));

    await SoilData.insertMany(readings);
    console.log(` Inserted ${readings.length} hourly soil readings at ${timestamp.toISOString()}`);
  } catch (err) {
    console.error(' Error generating hourly data:', err);
  }
}

// Schedule job: run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log(' Running hourly average generation job...');
  await generateHourlyAverages();
});

// Run immediately on startup (optional)
generateHourlyAverages();

module.exports = generateHourlyAverages;
