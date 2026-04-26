const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const { stocks } = require('../services/marketService');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = asyncHandler(async (req, res) => {
  const { symbol, type, quantity, orderType, price: limitPrice } = req.body;

  const stock = stocks.find((s) => s.symbol === symbol);
  if (!stock) {
    res.status(400);
    throw new Error('Invalid stock symbol');
  }

  const currentPrice = stock.price;
  const executionPrice = orderType === 'LIMIT' ? limitPrice : currentPrice;
  const totalCost = executionPrice * quantity;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).session(session);

    if (type === 'BUY') {
      if (!wallet || wallet.balance < totalCost) {
        throw new Error('Insufficient funds');
      }

      // Deduct balance
      wallet.balance -= totalCost;
      await wallet.save({ session });

      // Create Order
      const order = await Order.create(
        [{ user: req.user._id, symbol, type, quantity, orderType, price: executionPrice, status: 'EXECUTED' }],
        { session }
      );

      // Update Holdings
      let holding = await Holding.findOne({ user: req.user._id, symbol }).session(session);
      if (holding) {
        const newTotalQuantity = holding.quantity + Number(quantity);
        holding.averagePrice = (holding.averagePrice * holding.quantity + totalCost) / newTotalQuantity;
        holding.quantity = newTotalQuantity;
        await holding.save({ session });
      } else {
        await Holding.create([{ user: req.user._id, symbol, quantity, averagePrice: executionPrice }], { session });
      }

      // Record Transaction
      await Transaction.create(
        [{ user: req.user._id, type: 'BUY_ORDER', amount: totalCost, status: 'COMPLETED', referenceId: order[0]._id }],
        { session }
      );

      await session.commitTransaction();
      res.status(201).json(order[0]);
    } else {
      // SELL logic
      const holding = await Holding.findOne({ user: req.user._id, symbol }).session(session);
      if (!holding || holding.quantity < quantity) {
        throw new Error('Insufficient holdings');
      }

      holding.quantity -= Number(quantity);
      if (holding.quantity === 0) {
        await Holding.deleteOne({ _id: holding._id }).session(session);
      } else {
        await holding.save({ session });
      }

      wallet.balance += totalCost;
      await wallet.save({ session });

      const order = await Order.create(
        [{ user: req.user._id, symbol, type, quantity, orderType, price: executionPrice, status: 'EXECUTED' }],
        { session }
      );

      await Transaction.create(
        [{ user: req.user._id, type: 'SELL_ORDER', amount: totalCost, status: 'COMPLETED', referenceId: order[0]._id }],
        { session }
      );

      await session.commitTransaction();
      res.status(201).json(order[0]);
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(400);
    throw new Error(error.message);
  } finally {
    session.endSession();
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get user holdings
// @route   GET /api/orders/holdings
// @access  Private
const getHoldings = asyncHandler(async (req, res) => {
  const holdings = await Holding.find({ user: req.user._id });
  res.json(holdings);
});

module.exports = {
  placeOrder,
  getOrders,
  getHoldings,
};
