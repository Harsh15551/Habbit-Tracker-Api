const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Save userId to request object for downstream controllers
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired authentication token.'));
  }
};
