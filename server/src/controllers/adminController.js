const User = require('../models/User');
const Resume = require('../models/Resume');
const Roadmap = require('../models/Roadmap');
const Interview = require('../models/Interview');
const Feedback = require('../models/Feedback');

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform global analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments({});
    const resumeCount = await Resume.countDocuments({});
    const roadmapCount = await Roadmap.countDocuments({});
    const interviewCount = await Interview.countDocuments({});
    const feedbackCount = await Feedback.countDocuments({});

    // Active Users (logged in within 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      $or: [
        { 'streak.lastLoginDate': { $gt: sevenDaysAgo } },
        { createdAt: { $gt: sevenDaysAgo } }
      ]
    }) || 1;

    // Aggregating for average ATS scores
    const resumes = await Resume.find({}).select('atsScore');
    const totalATS = resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0);
    const averageATS = resumes.length > 0 ? Math.round(totalATS / resumes.length) : 0;

    // Aggregating for average interview score
    const completedInterviews = await Interview.find({ overallScore: { $exists: true } }).select('overallScore');
    const totalInterview = completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0);
    const averageInterview = completedInterviews.length > 0 ? parseFloat((totalInterview / completedInterviews.length).toFixed(1)) : 0.0;

    // Certificates issued (Mock Interview score >= 4.0 passing limit)
    const certificatesIssued = await Interview.countDocuments({ overallScore: { $gte: 4.0 } });

    // Most Selected Career Role (dynamic aggregate)
    const careerAggregation = await Roadmap.aggregate([
      { $group: { _id: '$targetRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const mostSelectedCareer = careerAggregation.length > 0 ? careerAggregation[0]._id : 'Fullstack Developer';

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: userCount,
          activeUsers,
          resumes: resumeCount,
          roadmaps: roadmapCount,
          interviews: interviewCount,
          feedbacks: feedbackCount,
          certificatesIssued
        },
        averages: {
          atsScore: averageATS,
          interviewScore: averageInterview
        },
        popular: {
          mostSelectedCareer,
          mostViewedResource: 'React/DSA Documentation'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
