const express = require('express');
const {
  register,
  verifyEmail,
  login,
  guestLogin,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/guest-login', guestLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
