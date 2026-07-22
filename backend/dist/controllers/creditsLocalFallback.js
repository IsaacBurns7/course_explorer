"use strict";
/* ---------------------------------------------------------------------------
 * TEMPORARY LOCAL DATA SOURCE — DELETE WHEN THE NEON credit_equivalency TABLE EXISTS.
 *
 * Same idea as programsLocalFallback.js: until course_explorer.credit_equivalency
 * exists, serve the credit-by-exam equivalency data straight off the scraper output
 * (degree_program_reqs/credit_equivalency.json). controllers/credits.js catches the
 * undefined-table error (42P01) and calls in here. Once the table is created and
 * seeded, the query succeeds and this stops running.
 *
 * TO REMOVE: delete this file (+ the dist copy), and delete the `require` and the
 * `isMissingTableError` fallbacks in controllers/credits.js, then npx tsc.
 * ------------------------------------------------------------------------- */
const fs = require('fs');
const path = require('path');
const DATA_PATH = path.join(__dirname, '../../../degree_program_reqs/credit_equivalency.json');
const UNDEFINED_TABLE = '42P01';
function isMissingTableError(error) {
    return Boolean(error) && error.code === UNDEFINED_TABLE;
}
let _cache = null;
function load() {
    if (_cache)
        return _cache;
    if (!fs.existsSync(DATA_PATH)) {
        throw new Error(`local credit data not found — expected ${DATA_PATH}. ` +
            `Run degree_program_reqs/scrape_credit_equivalency.py.`);
    }
    _cache = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    return _cache;
}
/** [{ id, name }] */
function listMethodsLocal() {
    return load().methods;
}
/** Exam NAMES for one method (no course/tier data — that's fetched on evaluate). */
function listExamsLocal(method) {
    const exams = load().equivalency[method];
    if (!exams)
        return null; // unknown method
    return exams.map(e => e.exam);
}
/** One exam's full record (tiers), or null. */
function getExamLocal(method, examName) {
    const exams = load().equivalency[method];
    if (!exams)
        return null;
    const target = String(examName || '').trim().toLowerCase();
    return exams.find(e => e.exam.trim().toLowerCase() === target) || null;
}
module.exports = { isMissingTableError, listMethodsLocal, listExamsLocal, getExamLocal };
