const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: {
    type: String,
    enum: ['video', 'article', 'course', 'documentation'],
    default: 'course'
  }
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  }
});

const PhaseSchema = new mongoose.Schema({
  phaseNumber: { type: Number, required: true },
  title: { type: String, required: true },
  duration: { type: String, required: true },
  objectives: [String],
  resources: [ResourceSchema],
  projects: [ProjectSchema]
});

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetRole: {
    type: String,
    required: true
  },
  currentSkills: [String],
  missingSkills: [String],
  weeksEstimate: {
    type: Number,
    default: 8
  },
  phases: [PhaseSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
