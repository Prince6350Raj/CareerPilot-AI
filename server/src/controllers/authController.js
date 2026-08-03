const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const generateToken = require('../utils/token');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    user = new User({
      name,
      email,
      password
    });

    // Generate email verification token
    const verificationToken = user.getVerificationToken();

    await user.save();

    // Create verification URL
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

    const message = `Welcome to CareerPilot AI, ${name}!\n\nPlease verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.`;
    const html = `
      <h3>Welcome to CareerPilot AI, ${name}!</h3>
      <p>Please click the button below to verify your account:</p>
      <a href="${verificationUrl}" style="background-color:#5b21b6; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Verify Email</a>
      <p>Or paste this link into your browser:</p>
      <p>${verificationUrl}</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your CareerPilot AI Account',
        message,
        html
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Verification email sent.'
      });
    } catch (err) {
      // If email fails, rollback user creation
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ success: false, message: 'Email could not be sent. Registration cancelled.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    // Hash token from request to match DB
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken,
      verificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email successfully verified. You can now log in.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if email verified
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email to log in.' });
    }

    // Send JWT token
    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You requested a password reset. Please click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;
    const html = `
      <h3>Password Reset Request</h3>
      <p>Please click the button below to reset your password:</p>
      <a href="${resetUrl}" style="background-color:#5b21b6; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Reset Password</a>
      <p>Or paste this link into your browser:</p>
      <p>${resetUrl}</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'CareerPilot AI - Password Reset Request',
        message,
        html
      });

      res.status(200).json({ success: true, message: 'Email sent with reset instructions.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Hash token from request to check database
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    next(error);
  }
};
