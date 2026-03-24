const fs = require("fs");

/** 
 * @param {Object} data the preloaded JSON data containing all course info
 * @param {string} courseName as a string the coursename needs to be in the format of the 4 UPPERCASE characters, underscore, 3 digits (e.g "CSCE_421")
 *
 * - Finds the "prereqs" bucket in the JSON file, and returns it.
 * 
 * - If not found/there was an error in fetching the data, it will return false
 */
function parsePrereq(data, courseName) {
    try {
        const classBucket = data[courseName];
        if (!classBucket || !classBucket.info || !classBucket.info.prereqs) {
            return false;
        }
        return classBucket.info.prereqs;
    } catch (e) {
        console.error("Error loading prereq bucket from JSON:", e);
        return false;
    }
}

/**
 * Recursively evaluates a prereq "bucket" (a nested structure of requirements).
 *
 * @param {string[]} coursesTaken - Array of course strings the student has already completed, with grades (e.g., "CSCE120 C").
 * @param {string[]} coursesEnrolled - Array of courses the student is currently enrolled in (e.g., "MATH304 C ^").
 * @param {PrereqBucket} bucket - A bucket that may contain strings, booleans, or nested arrays representing AND/OR relationships.
 *
 * @returns {boolean | string}
 *  - `true` if **all** prereqs in this bucket are satisfied.
 *  - `false` if any **required** prereqs are not met.
 *  - `"."` when evaluating an OR operator to **combine subconditions**.
 *
 * The function handles:
 *  - Nested arrays of requirements recursively
 *  - `"."` as a logical OR operator (reducer)
 *  - All other conditions as logical ANDs
 */
function evaluateBucket(coursesTaken, coursesEnrolled, bucket) {
    // Base case: string
    if (typeof bucket === "string") {
        return evaluateSingleRequirement(coursesTaken, coursesEnrolled, bucket);
    }

    // Base case: boolean
    if (typeof bucket === "boolean") {
        return bucket;
    }

    // Recursive case: evaluate sub-buckets
    const evaluated = [];
    for (const element of bucket) {
        if (Array.isArray(element)) {
            evaluated.push(evaluateBucket(coursesTaken, coursesEnrolled, element));
        } else if (typeof element === "string") {
            evaluated.push(evaluateSingleRequirement(coursesTaken, coursesEnrolled, element));
        } else {
            evaluated.push(element);
        }
    }

    // Process ORs (".") left to right
    while (evaluated.includes(".")) {
        const idx = evaluated.indexOf(".");
        const left = evaluated[idx - 1];
        const right = evaluated[idx + 1];
        evaluated.splice(idx - 1, 3, left || right);
    }

    // After ORs, remaining items are ANDs - all must be true
    return evaluated.every((v) => v === true);
}

/**
 * Evaluates a single prerequisite token and determines if it’s satisfied.
 * This should handle the **lowest level of the bucket** i.e. a string that is either a course or an OR "." 
 *
 * @param {string[]} coursesTaken - Array of strings for completed courses with grades (e.g., "CSCE121 B").
 * @param {string[]} coursesEnrolled - Array of strings for currently enrolled courses (e.g., "CHEM107 C ^").
 * @param {string} token - A single prereq expression, such as:
 *   - `"CHEM107 C ^"` → currently enrolled concurrently with required grade C or better
 *   - `"CSCE121 D"` → completed course with minimum grade D
 *   - `"."` → OR operator (passed through)
 *
 * @returns {boolean | string}
 *  - `true` if satisfied (either completed or concurrently enrolled)
 *  - `false` if unsatisfied
 *  - `"."` if token represents an OR operator
 *
 * Notes:
 *  - Uses regex `/^([A-Z]{4}\d{3})\s*([A-F])?(?:\s*\^)?$/` to match valid tokens.
 *  - The caret `^` indicates concurrent enrollment.
 *  - Minimum grade defaults to "D" if not specified.
 */
function evaluateSingleRequirement(coursesTaken, coursesEnrolled, token) {
    token = token.trim();

    // OR passthrough
    if (token === ".") return token;

    const pattern = /^([A-Z]{4}\d{3})\s*([A-F])?(?:\s*\^)?$/;
    const match = token.match(pattern);
    if (!match) return false;

    const courseCode = match[1];
    const minGrade = match[2] || "D";

    const requiredWithGrade = `${courseCode} ${minGrade}`;
    const requiredConcurrent = `${requiredWithGrade} ^`;

    const extractGrade = (entry) => {
        const parts = entry.trim().split(/\s+/);
        const last = parts[parts.length - 1] ?? "";
        return /^[A-F]$/.test(last) ? last : null;
    };

    // --- 1️⃣ Concurrently enrolled (CHEM107 C ^) ---
    if (coursesEnrolled.includes(requiredConcurrent)) return true;

    // --- 2️⃣ Already taken with sufficient grade ---
    for (const taken of coursesTaken) {
        if (taken.startsWith(courseCode)) {
            const grade = extractGrade(taken);
            if (grade && grade <= minGrade) {  // 'A' <= 'C' -> true (satisfied)
                return true;
            }
        }
    }

    // --- 3️⃣ Enrolled in the same course (not necessarily with ^) ---
    for (const enrolled of coursesEnrolled) {
        if (enrolled.startsWith(courseCode)) {
            return true;
        }
    }

    return false;
}

/**
 * **INVOKE THIS FOR A SIMPLE LIFE**
 * High level wrapper function that runs the full prereq evaluation.
 * @param {string[]} coursesTaken - List of completed courses with grades.
 * @param {string[]} coursesEnrolled - List of courses currently being taken.
 * @param {Array|string|boolean} prereqBucket - The prereq structure for the target course.
 *
 * @returns {boolean} `true` if all prerequisite requirements are met, otherwise `false`.
 */
function prereqchecker(coursesTaken, coursesEnrolled, prereqBucket) {
    return Boolean(evaluateBucket(coursesTaken, coursesEnrolled, prereqBucket));
}

module.exports = {
    parsePrereq,
    prereqchecker
};
