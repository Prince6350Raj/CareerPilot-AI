const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    avatarScale: {
      type: Number,
      default: 1
    },
    avatarX: {
      type: Number,
      default: 50
    },
    avatarY: {
      type: Number,
      default: 50
    },
    title: {
      type: String,
      default: ''
    },
    skills: [String],
    targetRoles: [String],
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior'],
      default: 'Entry'
    },
    github: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    },
    leetcode: {
      type: String,
      default: ''
    },
    portfolio: {
      type: String,
      default: ''
    }
  },
  streak: {
    count: { type: Number, default: 1 },
    lastLoginDate: { type: Date, default: Date.now }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate email verification token
UserSchema.methods.getVerificationToken = function () {
  const verifyToken = crypto.randomBytes(20).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');

  this.verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verifyToken;
};

module.exports = mongoose.model('User', UserSchema);
