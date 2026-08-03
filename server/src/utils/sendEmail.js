const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If email configuration is missing, log email contents to console for easy development
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.log('==================================================');
    console.log('✉️  EMAIL SIMULATOR (Missing credentials in .env)  ✉️');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:    ${options.message}`);
    console.log('==================================================');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: `CareerPilot AI <${process.env.EMAIL_FROM || 'noreply@careerpilot.ai'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email successfully sent: ${info.messageId}`);
};

module.exports = sendEmail;
