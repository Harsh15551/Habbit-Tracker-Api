const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per IP per hour
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
