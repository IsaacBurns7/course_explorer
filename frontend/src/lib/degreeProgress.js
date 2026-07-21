/*
Degree progress matching engine.

Pure functions — no React, no network. Given the planner and the selected programs, works
out what is satisfied and what is still missing, bucketed by major / minor / core.

Two different kinds of matching happen here, and they follow different rules:

  * Named requirements (a real course code) are matched EXACTLY against the planner.
    "alternatives" are interchangeable, so any one of them satisfies the requirement.

  * Elective slots ("Science elective", "Senior design") have no specific course to match,
    so they are reported as informational self-check items with their footnote text. The
    student is assumed to have read the footnote and to have entered an approved course.

  * Core curriculum is not a list of required courses at all — it is a set of areas, each
    needing N hours from a pool. So core is satisfied by CLASSIFYING every planned course
    into the areas it appears in. Major-required courses count here too (that is the whole
    point: a CS student's MATH 151 / PHYS 206 also satisfy core areas), so a course
    counting toward both a major requirement and a core area is correct, not double-dipping.
*/

// A token that names a real course, including cross-lists ("ENGR 216/PHYS 216").
// Anything else (e.g. "Science elective") is a free-choice slot.
const CODE_LIKE = /^[A-Z]{3,4}\s+\d{3,4}[A-Z]?(?:\s*\/\s*[A-Z]{3,4}\s+\d{3,4}[A-Z]?)*$/;

/** Is this requirement token a specific course, or a free-choice elective slot? */
export function isCourseCode(token) {
    return CODE_LIKE.test(String(token || "").trim());
}

/** Normalize a code for comparison: collapse whitespace, uppercase. */
function normalize(code) {
    return String(code || "").trim().toUpperCase().replace(/\s+/g, " ");
}

/**
 * Every way a requirement token can be written, so a cross-list matches either half.
 * "ENGR 216/PHYS 216" -> ["ENGR 216/PHYS 216", "ENGR 216", "PHYS 216"]
 */
function codeAliases(token) {
    const full = normalize(token);
    const parts = full.split("/").map(p => normalize(p)).filter(Boolean);
    return parts.length > 1 ? [full, ...parts] : [full];
}

/**
 * Flatten the planner ({ "Fall 2024": [{department, number, hours}, ...] }) into the
 * course list the rest of the engine works from.
 */
export function plannedCourses(planner) {
    const courses = [];
    for (const semester of Object.keys(planner || {})) {
        for (const course of planner[semester] || []) {
            const code = normalize(`${course.department} ${course.number}`);
            if (!code.trim()) continue;
            courses.push({
                code,
                hours: Number(course.hours) || 0,
                semester,
            });
        }
    }
    return courses;
}

/** Set of planned course codes, for O(1) requirement lookups. */
export function plannedCodeSet(planner) {
    return new Set(plannedCourses(planner).map(c => c.code));
}

/**
 * Evaluate one program's requirements against the planned courses.
 *
 * Returns:
 *   met            [{course, alternatives, satisfiedBy, footnotes}]
 *   missing        [{course, alternatives, footnotes}]
 *   electiveSlots  [{course, footnotes}]   informational only — never met/missing
 */
export function evaluateProgram(program, planned) {
    const codes = planned instanceof Set ? planned : plannedCodeSet(planned);

    const met = [];
    const missing = [];
    const electiveSlots = [];

    for (const requirement of (program && program.requirements) || []) {
        const primary = requirement.course;

        // Free-choice slot: no specific course to check, so just surface it.
        if (!isCourseCode(primary)) {
            electiveSlots.push({
                course: primary,
                footnotes: requirement.footnotes || [],
            });
            continue;
        }

        // A requirement is satisfied by its primary course or any of its alternatives,
        // and a cross-listed token matches under either department's number.
        const options = [primary, ...(requirement.alternatives || [])];
        let satisfiedBy = null;
        for (const option of options) {
            const hit = codeAliases(option).find(alias => codes.has(alias));
            if (hit) {
                satisfiedBy = hit;
                break;
            }
        }

        if (satisfiedBy) {
            met.push({ ...requirement, satisfiedBy });
        } else {
            missing.push({ ...requirement });
        }
    }

    const namedTotal = met.length + missing.length;
    return {
        program_id: program && program.program_id,
        desc_name: program && program.desc_name,
        kind: program && program.kind,
        footnotes: (program && program.footnotes) || {},
        met,
        missing,
        electiveSlots,
        metCount: met.length,
        missingCount: missing.length,
        namedTotal,
    };
}

/**
 * Evaluate the core curriculum by classifying planned courses into each area's pool.
 *
 * `core` is the array from GET /api/programs:
 *   [{ category, name, areas: [{name, hours_required, courses: [{code, cross_listed}]}] }]
 */
export function evaluateCore(core, planner) {
    const courses = Array.isArray(planner) ? planner : plannedCourses(planner);

    return (core || []).map(category => {
        const areas = (category.areas || []).map(area => {
            // Every code (and cross-list alias) that satisfies this area.
            const pool = new Set();
            for (const course of area.courses || []) {
                for (const alias of codeAliases(course.code)) pool.add(alias);
                for (const alias of course.cross_listed || []) pool.add(normalize(alias));
            }

            const matched = courses.filter(c => pool.has(c.code));
            const have = matched.reduce((sum, c) => sum + c.hours, 0);
            const need = Number(area.hours_required) || 0;

            return {
                name: area.name,
                need,
                have,
                remaining: Math.max(0, need - have),
                met: have >= need,
                matched: matched.map(c => c.code),
            };
        });

        return {
            category: category.category,
            name: category.name,
            areas,
            remaining: areas.reduce((sum, a) => sum + a.remaining, 0),
            met: areas.every(a => a.met),
        };
    });
}

/**
 * Top-level: evaluate the major, each minor, and the core curriculum in one pass.
 *
 * @param {object}   major    program record (or null)
 * @param {object[]} minors   program records
 * @param {object[]} core     core curriculum categories
 * @param {object}   planner  the planner keyed by semester
 */
export function evaluateAll({ major, minors = [], core = [], planner = {} }) {
    const courses = plannedCourses(planner);
    const codes = new Set(courses.map(c => c.code));

    return {
        major: major ? evaluateProgram(major, codes) : null,
        minors: minors.filter(Boolean).map(minor => evaluateProgram(minor, codes)),
        core: evaluateCore(core, courses),
        plannedCount: courses.length,
        plannedHours: courses.reduce((sum, c) => sum + c.hours, 0),
    };
}
