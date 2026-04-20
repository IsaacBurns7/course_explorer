"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// @ts-ignore
const prereqDiagram_1 = require("../services/prereqDiagram");
// @ts-ignore
const prereqChecker_1 = require("../services/prereqChecker");
const router = (0, express_1.Router)();
// Preload ONLY the small coursesTaken JSON
const takenFilePath = path_1.default.join(__dirname, "../../data/coursesTaken.json");
let takenJson = { taken: [], enrolled: [] };
try {
    if (fs_1.default.existsSync(takenFilePath)) {
        takenJson = JSON.parse(fs_1.default.readFileSync(takenFilePath, "utf-8"));
    }
}
catch (err) {
    console.error("Error pre-loading prerequisite JSONs:", err);
}
router.get("/:courseId", async (req, res) => {
    try {
        const course = req.params.courseId;
        const prereqs = await (0, prereqChecker_1.getPrereqBucket)(course);
        if (!prereqs) {
            return res.status(404).json({ error: `Course "${course}" prerequisites not found.` });
        }
        const parsedTree = (0, prereqDiagram_1.parsePrereqs)(prereqs);
        const evaluated = (0, prereqDiagram_1.evaluateTree)(parsedTree, takenJson.taken || [], takenJson.enrolled || []);
        const childrenToUse = evaluated.type === "and" ? evaluated.children : [evaluated];
        const rootWrapped = {
            type: "root",
            id: "root-" + (evaluated.id || "0"),
            courseName: course.replace("_", " "),
            status: evaluated.status,
            children: childrenToUse,
        };
        return res.status(200).json(rootWrapped);
    }
    catch (error) {
        console.error("Error generating prerequisite tree:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/:courseId/bucket", async (req, res) => {
    try {
        const course = req.params.courseId;
        const bucket = await (0, prereqChecker_1.getPrereqBucket)(course);
        if (bucket === false) {
            return res.status(404).json({ error: `Course "${course}" prerequisites not found.` });
        }
        return res.status(200).json({ bucket });
    }
    catch (error) {
        console.error("Error retrieving prerequisite bucket:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/:courseId/check", async (req, res) => {
    try {
        const course = req.params.courseId;
        const bucket = await (0, prereqChecker_1.getPrereqBucket)(course);
        if (bucket === false) {
            return res.status(404).json({ error: `Course "${course}" prerequisites not found.` });
        }
        const { taken = [], enrolled = [] } = req.body || {};
        const isSatisfied = (0, prereqChecker_1.prereqchecker)(taken, enrolled, bucket);
        return res.status(200).json({ satisfied: isSatisfied });
    }
    catch (error) {
        console.error("Error checking prerequisites:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;
