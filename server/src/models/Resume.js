const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String
  },
  parsedText: {
    type: String
  },
  atsScore: {
    type: Number,
    min: 0,
    max: 100
  },
  breakdown: {
    formatting: { type: Number, default: 0 },
    impactPhrases: { type: Number, default: 0 },
    keywordMatch: { type: Number, default: 0 },
    redundancies: { type: Number, default: 0 }
  },
  detectedSkills: [String],
  suggestedSkills: [String],
  feedback: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', ResumeSchema);
