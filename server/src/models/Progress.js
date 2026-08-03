const mongoose = require('mongoose');

const DailyGoalSchema = new mongoose.Schema({
  goalText: { type: String, required: true },
  completed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

const BadgeSchema = new mongoose.Schema({
  badgeId: { type: String, required: true }, // e.g. "ats_80", "roadmap_gen", "streak_7"
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'award' },
  unlockedAt: { type: Date, default: Date.now }
});

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dailyStreak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  dailyGoals: [DailyGoalSchema],
  badges: [BadgeSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Progress', ProgressSchema);
