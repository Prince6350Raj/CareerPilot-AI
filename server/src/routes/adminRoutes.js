const express = require('express');
const { getUsers, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', protect, authorize('admin'), getUsers);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

module.exports = router;
