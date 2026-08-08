const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError('Please provide all fields (name, email, password)');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email is already registered');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: { id: user._id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: { id: user._id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    next(error);
  }
};
