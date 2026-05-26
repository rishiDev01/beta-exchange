const asyncHandler = require('express-async-handler');
const Watchlist = require('../models/Watchlist');
const { trackStock } = require('../services/marketService');

// @desc    Get user watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = asyncHandler(async (req, res) => {
  let watchlist = await Watchlist.findOne({ user: req.user._id });

  if (!watchlist) {
    // Return empty symbols array instead of creating default stocks for new users
    // This gives users full control over their watchlist
    watchlist = await Watchlist.create({
      user: req.user._id,
      symbols: [],
    });
  }

  res.json(watchlist);
});

// @desc    Add stock to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = asyncHandler(async (req, res) => {
  const { symbol } = req.body;

  if (!symbol) {
    res.status(400);
    throw new Error('Symbol is required');
  }

  const normalizedSymbol = symbol.toUpperCase();
  let watchlist = await Watchlist.findOne({ user: req.user._id });

  if (!watchlist) {
    watchlist = new Watchlist({ user: req.user._id, symbols: [] });
  }

  if (watchlist.symbols.includes(normalizedSymbol)) {
    return res.status(200).json(watchlist); // Already in watchlist, return early
  }

  // Ensure stock is tracked by market service
  await trackStock(normalizedSymbol);

  watchlist.symbols.push(normalizedSymbol);
  await watchlist.save();

  res.status(201).json(watchlist);
});

// @desc    Remove stock from watchlist
// @route   DELETE /api/watchlist/:symbol
// @access  Private
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  let watchlist = await Watchlist.findOne({ user: req.user._id });

  if (!watchlist) {
    res.status(404);
    throw new Error('Watchlist not found');
  }

  watchlist.symbols = watchlist.symbols.filter(
    (s) => s !== symbol.toUpperCase()
  );
  await watchlist.save();

  res.json(watchlist);
});

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
