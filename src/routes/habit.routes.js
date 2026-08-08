const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
} = require('../controllers/habit.controller');
const { trackHabit, getHistory } = require('../controllers/track.controller');

const router = express.Router();

// Apply auth protection middleware to all routes below
router.use(protect);

router.route('/')
  .post(createHabit)
  .get(getHabits);

router.route('/:id')
  .get(getHabitById)
  .put(updateHabit)
  .delete(deleteHabit);

router.post('/:id/track', trackHabit);
router.get('/:id/history', getHistory);

module.exports = router;
