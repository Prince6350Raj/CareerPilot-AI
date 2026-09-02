const express = require('express');
const { getRandomChallenge, submitChallenge, getChallengeHistory } = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/history', protect, getChallengeHistory);
router.post('/generate', protect, getRandomChallenge);
router.post('/submit', protect, submitChallenge);

module.exports = router;
