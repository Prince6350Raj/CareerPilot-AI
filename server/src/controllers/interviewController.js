const Interview = require('../models/Interview');
const Progress = require('../models/Progress');
const User = require('../models/User');
const geminiService = require('../services/geminiService');
const { logActivity } = require('../utils/activityLogger');

// @desc    Start mock interview session
// @route   POST /api/interview/start
// @access  Private
exports.startInterview = async (req, res, next) => {
  try {
    const { role, type, limit, format } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Please provide a target role for the interview' });
    }

    const questionLimit = parseInt(limit, 10) || 5;
    const sessionFormat = format || 'theory';

    // Retrieve user skills context (AI Memory)
    const user = await User.findById(req.user.id);
    const userSkills = user?.profile?.skills || [];

    // Call Gemini API to generate requested number of questions
    const generatedQuestions = await geminiService.generateInterviewQuestions(
      role, 
      type || 'Mixed', 
      questionLimit, 
      sessionFormat,
      userSkills
    );

    // Structure questions for MongoDB
    const questions = generatedQuestions.map(q => ({
      questionText: q.questionText,
      category: q.category || 'General',
      userAnswer: '',
      feedback: '',
      rating: 0,
      modelAnswer: q.modelAnswer || '',
      options: q.options || [],
      correctOption: q.correctOption || ''
    }));

    // Create interview record
    const interview = await Interview.create({
      userId: req.user.id,
      role,
      type: type || 'Mixed',
      format: sessionFormat,
      questions
    });

    await logActivity(req.user.id, 'Mock Interview Start', `Role: ${role}, Category: ${type || 'Mixed'}, Format: ${sessionFormat}`);

    res.status(201).json({
      success: true,
      message: 'Interview session initialized',
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answer for a specific question inside an interview
// @route   POST /api/interview/submit-answer
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { interviewId, questionId, userAnswer } = req.body;

    if (!interviewId || !questionId || userAnswer === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide interviewId, questionId, and userAnswer' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    // Verify ownership
    if (interview.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this record' });
    }

    // Find the question
    const questionIndex = interview.questions.findIndex(q => q._id.toString() === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Question not found inside this interview' });
    }

    const question = interview.questions[questionIndex];

    // Grade the answer (Instant check for MCQs, Gemini AI for Subjective/Theory)
    let grading;
    if (interview.format === 'mcq') {
      const isCorrect = userAnswer.trim().toUpperCase() === question.correctOption.toUpperCase();
      grading = {
        rating: isCorrect ? 5 : 0,
        feedback: isCorrect 
          ? 'Correct! You selected the right option.' 
          : `Incorrect. You selected option ${userAnswer.toUpperCase()}, but the correct option is ${question.correctOption}.`,
        modelAnswer: question.modelAnswer || `Correct option is ${question.correctOption}`
      };
    } else {
      grading = await geminiService.gradeInterviewAnswer(question.questionText, userAnswer);
    }

    // Update fields
    question.userAnswer = userAnswer;
    question.feedback = grading.feedback;
    question.rating = grading.rating;
    question.modelAnswer = grading.modelAnswer;

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Answer graded successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete interview session & calculate overall scores
// @route   POST /api/interview/complete
// @access  Private
exports.completeInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ success: false, message: 'Please provide interviewId' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    // Verify ownership
    if (interview.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this record' });
    }

    // Calculate score based on format weight
    const totalQuestions = interview.questions.length || 1;
    const maxRatingPerQuestion = interview.format === 'mcq' ? 5 : 10;
    
    // Sum all ratings (do not filter out 0 ratings)
    const sumRatings = interview.questions.reduce((sum, q) => sum + (q.rating || 0), 0);
    const maxPossibleRatings = totalQuestions * maxRatingPerQuestion;

    // Scale overallScore to 0-10 to fit visual UI expectations
    const overallScore = (sumRatings / maxPossibleRatings) * 10;

    // Summarize feedback based on the scaled score (percentage = overallScore * 10)
    let summaryFeedback = '';
    if (overallScore >= 8.5) {
      summaryFeedback = 'Exceptional performance. Gold Grade achieved! You displayed mastery of both core definitions and technical execution details.';
    } else if (overallScore >= 7.0) {
      summaryFeedback = 'Silver Grade. Strong technical knowledge and high accuracy. A few minor optimizations will make you a top candidate.';
    } else if (overallScore >= 6.0) {
      summaryFeedback = 'Bronze Grade. Good basic knowledge. Review advanced design patterns and algorithmic optimization points to reach the next tier.';
    } else if (overallScore >= 4.0) {
      summaryFeedback = 'Fair performance. You passed the test, but have significant conceptual gaps. Re-read documentation resources to improve your accuracy.';
    } else {
      summaryFeedback = 'Needs improvement. You did not cross the 40% passing threshold. Please review the key concepts, retry the assessment, and try again.';
    }

    interview.overallScore = overallScore;
    interview.summaryFeedback = summaryFeedback;
    await interview.save();

    // Check progress & badge unlocks
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user.id });
    }

    let badgeUnlocked = false;
    // Badge 1: Completed first interview
    const hasInterviewBadge = progress.badges.some(b => b.badgeId === 'first_interview');
    if (!hasInterviewBadge) {
      progress.badges.push({
        badgeId: 'first_interview',
        title: 'Interview Beginner',
        description: 'Successfully finished your first full length mock interview.',
        icon: 'message-square'
      });
      badgeUnlocked = true;
    }

    // Badge 2: High score interview (rating >= 8)
    const hasAceBadge = progress.badges.some(b => b.badgeId === 'interview_ace');
    if (overallScore >= 8 && !hasAceBadge) {
      progress.badges.push({
        badgeId: 'interview_ace',
        title: 'Interview Ace',
        description: 'Completed a mock interview with an average score of 8/10 or higher.',
        icon: 'award'
      });
      badgeUnlocked = true;
    }

    if (badgeUnlocked) {
      await progress.save();
    }

    await logActivity(req.user.id, 'Mock Interview Finish', `Role: ${interview.role}, Score: ${overallScore.toFixed(1)}/10, Medal: ${medal.toUpperCase()}`);

    res.status(200).json({
      success: true,
      message: 'Interview completed and graded successfully',
      data: interview,
      badgeUnlocked
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview history
// @route   GET /api/interview/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const history = await Interview.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};
