const express = require('express');
const { getBestClassesPDF, getBestClassesText, getClassInfo, getOptimalSchedule } = require('../controllers/planner2');

const router = express.Router();

router.post("/pdf", express.raw({ type: "application/pdf", limit: "10mb" }), getBestClassesPDF);
router.post("/text", getBestClassesText);
router.post("/class", getClassInfo);
router.post("/optimalSchedule", getOptimalSchedule);
module.exports = router;