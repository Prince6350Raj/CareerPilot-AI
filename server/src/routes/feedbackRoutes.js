const express = require('express');
const { submitFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/submit', protect, submitFeedback);

module.exports = router;
