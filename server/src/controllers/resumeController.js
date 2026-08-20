const cloudinary = require('cloudinary').v2;
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const Progress = require('../models/Progress');
const User = require('../models/User');
const geminiService = require('../services/geminiService');

// Configure Cloudinary if credentials exist
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const fs = require('fs');
const path = require('path');

// Helper function to upload buffer to Cloudinary or save locally
const saveFile = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      // Save locally
      try {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const fileName = `${Date.now()}-${originalName || 'resume.pdf'}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, fileBuffer);

        const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
        return resolve({
          secure_url: `${serverUrl}/uploads/${fileName}`,
          public_id: `local_${fileName}`
        });
      } catch (err) {
        return reject(err);
      }
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'careerpilot_resumes', resource_type: 'raw' },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// @desc    Upload & Parse Resume
// @route   POST /api/resume/upload
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume file' });
    }

    // 1. Extract text from PDF buffer
    let pdfData;
    try {
      pdfData = await pdfParse(req.file.buffer);
    } catch (parseError) {
      return res.status(400).json({ success: false, message: 'Failed to extract text from PDF. Ensure file is valid.' });
    }

    const parsedText = pdfData.text;

    // 2. Upload PDF file to Cloudinary (or save locally)
    const uploadResult = await saveFile(req.file.buffer, req.file.originalname);

    // 3. Send text to Gemini API for ATS score and analysis
    const analysis = await geminiService.analyzeResume(parsedText);

    // 4. Save to MongoDB
    const resume = await Resume.create({
      userId: req.user.id,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      parsedText: parsedText,
      atsScore: analysis.atsScore,
      breakdown: analysis.breakdown,
      detectedSkills: analysis.detectedSkills,
      suggestedSkills: analysis.suggestedSkills,
      feedback: analysis.feedback
    });

    // Update User profile skills to build AI memory context
    if (analysis.detectedSkills && analysis.detectedSkills.length > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { 'profile.skills': { $each: analysis.detectedSkills } }
      });
    }

    // 5. Update user progress & unlock badge
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user.id });
    }

    // Check if they already have the resume badge
    const hasResumeBadge = progress.badges.some(b => b.badgeId === 'resume_pro');
    if (!hasResumeBadge) {
      progress.badges.push({
        badgeId: 'resume_pro',
        title: 'Resume Pro',
        description: 'Successfully scanned your resume for ATS optimization.',
        icon: 'file-text'
      });
      await progress.save();
    }

    const resObj = resume.toObject();
    if (resObj.fileUrl && resObj.fileUrl.includes('cloudinary.com/demo/image/upload')) {
      resObj.fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: resObj,
      badgeUnlocked: !hasResumeBadge
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resume upload history
// @route   GET /api/resume/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const history = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const sanitizedHistory = history.map(item => {
      const doc = item.toObject();
      if (doc.fileUrl && doc.fileUrl.includes('cloudinary.com/demo/image/upload')) {
        doc.fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      }
      return doc;
    });

    res.status(200).json({
      success: true,
      count: sanitizedHistory.length,
      data: sanitizedHistory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume record
// @route   DELETE /api/resume/:id
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found' });
    }

    // Verify ownership
    if (resume.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this record' });
    }

    // If Cloudinary publicId exists and Cloudinary is configured, delete it from Cloudinary
    if (resume.publicId && process.env.CLOUDINARY_CLOUD_NAME && !resume.publicId.startsWith('mock')) {
      try {
        await cloudinary.uploader.destroy(resume.publicId, { resource_type: 'raw' });
      } catch (err) {
        console.error('Failed to delete file from Cloudinary:', err);
      }
    }

    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resume record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare Resume to Job Role (AI Resume Comparison)
// @route   POST /api/resume/compare-role
// @access  Private
exports.compareResumeToRole = async (req, res, next) => {
  try {
    const { resumeId, jobRole } = req.body;

    if (!resumeId || !jobRole) {
      return res.status(400).json({ success: false, message: 'Please provide resumeId and jobRole' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found' });
    }

    const comparison = await geminiService.compareResumeToRole(resume.parsedText || '', jobRole);

    // Notify user via Email alert (Nodemailer)
    const sendEmail = require('../utils/sendEmail');
    try {
      await sendEmail({
        email: req.user.email,
        subject: `CareerPilot AI - Role Match Analysis for ${jobRole}`,
        message: `Hello ${req.user.name}, your resume match score for the role of ${jobRole} is ${comparison.matchScore}%.`,
        html: `
          <h3>CareerPilot AI Role Match Report</h3>
          <p>Hi ${req.user.name},</p>
          <p>Here is your fit analysis for <strong>${jobRole}</strong>:</p>
          <ul>
            <li><strong>Match Fit Score:</strong> ${comparison.matchScore}%</li>
            <li><strong>Missing Skills:</strong> ${comparison.missingSkills?.join(', ') || 'None!'}</li>
            <li><strong>Missing Keywords:</strong> ${comparison.missingKeywords?.join(', ') || 'None!'}</li>
          </ul>
          <p>Log in to view complete suggestions to improve your resume score.</p>
        `
      });
    } catch (emailErr) {
      console.error('Email notification failed for role comparison:', emailErr);
    }

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Cover Letter
// @route   POST /api/resume/cover-letter
// @access  Private
exports.generateCoverLetter = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ success: false, message: 'Please provide resumeId and jobDescription' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found' });
    }

    const coverLetter = await geminiService.generateCoverLetter(resume.parsedText || '', jobDescription);

    // Notify user via Email alert (Nodemailer)
    const sendEmail = require('../utils/sendEmail');
    try {
      await sendEmail({
        email: req.user.email,
        subject: `CareerPilot AI - Cover Letter Generated Successfully!`,
        message: `Hello ${req.user.name}, your AI Cover Letter is ready for download.`,
        html: `
          <h3>CareerPilot AI Notification</h3>
          <p>Hi ${req.user.name},</p>
          <p>Your custom AI Cover Letter has been compiled successfully based on your uploaded resume credentials.</p>
          <p>Open the Resume Hub dashboard tab to view and download it as a paginated PDF document.</p>
        `
      });
    } catch (emailErr) {
      console.error('Email notification failed for cover letter:', emailErr);
    }

    res.status(200).json({
      success: true,
      data: coverLetter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze a built resume (text submission)
// @route   POST /api/resume/analyze-built
// @access  Private
exports.analyzeBuiltResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'Please provide resume text content' });
    }

    // 1. Send text to Gemini API for ATS score and analysis
    const analysis = await geminiService.analyzeResume(resumeText);

    // 2. Save to MongoDB using a default dummy PDF path as it is generated/built
    const resume = await Resume.create({
      userId: req.user.id,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      parsedText: resumeText,
      atsScore: analysis.atsScore,
      breakdown: analysis.breakdown,
      detectedSkills: analysis.detectedSkills,
      suggestedSkills: analysis.suggestedSkills,
      feedback: analysis.feedback
    });

    // Update User profile skills to build AI memory context
    if (analysis.detectedSkills && analysis.detectedSkills.length > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { 'profile.skills': { $each: analysis.detectedSkills } }
      });
    }

    // 3. Update user progress & unlock badge
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user.id });
    }

    const hasResumeBadge = progress.badges.some(b => b.badgeId === 'resume_pro');
    if (!hasResumeBadge) {
      progress.badges.push({
        badgeId: 'resume_pro',
        title: 'Resume Pro',
        description: 'Successfully scanned your resume for ATS optimization.',
        icon: 'file-text'
      });
      await progress.save();
    }

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: resume,
      badgeUnlocked: !hasResumeBadge
    });
  } catch (error) {
    next(error);
  }
};
