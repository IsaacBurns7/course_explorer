import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
// @ts-ignore
import { parsePrereqs, evaluateTree } from "../services/prereqDiagram";
// @ts-ignore
import { getPrereqBucket, prereqchecker } from "../services/prereqChecker";

const router = Router();

// Preload ONLY the small coursesTaken JSON
const takenFilePath = path.join(__dirname, "../../data/coursesTaken.json");

let takenJson: { taken: string[], enrolled: string[] } = { taken: [], enrolled: [] };

try {
    if (fs.existsSync(takenFilePath)) {
        takenJson = JSON.parse(fs.readFileSync(takenFilePath, "utf-8"));
    }
} catch (err) {
    console.error("Error pre-loading prerequisite JSONs:", err);
}

router.get("/:courseId", async (req: Request, res: Response) => {
    try {
        const course = req.params.courseId as string;
        const prereqs = await getPrereqBucket(course);

        if (!prereqs) {
            return res.status(404).json({ error: `Course "${course}" prerequisites not found.` });
        }

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

router.get("/:courseId/bucket", async (req: Request, res: Response) => {
    try {
        const course = req.params.courseId as string;
        const bucket = await getPrereqBucket(course);

        if (bucket === false) {
            return res.status(404).json({ error: `Course "${course}" prerequisites not found.` });
        }

        return res.status(200).json({ bucket });
    } catch (error) {
        console.error("Error retrieving prerequisite bucket:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/:courseId/check", async (req: Request, res: Response) => {
    try {
        const course = req.params.courseId as string;
        const bucket = await getPrereqBucket(course);

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
