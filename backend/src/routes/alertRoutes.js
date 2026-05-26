const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validateMiddleware');
const Alert = require('../models/Alert');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all user alerts
// @route   GET /api/alerts
// @access  Private
const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(alerts);
});

// @desc    Create a new alert
// @route   POST /api/alerts
// @access  Private
const createAlert = asyncHandler(async (req, res) => {
  const { symbol, targetPrice, condition } = req.body;

  const alert = await Alert.create({
    user: req.user._id,
    symbol: symbol.toUpperCase(),
    targetPrice,
    condition,
  });

  res.status(201).json(alert);
});

// @desc    Delete an alert
// @route   DELETE /api/alerts/:id
// @access  Private
const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }

  if (alert.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await alert.deleteOne();
  res.json({ message: 'Alert removed' });
});

router.route('/')
  .get(protect, getAlerts)
  .post(
    protect,
    validate([
      body('symbol').notEmpty().withMessage('Symbol is required'),
      body('targetPrice').isFloat({ min: 0.01 }).withMessage('Target price must be at least 0.01'),
      body('condition').isIn(['ABOVE', 'BELOW']).withMessage('Condition must be ABOVE or BELOW'),
    ]),
    createAlert
  );

router.delete('/:id', protect, deleteAlert);

module.exports = router;
