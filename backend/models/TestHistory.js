const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  topic: String,
  pattern: String,
  difficulty: { type: String, enum: ['easy', 'moderate', 'hard'] },
  question: String,
  options: [String],
  answer: String,
  solution: String
});

const testHistorySchema = new mongoose.Schema({
  topics: [String],
  questions: [questionSchema],
  score: Number,
  totalQuestions: Number,
  timeTaken: Number,
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestHistory', testHistorySchema);