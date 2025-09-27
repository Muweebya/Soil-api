const jwt = require('jsonwebtoken');
const Device = require('../models/Device');
const User = require('../models/User');
const logger = require('../utils/logger');

// Validate IoT device for data submission
const validateDevice = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const { deviceId } = req.body;
    
    if (!apiKey || !deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'API key and deviceId are required'
      });
    }
    
    // Find device in database
    const device = await IoTDevice.findOne({ 
      deviceId: deviceId.toUpperCase(),
      status: 'active'
    });
    
    if (!device) {
      logger.warn(`Unknown device attempted access: ${deviceId}`);
      return res.status(401).json({
        success: false,
        error: 'Unauthorized device',
        message: 'Device not registered or inactive'
      });
    }
    
    // Verify API key
    const isValidKey = await device.verifyApiKey(apiKey);
    if (!isValidKey) {
      logger.warn(`Invalid API key for device: ${deviceId}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid API key'
      });
    }
    
    // Add device info to request
    req.device = device;
    next();
    
  } catch (error) {
    logger.error('Device validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'Unable to validate device'
    });
  }
};

// Validate API key for data access
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Missing API key',
        message: 'API key required in X-API-Key header'
      });
    }
    
    // For demo purposes, allow a simple API key
    // In production, validate against user database
    if (apiKey === 'demo-key' || apiKey.startsWith('ug-soil-')) {
      req.apiAccess = { tier: 'free', user: 'demo' };
      return next();
    }
    
    // Check user database for valid API access
    const user = await User.findOne({
      'apiAccess.enabled': true
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: 'API key not found or disabled'
      });
    }
    
    req.user = user;
    req.apiAccess = user.apiAccess;
    next();
    
  } catch (error) {
    logger.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// JWT authentication for admin endpoints
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    req.user = user;
    next();
    
  } catch (error) {
    logger.error('Token authentication error:', error);
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

module.exports = {
  validateDevice,
  validateApiKey,
  authenticateToken
};