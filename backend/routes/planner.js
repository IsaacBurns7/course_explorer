const express = require('express');
const { getBestClasses, getClassInfo } = require('../controllers/planner');

const router = express.Router();

router.post("/", getBestClasses);
router.post("/class", getClassInfo)
module.exports = router;