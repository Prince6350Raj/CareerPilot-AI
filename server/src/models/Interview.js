const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  category: { type: String, default: 'General' }, // e.g. Technical, HR, Coding
  userAnswer: { type: String, default: '' },
  feedback: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  modelAnswer: { type: String, default: '' },
  options: [{ type: String }], // Optional choices for MCQ format
  correctOption: { type: String, default: '' } // Correct selection ('A', 'B', 'C', 'D')
});

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Technical', 'Behavioral', 'Mixed'],
    default: 'Mixed'
  },
  format: {
    type: String,
    enum: ['theory', 'mcq'],
    default: 'theory'
  },
  questions: [QuestionSchema],
  overallScore: {
    type: Number,
    default: 0
  },
  summaryFeedback: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', InterviewSchema);
