const express = require('express');
const { startInterview, submitAnswer, completeInterview, getHistory } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/start', protect, startInterview);
router.post('/submit-answer', protect, submitAnswer);
router.post('/complete', protect, completeInterview);
router.get('/history', protect, getHistory);

module.exports = router;
