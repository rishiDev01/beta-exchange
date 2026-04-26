const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    symbol: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['BUY', 'SELL'],
    },
    orderType: {
      type: String,
      required: true,
      enum: ['MARKET', 'LIMIT'],
      default: 'MARKET',
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number, // Price at which order was placed or limit price
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'EXECUTED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
