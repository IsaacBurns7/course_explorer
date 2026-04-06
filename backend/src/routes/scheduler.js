const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const schedulerController = require('../controllers/schedule_backup/saver');

// POST /api/scheduler/save
router.post('/save', requireAuth, schedulerController.saveSchedule);

module.exports = router;