const express = require('express');
const authRoutes = require('./auth.routes');
const habitRoutes = require('./habit.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);

module.exports = router;
