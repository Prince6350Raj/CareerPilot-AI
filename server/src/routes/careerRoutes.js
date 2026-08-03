const express = require('express');
const { recommendRoles, createRoadmap, getRoadmaps, getCompanyPrep, getChatbotResponse, getPortfolioReview } = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/recommend', protect, recommendRoles);
router.post('/roadmap', protect, createRoadmap);
router.get('/roadmaps', protect, getRoadmaps);
router.post('/prep', protect, getCompanyPrep);
router.post('/chatbot', protect, getChatbotResponse);
router.post('/portfolio-review', protect, getPortfolioReview);

module.exports = router;
