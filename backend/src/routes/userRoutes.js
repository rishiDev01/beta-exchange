const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validateMiddleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth routes
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});

const {
  authUser,
  registerUser,
  getUserProfile,
  getLeaderboard,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post(
  '/',
  authLimiter,
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ]),
  registerUser
);

router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authUser
);

router.get('/profile', protect, getUserProfile);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
