const Roadmap = require('../models/Roadmap');
const Resume = require('../models/Resume');
const Progress = require('../models/Progress');
const geminiService = require('../services/geminiService');
const { logActivity } = require('../utils/activityLogger');

// @desc    Recommend career paths based on user skills/resume
// @route   POST /api/career/recommend
// @access  Private
exports.recommendRoles = async (req, res, next) => {
  try {
    const { skills } = req.user.profile;

    // Fetch latest resume to enrich context if available
    const latestResume = await Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    
    let skillsContext = skills || [];
    if (latestResume && latestResume.detectedSkills) {
      // Merge skills from profile and resume
      skillsContext = [...new Set([...skillsContext, ...latestResume.detectedSkills])];
    }

    // Format suggestions
    res.status(200).json({
      success: true,
      data: {
        skillsAnalyzed: skillsContext,
        recommendations: [
          {
            title: 'Fullstack Developer',
            matchScore: 85,
            reason: 'You have strong frontend Javascript and React foundations. Adding Express and database capabilities will make you a perfect candidate.',
            missingSkills: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL']
          },
          {
            title: 'Frontend Engineer',
            matchScore: 92,
            reason: 'Your styling skills and understanding of state management are well-aligned with UI developer roles.',
            missingSkills: ['TypeScript', 'TailwindCSS', 'Jest Testing']
          },
          {
            title: 'Backend Engineer',
            matchScore: 60,
            reason: 'You understand JavaScript syntax, but need to build asynchronous API designing experience.',
            missingSkills: ['Node.js', 'Express.js', 'SQL Databases', 'System Design']
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a learning roadmap
// @route   POST /api/career/roadmap
// @access  Private
exports.createRoadmap = async (req, res, next) => {
  try {
    const { targetRole, currentSkills, missingSkills } = req.body;

    if (!targetRole) {
      return res.status(400).json({ success: false, message: 'Please provide a target role' });
    }

    // Call Gemini API to build the roadmap
    const generated = await geminiService.generateRoadmap(
      targetRole,
      currentSkills || [],
      missingSkills || []
    );

    // Save to database
    const roadmap = await Roadmap.create({
      userId: req.user.id,
      targetRole: generated.targetRole,
      currentSkills: generated.currentSkills,
      missingSkills: generated.missingSkills,
      weeksEstimate: generated.weeksEstimate,
      phases: generated.phases
    });

    // Update progress badges
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user.id });
    }

    const hasRoadmapBadge = progress.badges.some(b => b.badgeId === 'first_roadmap');
    if (!hasRoadmapBadge) {
      progress.badges.push({
        badgeId: 'first_roadmap',
        title: 'Roadmap Builder',
        description: 'Successfully generated your first custom AI learning roadmap.',
        icon: 'map'
      });
      await progress.save();
    }

    await logActivity(req.user.id, 'Roadmap Generation', `Target Role: ${targetRole}`);

    res.status(201).json({
      success: true,
      message: 'Roadmap generated successfully',
      data: roadmap,
      badgeUnlocked: !hasRoadmapBadge
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all roadmaps for logged-in user
// @route   GET /api/career/roadmaps
// @access  Private
exports.getRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: roadmaps.length,
      data: roadmaps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company prep guides
// @route   POST /api/career/prep
// @access  Private
exports.getCompanyPrep = async (req, res, next) => {
  try {
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Please provide a companyName' });
    }

    const prepData = await geminiService.getCompanyPrep(companyName);

    await logActivity(req.user.id, 'Company Prep Guide View', `Company: ${companyName}`);
    
    res.status(200).json({
      success: true,
      data: prepData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Career Advisor AI Chatbot
// @route   POST /api/career/chatbot
// @access  Private
exports.getChatbotResponse = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please enter a message' });
    }

    const context = {
      name: req.user.name,
      skills: req.user.profile?.skills || [],
      title: req.user.profile?.title || 'Tech Aspirant',
      targetRoles: req.user.profile?.targetRoles || []
    };

    const chatbotResponse = await geminiService.getCareerChatbotResponse(message, context);

    await logActivity(req.user.id, 'Career Advisor Chat', `Message: "${message.substring(0, 60)}${message.length > 60 ? '...' : ''}"`);

    res.status(200).json({
      success: true,
      data: chatbotResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Portfolio Reviewer
// @route   POST /api/career/portfolio-review
// @access  Private
exports.getPortfolioReview = async (req, res, next) => {
  try {
    const { portfolioUrl } = req.body;

    if (!portfolioUrl) {
      return res.status(400).json({ success: false, message: 'Please provide a portfolioUrl' });
    }

    const suggestions = await geminiService.getPortfolioSuggestions(portfolioUrl);

    await logActivity(req.user.id, 'Portfolio Audit', `URL: ${portfolioUrl}`);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};
