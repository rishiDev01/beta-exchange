const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    averagePrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user has only one holding record per symbol
holdingSchema.index({ user: 1, symbol: 1 }, { unique: true });

const Holding = mongoose.model('Holding', holdingSchema);

module.exports = Holding;
