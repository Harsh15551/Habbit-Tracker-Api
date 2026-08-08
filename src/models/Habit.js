const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  reminderTime: {
    type: String, // format "HH:MM"
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Reminder time must be in HH:MM format',
    },
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastCompletedDate: {
    type: Date,
  },
}, { timestamps: true });

// Add index on user for fast retrieval of user's habits
habitSchema.index({ user: 1 });

module.exports = mongoose.model('Habit', habitSchema);
