const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

// Load env vars
dotenv.config();

const promoteToAdmin = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address. Example: node promote-admin.js user@example.com');
    process.exit(1);
  }

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerpilot');
    console.log('MongoDB Connected...');

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      process.exit(1);
    }

    console.log(`Success! User "${user.name}" (${user.email}) is now an admin.`);
    process.exit(0);
  } catch (error) {
    console.error('Error promoting user:', error.message);
    process.exit(1);
  }
};

promoteToAdmin();
