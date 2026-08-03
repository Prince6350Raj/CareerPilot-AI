const Progress = require('../models/Progress');

// @desc    Get user progress dashboard metrics
// @route   GET /api/progress/dashboard
// @access  Private
exports.getProgress = async (req, res, next) => {
  try {
    let progress = await Progress.findOne({ userId: req.user.id });

    if (!progress) {
      // Create initial progress state
      progress = await Progress.create({
        userId: req.user.id,
        dailyStreak: 1,
        lastActive: new Date(),
        dailyGoals: [
          { goalText: 'Upload a PDF Resume for ATS check', completed: false, date: new Date() },
          { goalText: 'Generate a career Roadmap', completed: false, date: new Date() },
          { goalText: 'Complete a Mock Interview session', completed: false, date: new Date() }
        ],
        badges: []
      });
    } else {
      // Check and update streak
      const today = new Date();
      const lastActive = new Date(progress.lastActive);

      // Strip time parts to compare dates
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

      const diffTime = todayDate - lastActiveDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active yesterday, increment streak
        progress.dailyStreak += 1;
        progress.lastActive = today;

        // Check if streak badge is unlocked
        const streakBadges = [
          { days: 3, id: 'streak_3', title: 'Streak Explorer', desc: 'Maintained a daily login streak for 3 days.' },
          { days: 7, id: 'streak_7', title: 'Streak Veteran', desc: 'Maintained a daily login streak for 7 days.' }
        ];

        for (const sb of streakBadges) {
          if (progress.dailyStreak >= sb.days && !progress.badges.some(b => b.badgeId === sb.id)) {
            progress.badges.push({
              badgeId: sb.id,
              title: sb.title,
              description: sb.desc,
              icon: 'flame'
            });
          }
        }
      } else if (diffDays > 1) {
        // Broke streak, reset to 1
        progress.dailyStreak = 1;
        progress.lastActive = today;
      }

      // Check if daily goals date is older than today, reset goals
      const goalsDate = progress.dailyGoals.length > 0 ? new Date(progress.dailyGoals[0].date) : new Date(0);
      const goalsDateStrip = new Date(goalsDate.getFullYear(), goalsDate.getMonth(), goalsDate.getDate());

      if (todayDate > goalsDateStrip) {
        // It's a new day, clear and reset daily goals
        progress.dailyGoals = [
          { goalText: 'Analyze another Resume version', completed: false, date: today },
          { goalText: 'Review your personalized Roadmap phase', completed: false, date: today },
          { goalText: 'Practice mock technical questions', completed: false, date: today }
        ];
      }

      await progress.save();
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle a daily goal completion
// @route   POST /api/progress/goals/toggle
// @access  Private
exports.toggleGoal = async (req, res, next) => {
  try {
    const { goalId } = req.body;

    if (!goalId) {
      return res.status(400).json({ success: false, message: 'Please specify goalId' });
    }

    const progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress profile not found' });
    }

    const goal = progress.dailyGoals.id(goalId);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Daily goal item not found' });
    }

    goal.completed = !goal.completed;
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Goal status toggled successfully',
      data: progress
    });
  } catch (error) {
    next(error);
  }
};
