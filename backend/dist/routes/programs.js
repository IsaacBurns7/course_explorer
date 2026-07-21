"use strict";
/*
Degree program requirements + core curriculum (read-only reference data).
    GET /api/programs                   -> pick-lists for majors/minors + core curriculum
    GET /api/programs/:id/requirements  -> one program's requirements
*/
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const { listPrograms, getProgramRequirements } = require('../controllers/programs');
const router = express.Router();
router.get("/", listPrograms);
router.get("/:id/requirements", getProgramRequirements);
module.exports = router;
