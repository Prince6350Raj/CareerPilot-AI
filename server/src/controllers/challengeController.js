const geminiService = require('../services/geminiService');
const Progress = require('../models/Progress');
const sendEmail = require('../utils/sendEmail');
const { logActivity } = require('../utils/activityLogger');

// @desc    Generate a random coding challenge based on difficulty & topic
// @route   POST /api/challenge/generate
// @access  Private
exports.getRandomChallenge = async (req, res, next) => {
  try {
    const { difficulty, topic } = req.body;

    if (!difficulty || !topic) {
      return res.status(400).json({ success: false, message: 'Please provide difficulty and topic' });
    }

    const challenge = await geminiService.generateCodingChallenge(difficulty, topic);
    res.status(200).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate candidate code submission
// @route   POST /api/challenge/submit
// @access  Private
exports.submitChallenge = async (req, res, next) => {
  try {
    const { problemTitle, problemStatement, userCode, language } = req.body;

    if (!problemTitle || !userCode || !language) {
      return res.status(400).json({ success: false, message: 'Please provide title, code, and language' });
    }

    const evaluation = await geminiService.evaluateCodeSubmission(
      problemTitle,
      problemStatement || '',
      userCode,
      language
    );

    // Update user gamification progress
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user.id });
    }

    // Badge unlock for Coding Challenge
    const hasCoderBadge = progress.badges.some(b => b.badgeId === 'coding_ninja');
    let badgeUnlocked = false;
    if (evaluation.isCorrect && !hasCoderBadge) {
      progress.badges.push({
        badgeId: 'coding_ninja',
        title: 'Coding Ninja',
        description: 'Successfully solved your first AI coding challenge.',
        icon: 'code'
      });
      badgeUnlocked = true;
      await progress.save();
    }

    // Trigger Nodemailer alert
    try {
      await sendEmail({
        email: req.user.email,
        subject: `CareerPilot AI - Coding Challenge Result: ${problemTitle}`,
        message: `Hello ${req.user.name}, your code score is ${evaluation.score}/100.`,
        html: `
          <h3>Coding Challenge Results Summary</h3>
          <p>Hi ${req.user.name},</p>
          <p>Your submission for <strong>${problemTitle}</strong> was evaluated:</p>
          <ul>
            <li><strong>Correctness:</strong> ${evaluation.isCorrect ? 'PASSED ✅' : 'FAILED ❌'}</li>
            <li><strong>Overall Score:</strong> ${evaluation.score} / 100</li>
            <li><strong>Time Complexity:</strong> ${evaluation.timeComplexity}</li>
            <li><strong>Space Complexity:</strong> ${evaluation.spaceComplexity}</li>
          </ul>
          <p>Log in to view optimal code examples and debug review logs!</p>
        `
      });
    } catch (mailErr) {
      console.error('Email notification failed for challenge submit:', mailErr);
    }

    await logActivity(req.user.id, 'Coding Challenge Submit', `Problem: ${problemTitle}, Lang: ${language}, Correctness: ${evaluation.isCorrect ? 'Correct' : 'Incorrect'}, Score: ${evaluation.score}/100`);

    res.status(200).json({
      success: true,
      data: evaluation,
      badgeUnlocked
    });
  } catch (error) {
    next(error);
  }
};
