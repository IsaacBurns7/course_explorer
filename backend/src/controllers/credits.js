/*
Credit-by-examination equivalency (AP / IB / SAT II / DANTES).

Read-only reference data scraped from testing.tamu.edu. The Add-Class "Credit Transfer"
flow is deliberately staged so each request sends only what that step needs:

  GET  /api/credits/methods            -> [{id, name}]                 (pick a method)
  GET  /api/credits/:method/exams      -> ["Biology", ...]             (pick an exam; names only)
  POST /api/credits/:method/evaluate   {exam, score} -> awarded course(s) for that score

The full equivalency table is never shipped to the client.
*/

let _pool = null;
function getPool() {
    if (!_pool) _pool = require("../db.js");
    return _pool;
}

// TEMPORARY: serves from local scraper JSON until the Neon table exists.
// Remove this require and the isMissingTableError blocks once the table is seeded.
const {
    isMissingTableError,
    listMethodsLocal,
    listExamsLocal,
    getExamLocal,
} = require("./creditsLocalFallback");

let _warnedLocal = false;
function warnLocal() {
    if (_warnedLocal) return;
    _warnedLocal = true;
    console.warn(
        "[credits] course_explorer.credit_equivalency not found — serving credit data " +
        "from local scraper JSON. Create and seed the table to use the database."
    );
}

// "BIOL 111" -> { code, department, number }
function splitCode(code) {
    const m = String(code).match(/^([A-Z]{2,4})\s*(\d{3}[A-Z]?)$/);
    return {
        code,
        department: m ? m[1] : null,
        number: m ? m[2] : null,
    };
}

/*
Given an exam record and a student's score, the award is the HIGHEST tier whose required
score the student meets (a higher score supersedes the lower tiers). Returns a compact
payload, or eligible:false with the minimum score needed.
*/
function evaluateExam(exam, score) {
    const numericScore = Number(score);
    let best = null;
    let minScore = null;
    for (const tier of exam.tiers || []) {
        if (tier.score == null) continue;
        if (minScore == null || tier.score < minScore) minScore = tier.score;
        if (!Number.isNaN(numericScore) && numericScore >= tier.score) {
            if (!best || tier.score > best.score) best = tier;
        }
    }

    if (!best) {
        return { eligible: false, minScore, awarded: null };
    }
    return {
        eligible: true,
        awarded: {
            tierScore: best.score,
            relation: best.relation,     // "single" | "and" | "or" | "advisor"
            hours: best.hours,
            advisor: Boolean(best.advisor),
            note: best.note || null,
            courses: (best.courses || []).map(splitCode),
        },
    };
}

// --- DB access with local fallback ------------------------------------------

async function methodRowFromDb(client, method) {
    const result = await client.query(
        `SELECT method, name, exams FROM course_explorer.credit_equivalency WHERE method = $1`,
        [method]
    );
    return result.rows[0] || null;
}

/*
Attach real title + credit hours to each awarded course from the courses table, so the
client can add transfer credits with accurate hours without a second round trip. Course
ids are "DEPT_NUMBER" (e.g. "BIOL_111"). Missing courses keep hours: null.
*/
async function enrichCourses(client, courses) {
    if (!courses.length) return courses;
    const ids = courses.map((c) => `${c.department}_${c.number}`);
    const byId = {};
    try {
        const result = await client.query(
            `SELECT c.id, c.title,
                    COALESCE((SELECT MAX(CASE WHEN cs.hours ~ '^[0-9]+$' THEN cs.hours::int ELSE 0 END)
                              FROM course_explorer.courses_sections cs
                              WHERE cs.course_id = c.id), 0) AS hours
               FROM course_explorer.courses c
              WHERE c.id = ANY($1)`,
            [ids]
        );
        for (const row of result.rows) byId[row.id] = { title: row.title, hours: row.hours };
    } catch (error) {
        console.log("[credits] course enrichment failed:", error.message);
    }
    return courses.map((c) => {
        const info = byId[`${c.department}_${c.number}`] || {};
        return { ...c, title: info.title || c.code, hours: info.hours != null ? info.hours : null };
    });
}

const listMethods = async (req, res) => {
    const client = await getPool().connect();
    try {
        const result = await client.query(
            `SELECT method AS id, name FROM course_explorer.credit_equivalency ORDER BY name`
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        if (isMissingTableError(error)) {
            warnLocal();
            return res.status(200).json(listMethodsLocal());
        }
        console.log(error);
        return res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

const listExams = async (req, res) => {
    const client = await getPool().connect();
    try {
        const row = await methodRowFromDb(client, req.params.method);
        if (!row) return res.status(404).json({ error: `unknown method '${req.params.method}'` });
        return res.status(200).json((row.exams || []).map((e) => e.exam));
    } catch (error) {
        if (isMissingTableError(error)) {
            warnLocal();
            const exams = listExamsLocal(req.params.method);
            if (exams === null) return res.status(404).json({ error: `unknown method '${req.params.method}'` });
            return res.status(200).json(exams);
        }
        console.log(error);
        return res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

const evaluate = async (req, res) => {
    const method = req.params.method;
    const { exam, score } = req.body || {};
    if (!exam || score === undefined || score === null || score === "") {
        return res.status(400).json({ error: "exam and score are required" });
    }

    const target = String(exam).trim().toLowerCase();
    const client = await getPool().connect();
    try {
        // Resolve the exam record from the DB, or the local fallback if the table is absent.
        let examRecord = null;
        let unknownMethod = false;
        try {
            const row = await methodRowFromDb(client, method);
            if (!row) unknownMethod = true;
            else examRecord = (row.exams || []).find((e) => e.exam.trim().toLowerCase() === target);
        } catch (error) {
            if (!isMissingTableError(error)) throw error;
            warnLocal();
            if (listExamsLocal(method) === null) unknownMethod = true;
            else examRecord = getExamLocal(method, exam);
        }

        if (unknownMethod) return res.status(404).json({ error: `unknown method '${method}'` });
        if (!examRecord) return res.status(404).json({ error: `unknown exam '${exam}'` });

        const result = evaluateExam(examRecord, score);
        if (result.awarded && result.awarded.courses.length) {
            result.awarded.courses = await enrichCourses(client, result.awarded.courses);
        }
        return res.status(200).json({ method, exam: examRecord.exam, ...result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

module.exports = { listMethods, listExams, evaluate, evaluateExam };
