const express = require('express');
const { uploadResume, getHistory, deleteResume, compareResumeToRole, generateCoverLetter, analyzeBuiltResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/analyze-built', protect, analyzeBuiltResume);
router.get('/history', protect, getHistory);
router.post('/compare-role', protect, compareResumeToRole);
router.post('/cover-letter', protect, generateCoverLetter);
router.delete('/:id', protect, deleteResume);

module.exports = router;
