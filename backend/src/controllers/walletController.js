const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// @desc    Get user wallet balance
// @route   GET /api/wallet
// @access  Private
const getWalletBalance = asyncHandler(async (req, res) => {
  let wallet = await Wallet.findOne({ user: req.user._id });

  if (!wallet) {
    wallet = await Wallet.create({ user: req.user._id, balance: 0 });
  }

  res.json(wallet);
});

// @desc    Add funds to wallet
// @route   POST /api/wallet/deposit
// @access  Private
const depositFunds = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid deposit amount');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let wallet = await Wallet.findOne({ user: req.user._id }).session(session);

    if (!wallet) {
      wallet = await Wallet.create([{ user: req.user._id, balance: 0 }], { session });
      wallet = wallet[0];
    }

    wallet.balance += Number(amount);
    await wallet.save({ session });

    const transaction = await Transaction.create(
      [
        {
          user: req.user._id,
          type: 'DEPOSIT',
          amount: Number(amount),
          status: 'COMPLETED',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      wallet,
      transaction: transaction[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500);
    throw new Error('Deposit failed: ' + error.message);
  }
});

// @desc    Get user transactions
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(transactions);
});

module.exports = {
  getWalletBalance,
  depositFunds,
  getTransactions,
};
