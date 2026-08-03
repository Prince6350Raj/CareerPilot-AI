const express = require('express');
const { getRandomChallenge, submitChallenge } = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', protect, getRandomChallenge);
router.post('/submit', protect, submitChallenge);

module.exports = router;
