const Habit = require('../models/Habit');
const { NotFoundError, BadRequestError } = require('../utils/errors');

exports.createHabit = async (req, res, next) => {
  try {
    const { title, description, frequency, tags, reminderTime } = req.body;

    if (!title) {
      throw new BadRequestError('Habit title is required');
    }

    const habit = await Habit.create({
      title,
      description,
      frequency,
      tags,
      reminderTime,
      user: req.userId,
    });

    res.status(201).json({ status: 'success', data: { habit } });
  } catch (error) {
    next(error);
  }
};

exports.getHabits = async (req, res, next) => {
  try {
    const { tag, page = 1, limit = 10 } = req.query;
    const filter = { user: req.userId };

    if (tag) {
      filter.tags = tag; // checks if string is in array
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const habits = await Habit.find(filter)
      .skip(skip)
      .limit(take)
      .sort({ createdAt: -1 });

    const total = await Habit.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: habits.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
      data: { habits },
    });
  } catch (error) {
    next(error);
  }
};

exports.getHabitById = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) throw new NotFoundError('Habit not found');

    res.status(200).json({ status: 'success', data: { habit } });
  } catch (error) {
    next(error);
  }
};

exports.updateHabit = async (req, res, next) => {
  try {
    const { title, description, frequency, tags, reminderTime } = req.body;

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, description, frequency, tags, reminderTime },
      { new: true, runValidators: true }
    );

    if (!habit) throw new NotFoundError('Habit not found');

    res.status(200).json({ status: 'success', data: { habit } });
  } catch (error) {
    next(error);
  }
};

exports.deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!habit) throw new NotFoundError('Habit not found');

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};
