const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Holding = require('../models/Holding');
const { stocks } = require('../services/marketService');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('name');
  const leaderboard = [];

  for (const user of users) {
    const wallet = await Wallet.findOne({ user: user._id });
    const holdings = await Holding.find({ user: user._id });
    
    let portfolioValue = 0;
    holdings.forEach(h => {
      const currentPrice = stocks.find(s => s.symbol === h.symbol)?.price || h.averagePrice;
      portfolioValue += currentPrice * h.quantity;
    });

    leaderboard.push({
      _id: user._id,
      name: user.name,
      totalValue: (wallet ? wallet.balance : 0) + portfolioValue,
      cash: wallet ? wallet.balance : 0,
      holdingsValue: portfolioValue
    });
  }

  res.json(leaderboard.sort((a, b) => b.totalValue - a.totalValue));
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  getLeaderboard,
};
