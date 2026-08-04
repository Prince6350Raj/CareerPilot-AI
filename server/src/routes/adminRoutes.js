const express = require('express');
const { getUsers, getAnalytics, getFeedbacks } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', protect, authorize('admin'), getUsers);
router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/feedbacks', protect, authorize('admin'), getFeedbacks);

module.exports = router;
