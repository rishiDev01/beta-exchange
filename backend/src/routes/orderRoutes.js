const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validateMiddleware');
const {
  placeOrder,
  getOrders,
  getHoldings,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(
    protect,
    validate([
      body('symbol').notEmpty().withMessage('Symbol is required'),
      body('type').isIn(['BUY', 'SELL']).withMessage('Type must be BUY or SELL'),
      body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
      body('orderType').isIn(['MARKET', 'LIMIT']).withMessage('Order type must be MARKET or LIMIT'),
      body('price').isFloat({ min: 0.01 }).withMessage('Price must be at least 0.01'),
    ]),
    placeOrder
  )
  .get(protect, getOrders);

router.get('/holdings', protect, getHoldings);
router.delete('/:id', protect, cancelOrder);

module.exports = router;
