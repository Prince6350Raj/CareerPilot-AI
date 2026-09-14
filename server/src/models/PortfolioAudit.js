const mongoose = require('mongoose');

const PortfolioAuditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  portfolioUrl: {
    type: String,
    required: true
  },
  urlHash: {
    type: String,
    index: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  readmeAdvice: [String],
  projectAdvice: [String],
  uiAdvice: [String],
  seoAdvice: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PortfolioAudit', PortfolioAuditSchema);
