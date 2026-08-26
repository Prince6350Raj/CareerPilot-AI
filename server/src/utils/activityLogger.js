const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

exports.logActivity = async (userId, action, details = '') => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    await ActivityLog.create({
      userId,
      userName: user.name,
      userEmail: user.email,
      action,
      details
    });
  } catch (err) {
    console.error('Error logging user activity:', err);
  }
};
