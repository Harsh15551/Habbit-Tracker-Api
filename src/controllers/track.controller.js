const Habit = require('../models/Habit');
const CompletionLog = require('../models/CompletionLog');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const dayjs = require('dayjs');

exports.trackHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const today = dayjs().startOf('day').toDate();
    const yesterday = dayjs().subtract(1, 'day').startOf('day');

    // 1. Confirm habit exists and belongs to the user
    const habit = await Habit.findOne({ _id: id, user: req.userId });
    if (!habit) throw new NotFoundError('Habit not found');

    // 2. Check if already tracked today using lastCompletedDate
    if (habit.lastCompletedDate) {
      const lastDate = dayjs(habit.lastCompletedDate).startOf('day');
      if (lastDate.isSame(dayjs(today))) {
        throw new BadRequestError('Habit already marked as completed for today');
      }

      // Check if consecutive (last completed was yesterday)
      if (lastDate.isSame(yesterday)) {
        habit.currentStreak += 1;
      } else {
        // Streak broken (gap of 2 or more days)
        habit.currentStreak = 1;
      }
    } else {
      // First time tracking this habit ever
      habit.currentStreak = 1;
    }

    // Update longest streak and last completed date
    habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
    habit.lastCompletedDate = today;

    // Save habit changes
    await habit.save();

    // Log the completion record (for history/reporting)
    const newLog = await CompletionLog.create({
      habit: id,
      date: today,
    });

    res.status(200).json({
      status: 'success',
      message: 'Habit tracked successfully!',
      data: {
        log: newLog,
        streaks: {
          currentStreak: habit.currentStreak,
          longestStreak: habit.longestStreak,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const habit = await Habit.findOne({ _id: id, user: req.userId });
    if (!habit) throw new NotFoundError('Habit not found');

    const sevenDaysAgo = dayjs().subtract(7, 'days').startOf('day').toDate();

    // Find completion logs for last 7 days
    const recentLogs = await CompletionLog.find({
      habit: id,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        streaks: {
          currentStreak: habit.currentStreak,
          longestStreak: habit.longestStreak,
        },
        recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};
