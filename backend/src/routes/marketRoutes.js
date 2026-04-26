const express = require('express');
const router = express.Router();
const { stocks, getHistoricalData } = require('../services/marketService');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all stocks initial data
// @route   GET /api/market/stocks
// @access  Private
router.get('/stocks', protect, (req, res) => {
  res.json(stocks);
});

// @desc    Get historical data for a stock
// @route   GET /api/market/history/:symbol
// @access  Private
router.get('/history/:symbol', protect, async (req, res) => {
  try {
    const data = await getHistoricalData(req.params.symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

module.exports = router;
