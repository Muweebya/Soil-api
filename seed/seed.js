const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const Sensor = require('../models/Sensor');
const SoilData = require('../models/SoilData');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    // Clear existing data
    await Sensor.deleteMany({});
    await SoilData.deleteMany({});
    console.log('Cleared old data');

    // Generate fake sensors
    const sensors = [];
    for (let i = 0; i < 5; i++) {
      const sensor = new Sensor({
        sensorId: faker.string.uuid(),
        name: `Sensor-${i + 1}`,
        type: faker.helpers.arrayElement(['soil_probe', 'drone_sensor']),
        location: {
          coordinates: [
            parseFloat(faker.location.longitude({ min: 29, max: 35 })), // Uganda lng
            parseFloat(faker.location.latitude({ min: -1, max: 4 })) // Uganda lat
          ],
          district: faker.location.city(),
          subcounty: faker.location.street(),
          village: faker.location.street()
        },
        status: faker.helpers.arrayElement(['active', 'inactive', 'maintenance'])
      });
      sensors.push(sensor);
    }
    await Sensor.insertMany(sensors);
    console.log(` Inserted ${sensors.length} sensors`);

    // Generate fake soil readings per sensor
    const soilData = [];
    sensors.forEach(sensor => {
      for (let i = 0; i < 10; i++) {
        soilData.push(new SoilData({
          sensorId: sensor.sensorId,
          location: sensor.location,
          soil: {
            ph: faker.number.float({ min: 4.5, max: 8.5, precision: 0.1 }),
            moisture: faker.number.int({ min: 10, max: 90 }),
            temperature: faker.number.int({ min: 15, max: 35 }),
            nitrogen: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
            phosphorus: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
            potassium: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
            electricalConductivity: faker.number.float({ min: 0.1, max: 5.0, precision: 0.01 }),
            organicMatter: faker.number.float({ min: 1, max: 10, precision: 0.1 })
          },
          timestamp: faker.date.recent({ days: 7 }),
        }));
      }
    });

    await SoilData.insertMany(soilData);
    console.log(` Inserted ${soilData.length} soil readings`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedDatabase();
