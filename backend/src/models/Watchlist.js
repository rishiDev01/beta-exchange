const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    symbols: [
      {
        type: String,
        required: true,
        uppercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
