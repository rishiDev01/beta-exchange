const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validateMiddleware');
const {
  getWalletBalance,
  depositFunds,
  withdrawFunds,
  getTransactions,
} = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWalletBalance);

router.post(
  '/deposit',
  protect,
  validate([
    body('amount').isFloat({ min: 0.01 }).withMessage('Deposit amount must be at least 0.01'),
  ]),
  depositFunds
);

router.post(
  '/withdraw',
  protect,
  validate([
    body('amount').isFloat({ min: 0.01 }).withMessage('Withdrawal amount must be at least 0.01'),
  ]),
  withdrawFunds
);

router.get('/transactions', protect, getTransactions);

module.exports = router;
