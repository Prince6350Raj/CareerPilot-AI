const User = require('../models/User');
const Resume = require('../models/Resume');
const Roadmap = require('../models/Roadmap');
const Interview = require('../models/Interview');
const Feedback = require('../models/Feedback');
const ActivityLog = require('../models/ActivityLog');

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
    const resumes = await Resume.find({})
      .populate('userId', 'name email')
      .select('atsScore userId createdAt')
      .sort({ atsScore: -1 });

    const totalATS = resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0);
    const averageATS = resumes.length > 0 ? Math.round(totalATS / resumes.length) : 0;
    const atsScoreList = resumes.slice(0, 10).map(r => ({
      userName: r.userId?.name || 'Unknown',
      userEmail: r.userId?.email || 'N/A',
      score: r.atsScore,
      date: r.createdAt
    }));

    // Aggregating for average interview score
    const completedInterviews = await Interview.find({ overallScore: { $exists: true } })
      .populate('userId', 'name email')
      .select('overallScore role updatedAt')
      .sort({ overallScore: -1 });

    const totalInterview = completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0);
    const averageInterview = completedInterviews.length > 0 ? parseFloat((totalInterview / completedInterviews.length).toFixed(1)) : 0.0;
    
    const interviewScoreList = completedInterviews.slice(0, 10).map(i => ({
      userName: i.userId?.name || 'Unknown',
      userEmail: i.userId?.email || 'N/A',
      role: i.role,
      score: i.overallScore,
      date: i.updatedAt
    }));

    // Certificates issued (Mock Interview score >= 4.0 passing limit)
    const certificatesList = completedInterviews
      .filter(i => i.overallScore >= 4.0)
      .map(i => ({
        id: i._id,
        userName: i.userId?.name || 'Unknown',
        userEmail: i.userId?.email || 'N/A',
        role: i.role,
        score: i.overallScore,
        date: i.updatedAt
      }));
    const certificatesIssued = certificatesList.length;

    // Most Selected Career Role (dynamic aggregate)
    const careerAggregation = await Roadmap.aggregate([
      { $group: { _id: '$targetRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const mostSelectedCareer = careerAggregation.length > 0 ? careerAggregation[0]._id : 'Fullstack Developer';
    const popularRolesList = careerAggregation.map(c => ({
      role: c._id,
      count: c.count
    }));

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
        },
        details: {
          atsScoreList,
          interviewScoreList,
          certificatesList,
          popularRolesList
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedbacks
// @route   GET /api/admin/feedbacks
// @access  Private/Admin
exports.getFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest user activity logs
// @route   GET /api/admin/activities
// @access  Private/Admin
exports.getActivities = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({})
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
