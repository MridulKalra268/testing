const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  minQuestions: { type: Number, default: 1 },
  maxQuestions: { type: Number, default: 2 },
  patterns: [{ type: String }],
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Topic', topicSchema);