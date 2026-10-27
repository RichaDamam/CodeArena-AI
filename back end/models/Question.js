const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
  isSample: {
    type: Boolean,
    default: false,
  }
});

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  statement: {
    type: String,
    required: true,
  },
  testCases: [TestCaseSchema],
  hints: [String],
  videoUrl: {
    type: String,
    default: '',
  },
  starterTemplates: {
    python: {
      type: String,
      default: '',
    },
    javascript: {
      type: String,
      default: '',
    },
    java: {
      type: String,
      default: '',
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
