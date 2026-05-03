const express = require('express');
const router = express.Router();
const { stocks, getHistoricalData, searchStocks, getQuote, trackStock } = require('../services/marketService');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all stocks initial data
// @route   GET /api/market/stocks
// @access  Private
router.get('/stocks', protect, (req, res) => {
  res.json(stocks);
});

// @desc    Add a stock to the tracking list
// @route   POST /api/market/track
// @access  Private
router.post('/track', protect, async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ message: 'Symbol is required' });
    
    const stock = await trackStock(symbol);
    if (stock) {
      res.json(stock);
    } else {
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error tracking stock' });
  }
});

// @desc    Search for stocks
// @route   GET /api/market/search?q=query
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const results = await searchStocks(req.query.q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error searching stocks' });
  }
});

// @desc    Get current quote for a stock
// @route   GET /api/market/quote/:symbol
// @access  Private
router.get('/quote/:symbol', protect, async (req, res) => {
  try {
    const quote = await getQuote(req.params.symbol);
    if (quote) {
      res.json(quote);
    } else {
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quote' });
  }
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
