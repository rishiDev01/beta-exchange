const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getOrders,
  getHoldings,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, placeOrder).get(protect, getOrders);
router.get('/holdings', protect, getHoldings);

module.exports = router;
