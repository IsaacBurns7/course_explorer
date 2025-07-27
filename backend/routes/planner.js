const express = require('express');
const { getBestClasses } = require('../controllers/planner');

const router = express.Router();

router.post("", getBestClasses);

module.exports = router;