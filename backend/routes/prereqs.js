const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { parsePrereqs, evaluateTree } = require('../services/prereqDiagram');
const { parsePrereq, prereqchecker } = require('../services/prereqChecker');

// Preload the JSON files once at startup to avoid 60MB parsing overhead on every request
const prereqFilePath = path.join(__dirname, '../data/data_Spring2026_Prereq_test.json');
const takenFilePath = path.join(__dirname, '../data/coursesTaken.json');


let prereqJson = {};
let takenJson = { taken: [], enrolled: [] };

try {
    if (fs.existsSync(prereqFilePath)) {
        console.log("Pre-loading 60MB Prereq JSON (this may take a moment)...");
        prereqJson = JSON.parse(fs.readFileSync(prereqFilePath, 'utf-8'));
        console.log("Prereq JSON loaded successfully.");
    }
    if (fs.existsSync(takenFilePath)) {
        takenJson = JSON.parse(fs.readFileSync(takenFilePath, 'utf-8'));
    }
} catch (err) {
    console.error("Error pre-loading prerequisite JSONs:", err);
}

router.get('/:courseId', (req, res) => {
    try {
        const course = req.params.courseId;

        if (!prereqJson[course]) {
            return res.status(404).json({ error: `Course "${course}" prerequisites not found.` });
        }

        const prereqs = prereqJson[course].info.prereqs;

        const parsedTree = parsePrereqs(prereqs);

        const evaluated = evaluateTree(
            parsedTree,
            takenJson.taken || [],
            takenJson.enrolled || []
        );

        const childrenToUse = evaluated.type === "and" ? evaluated.children : [evaluated];

        const rootWrapped = {
            type: "root",
            id: "root-" + (evaluated.id || "0"),
            courseName: course.replace("_", " "),
            status: evaluated.status,
            children: childrenToUse,
        };

        return res.status(200).json(rootWrapped);
    } catch (error) {
        console.error("Error generating prerequisite tree:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/:courseId/bucket', (req, res) => {
    try {
        const course = req.params.courseId;
        const bucket = parsePrereq(prereqJson, course);

        if (bucket === false) {
            return res.status(404).json({ error: `Course "${course}" prerequisites not found.` });
        }

        return res.status(200).json({ bucket });
    } catch (error) {
        console.error("Error retrieving prerequisite bucket:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/:courseId/check', (req, res) => {
    try {
        const course = req.params.courseId;
        const bucket = parsePrereq(prereqJson, course);

        if (bucket === false) {
            return res.status(404).json({ error: `Course "${course}" prerequisites not found.` });
        }

        const { taken = [], enrolled = [] } = req.body || {};

        const isSatisfied = prereqchecker(taken, enrolled, bucket);

        return res.status(200).json({ satisfied: isSatisfied });
    } catch (error) {
        console.error("Error checking prerequisites:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
