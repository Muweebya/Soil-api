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

// ============================================
// NEW: AGGREGATION ROUTES
// ============================================

// Get hourly averages for a sensor
router.get('/sensor/:sensorId/hourly', async (req, res) => {
  try {
    const { hours = 24 } = req.query; // Default to last 24 hours
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - parseInt(hours));

    const hourlyAverages = await SoilData.aggregate([
      {
        $match: {
          sensorId: req.params.sensorId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
            hour: { $hour: '$timestamp' }
          },
          avgPh: { $avg: '$soil.ph' },
          avgMoisture: { $avg: '$soil.moisture' },
          avgHumidity: { $avg: '$soil.humidity' },
          avgTemperature: { $avg: '$soil.temperature' },
          avgNitrogen: { $avg: '$soil.nitrogen' },
          avgPhosphorus: { $avg: '$soil.phosphorus' },
          avgPotassium: { $avg: '$soil.potassium' },
          count: { $sum: 1 },
          timestamp: { $first: '$timestamp' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
      },
      {
        $project: {
          _id: 0,
          hour: '$_id.hour',
          datetime: {
            $dateToString: {
              format: '%Y-%m-%d %H:00',
              date: '$timestamp'
            }
          },
          averages: {
            ph: { $round: ['$avgPh', 2] },
            moisture: { $round: ['$avgMoisture', 2] },
            humidity: { $round: ['$avgHumidity', 2] },
            temperature: { $round: ['$avgTemperature', 2] },
            nitrogen: { $round: ['$avgNitrogen', 2] },
            phosphorus: { $round: ['$avgPhosphorus', 2] },
            potassium: { $round: ['$avgPotassium', 2] }
          },
          readings: '$count'
        }
      }
    ]);

    res.json(hourlyAverages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get 6-hour block averages for a sensor
router.get('/sensor/:sensorId/six-hourly', async (req, res) => {
  try {
    const { days = 3 } = req.query; // Default to last 3 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sixHourlyAverages = await SoilData.aggregate([
      {
        $match: {
          sensorId: req.params.sensorId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $addFields: {
          hourBlock: {
            $multiply: [
              { $floor: { $divide: [{ $hour: '$timestamp' }, 6] } },
              6
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
            hourBlock: '$hourBlock'
          },
          avgPh: { $avg: '$soil.ph' },
          avgMoisture: { $avg: '$soil.moisture' },
          avgHumidity: { $avg: '$soil.humidity' },
          avgTemperature: { $avg: '$soil.temperature' },
          avgNitrogen: { $avg: '$soil.nitrogen' },
          avgPhosphorus: { $avg: '$soil.phosphorus' },
          avgPotassium: { $avg: '$soil.potassium' },
          count: { $sum: 1 },
          startTime: { $min: '$timestamp' },
          endTime: { $max: '$timestamp' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hourBlock': 1 }
      },
      {
        $project: {
          _id: 0,
          timeBlock: {
            start: {
              $dateToString: {
                format: '%Y-%m-%d %H:00',
                date: '$startTime'
              }
            },
            end: {
              $dateToString: {
                format: '%Y-%m-%d %H:00',
                date: '$endTime'
              }
            },
            label: {
              $concat: [
                { $toString: '$_id.hourBlock' },
                ':00 - ',
                { $toString: { $add: ['$_id.hourBlock', 6] } },
                ':00'
              ]
            }
          },
          averages: {
            ph: { $round: ['$avgPh', 2] },
            moisture: { $round: ['$avgMoisture', 2] },
            humidity: { $round: ['$avgHumidity', 2] },
            temperature: { $round: ['$avgTemperature', 2] },
            nitrogen: { $round: ['$avgNitrogen', 2] },
            phosphorus: { $round: ['$avgPhosphorus', 2] },
            potassium: { $round: ['$avgPotassium', 2] }
          },
          readings: '$count'
        }
      }
    ]);

    res.json(sixHourlyAverages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get daily averages for a sensor
router.get('/sensor/:sensorId/daily', async (req, res) => {
  try {
    const { days = 7 } = req.query; // Default to last 7 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const dailyAverages = await SoilData.aggregate([
      {
        $match: {
          sensorId: req.params.sensorId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          avgPh: { $avg: '$soil.ph' },
          avgMoisture: { $avg: '$soil.moisture' },
          avgHumidity: { $avg: '$soil.humidity' },
          avgTemperature: { $avg: '$soil.temperature' },
          avgNitrogen: { $avg: '$soil.nitrogen' },
          avgPhosphorus: { $avg: '$soil.phosphorus' },
          avgPotassium: { $avg: '$soil.potassium' },
          count: { $sum: 1 },
          date: { $first: '$timestamp' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date'
            }
          },
          averages: {
            ph: { $round: ['$avgPh', 2] },
            moisture: { $round: ['$avgMoisture', 2] },
            humidity: { $round: ['$avgHumidity', 2] },
            temperature: { $round: ['$avgTemperature', 2] },
            nitrogen: { $round: ['$avgNitrogen', 2] },
            phosphorus: { $round: ['$avgPhosphorus', 2] },
            potassium: { $round: ['$avgPotassium', 2] }
          },
          readings: '$count'
        }
      }
    ]);

    res.json(dailyAverages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get weekly averages for a sensor
router.get('/sensor/:sensorId/weekly', async (req, res) => {
  try {
    const { weeks = 4 } = req.query; // Default to last 4 weeks
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (parseInt(weeks) * 7));

    const weeklyAverages = await SoilData.aggregate([
      {
        $match: {
          sensorId: req.params.sensorId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            week: { $week: '$timestamp' }
          },
          avgPh: { $avg: '$soil.ph' },
          avgMoisture: { $avg: '$soil.moisture' },
          avgHumidity: { $avg: '$soil.humidity' },
          avgTemperature: { $avg: '$soil.temperature' },
          avgNitrogen: { $avg: '$soil.nitrogen' },
          avgPhosphorus: { $avg: '$soil.phosphorus' },
          avgPotassium: { $avg: '$soil.potassium' },
          count: { $sum: 1 },
          startDate: { $min: '$timestamp' },
          endDate: { $max: '$timestamp' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 }
      },
      {
        $project: {
          _id: 0,
          week: '$_id.week',
          year: '$_id.year',
          dateRange: {
            start: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$startDate'
              }
            },
            end: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$endDate'
              }
            }
          },
          averages: {
            ph: { $round: ['$avgPh', 2] },
            moisture: { $round: ['$avgMoisture', 2] },
            humidity: { $round: ['$avgHumidity', 2] },
            temperature: { $round: ['$avgTemperature', 2] },
            nitrogen: { $round: ['$avgNitrogen', 2] },
            phosphorus: { $round: ['$avgPhosphorus', 2] },
            potassium: { $round: ['$avgPotassium', 2] }
          },
          readings: '$count'
        }
      }
    ]);

    res.json(weeklyAverages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get monthly averages for a sensor
router.get('/sensor/:sensorId/monthly', async (req, res) => {
  try {
    const { months = 6 } = req.query; // Default to last 6 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const monthlyAverages = await SoilData.aggregate([
      {
        $match: {
          sensorId: req.params.sensorId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' }
          },
          avgPh: { $avg: '$soil.ph' },
          avgMoisture: { $avg: '$soil.moisture' },
          avgHumidity: { $avg: '$soil.humidity' },
          avgTemperature: { $avg: '$soil.temperature' },
          avgNitrogen: { $avg: '$soil.nitrogen' },
          avgPhosphorus: { $avg: '$soil.phosphorus' },
          avgPotassium: { $avg: '$soil.potassium' },
          count: { $sum: 1 },
          date: { $first: '$timestamp' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          monthName: {
            $let: {
              vars: {
                monthsInString: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              },
              in: {
                $arrayElemAt: ['$$monthsInString', { $subtract: ['$_id.month', 1] }]
              }
            }
          },
          averages: {
            ph: { $round: ['$avgPh', 2] },
            moisture: { $round: ['$avgMoisture', 2] },
            humidity: { $round: ['$avgHumidity', 2] },
            temperature: { $round: ['$avgTemperature', 2] },
            nitrogen: { $round: ['$avgNitrogen', 2] },
            phosphorus: { $round: ['$avgPhosphorus', 2] },
            potassium: { $round: ['$avgPotassium', 2] }
          },
          readings: '$count'
        }
      }
    ]);

    res.json(monthlyAverages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all aggregations at once (useful for dashboard)
router.get('/sensor/:sensorId/summary', async (req, res) => {
  try {
    const sensorId = req.params.sensorId;
    
    // Get latest reading
    const latest = await SoilData.findOne({ sensorId })
      .sort({ timestamp: -1 })
      .select('soil timestamp');

    // Get last 1 hour average
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const oneHourAvg = await SoilData.aggregate([
      {
        $match: {
          sensorId,
          timestamp: { $gte: oneHourAgo }
        }
      },
      {
        $group: {
          _id: null,
          avgPh: { $avg: '$soil.ph' },
          avgMoisture: { $avg: '$soil.moisture' },
          avgHumidity: { $avg: '$soil.humidity' },
          avgTemperature: { $avg: '$soil.temperature' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get last 6 hours average
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    
    const sixHourAvg = await SoilData.aggregate([
      {
        $match: {
          sensorId,
          timestamp: { $gte: sixHoursAgo }
        }
      },
      {
        $group: {
          _id: null,
          avgPh: { $avg: '$soil.ph' },
          avgMoisture: { $avg: '$soil.moisture' },
          avgHumidity: { $avg: '$soil.humidity' },
          avgTemperature: { $avg: '$soil.temperature' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get today's average
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayAvg = await SoilData.aggregate([
      {
        $match: {
          sensorId,
          timestamp: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: null,
          avgPh: { $avg: '$soil.ph' },
          avgMoisture: { $avg: '$soil.moisture' },
          avgHumidity: { $avg: '$soil.humidity' },
          avgTemperature: { $avg: '$soil.temperature' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get this week's average
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weekAvg = await SoilData.aggregate([
      {
        $match: {
          sensorId,
          timestamp: { $gte: weekStart }
        }
      },
      {
        $group: {
          _id: null,
          avgPh: { $avg: '$soil.ph' },
          avgMoisture: { $avg: '$soil.moisture' },
          avgHumidity: { $avg: '$soil.humidity' },
          avgTemperature: { $avg: '$soil.temperature' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get this month's average
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthAvg = await SoilData.aggregate([
      {
        $match: {
          sensorId,
          timestamp: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          avgPh: { $avg: '$soil.ph' },
          avgMoisture: { $avg: '$soil.moisture' },
          avgHumidity: { $avg: '$soil.humidity' },
          avgTemperature: { $avg: '$soil.temperature' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      latest: latest ? latest.soil : null,
      latestTimestamp: latest ? latest.timestamp : null,
      oneHour: oneHourAvg[0] || null,
      sixHours: sixHourAvg[0] || null,
      today: todayAvg[0] || null,
      week: weekAvg[0] || null,
      month: monthAvg[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// EXISTING ROUTES (keep these)
// ============================================

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