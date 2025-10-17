const express = require("express");
const router = express.Router();

// Define authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // Redirect to login page if not authenticated
};

router.get('/farmerDash', isAuthenticated, async (req, res) => {
  res.json({
    message: ` Welcome ${req.user.name}, here’s your farmer dashboard.`,
    data: {
      
      timestamp: new Date()
    }
  });
});
module.exports = router;