const express = require('express');
const router = express.Router();
const {
  getWalletBalance,
  depositFunds,
  getTransactions,
} = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWalletBalance);
router.post('/deposit', protect, depositFunds);
router.get('/transactions', protect, getTransactions);

module.exports = router;
