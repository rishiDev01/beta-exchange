const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const Alert = require('../models/Alert');
const mongoose = require('mongoose');

const executePendingOrders = async (stocks) => {
  const pendingOrders = await Order.find({ status: 'PENDING' });

  for (const order of pendingOrders) {
    const stock = stocks.find((s) => s.symbol === order.symbol);
    if (!stock) continue;

    let shouldExecute = false;
    if (order.type === 'BUY') {
      if (stock.price <= order.price) {
        shouldExecute = true;
      }
    } else { // SELL
      if (stock.price >= order.price) {
        shouldExecute = true;
      }
    }

    if (shouldExecute) {
      await executeOrder(order, stock.price);
    }
  }
};

const checkAlerts = async (stocks) => {
  const pendingAlerts = await Alert.find({ status: 'PENDING' });

  for (const alert of pendingAlerts) {
    const stock = stocks.find((s) => s.symbol === alert.symbol);
    if (!stock) continue;

    let isTriggered = false;
    if (alert.condition === 'ABOVE') {
      if (stock.price >= alert.targetPrice) isTriggered = true;
    } else {
      if (alert.condition === 'BELOW') {
        if (stock.price <= alert.targetPrice) isTriggered = true;
      }
    }

    if (isTriggered) {
      alert.status = 'TRIGGERED';
      await alert.save();
      
      // Notify user via Socket.io
      const io = require('../config/socket').getIO();
      // Join user to a room named after their ID in socket.js if not already
      io.to(alert.user.toString()).emit('alertTriggered', {
        symbol: alert.symbol,
        price: stock.price,
        targetPrice: alert.targetPrice,
        condition: alert.condition
      });
    }
  }
};

const executeOrder = async (order, executionPrice) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ user: order.user }).session(session);
    const totalCost = executionPrice * order.quantity;

    if (order.type === 'BUY') {
      const originalBlockAmount = order.price * order.quantity;
      const refund = originalBlockAmount - totalCost;
      
      if (refund > 0) {
        wallet.balance += refund;
        await wallet.save({ session });
      }

      let holding = await Holding.findOne({ user: order.user, symbol: order.symbol }).session(session);
      if (holding) {
        const newTotalQuantity = holding.quantity + order.quantity;
        holding.averagePrice = (holding.averagePrice * holding.quantity + totalCost) / newTotalQuantity;
        holding.quantity = newTotalQuantity;
        await holding.save({ session });
      } else {
        await Holding.create([{ user: order.user, symbol: order.symbol, quantity: order.quantity, averagePrice: executionPrice }], { session });
      }

      order.status = 'EXECUTED';
      order.executionPrice = executionPrice;
      await order.save({ session });

      await Transaction.create(
        [{ user: order.user, type: 'BUY_ORDER', amount: totalCost, status: 'COMPLETED', referenceId: order._id }],
        { session }
      );
    } else { // SELL
      wallet.balance += totalCost;
      await wallet.save({ session });

      order.status = 'EXECUTED';
      order.executionPrice = executionPrice;
      await order.save({ session });

      await Transaction.create(
        [{ user: order.user, type: 'SELL_ORDER', amount: totalCost, status: 'COMPLETED', referenceId: order._id }],
        { session }
      );
    }

    await session.commitTransaction();

    // Emit real-time trade event
    const io = require('../config/socket').getIO();
    io.emit('newTrade', {
      symbol: order.symbol,
      type: order.type,
      quantity: order.quantity,
      price: executionPrice,
      time: new Date()
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(`Failed to execute order ${order._id}:`, error.message);
  } finally {
    session.endSession();
  }
};

module.exports = { executePendingOrders, checkAlerts };
