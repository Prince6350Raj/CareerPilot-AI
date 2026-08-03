const User = require('../models/User');

// @desc    Get logged in user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Dynamic Daily Login Streak Logic
    const today = new Date();
    const lastLogin = user.streak?.lastLoginDate ? new Date(user.streak.lastLoginDate) : null;
    let currentStreak = user.streak?.count || 1;

    if (lastLogin) {
      const isSameDay = today.toDateString() === lastLogin.toDateString();
      if (!isSameDay) {
        const diffTime = Math.abs(today - lastLogin);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
        user.streak = {
          count: currentStreak,
          lastLoginDate: today
        };
        await user.save();
      }
    } else {
      user.streak = {
        count: 1,
        lastLoginDate: today
      };
      await user.save();
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        streak: user.streak || { count: 1, lastLoginDate: today },
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, title, skills, targetRoles, experienceLevel, avatar } = req.body;

    const profileUpdates = {};
    if (title !== undefined) profileUpdates.title = title;
    if (skills !== undefined) profileUpdates.skills = skills;
    if (targetRoles !== undefined) profileUpdates.targetRoles = targetRoles;
    if (experienceLevel !== undefined) profileUpdates.experienceLevel = experienceLevel;
    if (avatar !== undefined) profileUpdates.avatar = avatar;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    
    // Merge updates
    user.profile = {
      ...user.profile,
      ...profileUpdates
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        streak: user.streak,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
