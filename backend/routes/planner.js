const express = require('express');
const { getBestClasses } = require('../controllers/planner');

const router = express.Router();

router.get("/:data", getBestClasses);

module.exports = router;