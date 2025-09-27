const express = require('express');
const { getBestClassesPDF, getBestClassesText, getClassInfo } = require('../controllers/planner');

const router = express.Router();

router.post("/pdf", express.raw({ type: "application/pdf", limit: "10mb" }), getBestClassesPDF);
router.post("/text", getBestClassesText);
router.post("/class", getClassInfo)
module.exports = router;