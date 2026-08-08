const mongoose = require('mongoose');

const completionLogSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  date: {
    type: Date, // Normalized date representing start of the day (YYYY-MM-DD)
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure only one log entry exists per habit per calendar day
completionLogSchema.index({ habit: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('CompletionLog', completionLogSchema);
