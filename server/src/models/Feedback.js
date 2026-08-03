const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject']
  },
  content: {
    type: String,
    required: [true, 'Please add description content']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
