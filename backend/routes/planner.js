const express = require('express');
const { getBestClasses, getClassInfo } = require('../controllers/planner');

const router = express.Router();

router.post("/", express.raw({ type: "application/pdf", limit: "10mb" }), getBestClasses);
router.post("/class", getClassInfo)
module.exports = router;