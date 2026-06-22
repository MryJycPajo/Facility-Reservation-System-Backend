const express = require('express');
const router = express.Router();

// Pending reservations count
router.get('/pending-count', async (req, res) => {
  try {
    // Temporary response
    res.json({
      count: 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// Recent confirmed reservations
router.get('/recent-confirmed', async (req, res) => {
  try {
    // Temporary response
    res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;