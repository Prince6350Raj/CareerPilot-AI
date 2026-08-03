const express = require('express');
const { getProgress, toggleGoal } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, getProgress);
router.post('/goals/toggle', protect, toggleGoal);

module.exports = router;
