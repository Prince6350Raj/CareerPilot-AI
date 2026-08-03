const Feedback = require('../models/Feedback');

// @desc    Submit feedback/complaint
// @route   POST /api/feedback/submit
// @access  Private
exports.submitFeedback = async (req, res, next) => {
  try {
    const { subject, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ success: false, message: 'Please provide subject and content' });
    }

    const feedback = await Feedback.create({
      userId: req.user.id,
      subject,
      content
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you!',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};
