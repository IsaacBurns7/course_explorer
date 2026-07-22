"use strict";
/*
Credit-by-examination equivalency (read-only reference data).
    GET  /api/credits/methods           -> [{id, name}]
    GET  /api/credits/:method/exams      -> exam names for that method
    POST /api/credits/:method/evaluate   {exam, score} -> awarded course(s)
*/
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const { listMethods, listExams, evaluate } = require('../controllers/credits');
const router = express.Router();
router.get("/methods", listMethods);
router.get("/:method/exams", listExams);
router.post("/:method/evaluate", evaluate);
module.exports = router;
