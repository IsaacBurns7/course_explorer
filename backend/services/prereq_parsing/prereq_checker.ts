import * as fs from "fs";
import * as assert from "assert";

/**
 * npm install //install needed modules
 * cd to the right path (this directory)
 * npx ts-node --compiler-options '{"module":"commonjs"}' prereq_checker.ts 
 * Command above will run the main module which checks defined assertions
 * Otherwise use the functions defined
 */

// --- Types ---
type PrereqBucket = string | boolean | (string | boolean | PrereqBucket)[];

// --- Parse prereq file ---
/** 
 * @param filename from your current location, **the path** to the prereq data json(could be: data_Spring2026_Prereq.json)
 * @param courseName as a string the coursename needs to be in the format of the 4 UPPERCASE characters, underscore, 3 digits (e.g "CSCE_421")
 *
 * - Finds the "prereqs" bucket in the JSON file, and returns it as PrereqBucket
 * 
 * - If not found/there was an error in fetching the data, it will return false
*/
function parsePrereq(filename: string, courseName: string): PrereqBucket | false {
    try {
        const data = JSON.parse(fs.readFileSync(filename, "utf-8"));
        const classBucket = data[courseName];
        const prereqBuckets = classBucket["info"]["prereqs"];
        return prereqBuckets;
    } catch (e) {
        console.error("Error loading prereqs:", e);
        return false;
    }
}

// --- Evaluate recursively ---
/**
 * Recursively evaluates a prereq "bucket" (a nested structure of requirements).
 *
 * @param coursesTaken - Array of course strings the student has already completed, with grades (e.g., "CSCE120 C").
 * @param coursesEnrolled - Array of courses the student is currently enrolled in (e.g., "MATH304 C ^").
 * @param bucket - A `PrereqBucket` that may contain strings, booleans, or nested arrays representing AND/OR relationships.
 *
 * @returns A boolean or string:
 *  - `true` if **all** prereqs in this bucket are satisfied.
 *  - `false` if any **required** prereqs are not met.
 *  - `"."` when evaluating an OR operator to **combine subconditions**.
 *
 * The function handles:
 *  - Nested arrays of requirements recursively
 *  - `"."` as a logical OR operator (reducer)
 *  - All other conditions as logical ANDs
 */
function evaluateBucket(
    coursesTaken: string[],
    coursesEnrolled: string[],
    bucket: PrereqBucket
): boolean | string {
    // Debug logging (uncomment to trace)
    // console.log("Evaluating bucket:", JSON.stringify(bucket, null, 2));

    // Base case: string
    if (typeof bucket === "string") {
        return evaluateSingleRequirement(coursesTaken, coursesEnrolled, bucket);
    }

    // Base case: boolean
    if (typeof bucket === "boolean") {
        return bucket;
    }

    // Recursive case: evaluate sub-buckets
    const evaluated: (boolean | string)[] = [];
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
        const left = evaluated[idx - 1] as boolean;
        const right = evaluated[idx + 1] as boolean;
        evaluated.splice(idx - 1, 3, left || right);
    }

    // After ORs, remaining items are ANDs - all must be true
    return evaluated.every(v => v === true);
}

// --- Evaluate a single token like "CHEM107 C ^" ---
/**
 * Evaluates a single prerequisite token and determines if it’s satisfied.
 * This should handle the **lowest level of the bucket** i.e. a string that is either a course or an OR "." 
 *
 * @param coursesTaken - Array of strings for completed courses with grades (e.g., "CSCE121 B").
 * @param coursesEnrolled - Array of strings for currently enrolled courses (e.g., "CHEM107 C ^").
 * @param token - A single prereq expression, such as:
 *   - `"CHEM107 C ^"` → currently enrolled concurrently with required grade C or better
 *   - `"CSCE121 D"` → completed course with minimum grade D
 *   - `"."` → OR operator (passed through)
 *
 * @returns
 *  - `true` if satisfied (either completed or concurrently enrolled)
 *  - `false` if unsatisfied
 *  - `"."` if token represents an OR operator
 *
 * Notes:
 *  - Uses regex `/^([A-Z]{4}\d{3})\s*([A-F])?(?:\s*\^)?$/` to match valid tokens.
 *  - The caret `^` indicates concurrent enrollment.
 *  - Minimum grade defaults to "D" if not specified.
 */
function evaluateSingleRequirement(
    coursesTaken: string[],
    coursesEnrolled: string[],
    token: string
): boolean | string {
    token = token.trim();

    // OR passthrough
    if (token === ".") return token;

    const pattern = /^([A-Z]{4}\d{3})\s*([A-F])?(?:\s*\^)?$/;
    const match = token.match(pattern);
    if (!match) return false; 

    // match[1] and match[2] are present because pattern matched
    const courseCode = match[1] as string;
    const minGrade = (match[2] as string) || "D";

    const requiredWithGrade = `${courseCode} ${minGrade}`;
    const requiredConcurrent = `${requiredWithGrade} ^`;

    const extractGrade = (entry: string): string | null => {
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

// --- Wrapper ---
/**
 * **INVOKE THIS FOR A SIMPLE LIFE**
 * High level wrapper function that runs the full prereq evaluation.
 * @param coursesTaken - List of completed courses with grades.
 * @param coursesEnrolled - List of courses currently being taken.
 * @param prereqBucket - The prereq structure for the target course.
 *
 * @returns `true` if all prerequisite requirements are met, otherwise `false`.
 *
 * This serves as the main entry point for checking prerequisites for a single course.
 */
function prereqchecker(
    coursesTaken: string[],
    coursesEnrolled: string[],
    prereqBucket: PrereqBucket
): boolean {
    return Boolean(evaluateBucket(coursesTaken, coursesEnrolled, prereqBucket));
}

// --- Example main ---
if (require.main === module) {
    
    const prereqBucket = parsePrereq("data_Spring2026_Prereq.json", "ECEN_403");

    if (prereqBucket) {
        console.assert(
            prereqchecker(
                ["COMM205 C", "ECEN314 C", "ECEN325 C", "CSCE350 C", "ECEN303 C", "ECEN322 C", "ECEN370 C"],
                [],
                prereqBucket
            ) === true
        );

        console.assert(
            prereqchecker(
                ["ECEN314 C", "ECEN325 C", "CSCE350 C", "CSCE315 C", "ECEN303 C", "COMM205 C"],
                ["ECEN449 C ^"],
                prereqBucket
            ) === true
        );

        console.assert(
            prereqchecker(
                ["ECEN314 C", "ECEN325 C", "CSCE350 C", "CSCE315 C", "ECEN303 C"],
                ["ECEN449 C ^"],
                prereqBucket
            ) === false
        );
    }

    const FINC_428_prereq_bucket = parsePrereq("data_Spring2026_Prereq.json", "FINC_428");

    if (FINC_428_prereq_bucket) {
        console.assert(prereqchecker([], [], FINC_428_prereq_bucket) === false);
        console.assert(
            prereqchecker(
                ["FINC421 D", "FINC361 D"],
                ["ACCT328 D ^"],
                FINC_428_prereq_bucket
            ) === true
        );
        console.assert(
            prereqchecker(
                ["FINC421 D", "FINC361 D", "ACCT328 C"],
                [],
                FINC_428_prereq_bucket
            ) === true
        );
        console.assert(
            prereqchecker(
                ["FINC421 A", "FINC361 D"],
                ["ACCT328 ^"],
                FINC_428_prereq_bucket
            ) === true
        );
        
    }
    const CSCE_421_prereq_bucket = parsePrereq("data_Spring2026_Prereq.json", "CSCE_421");
    if(CSCE_421_prereq_bucket){    
        console.assert(
            prereqchecker(
                ["ECEN303 C", "CSCE120 C"],
                [],
                CSCE_421_prereq_bucket
            ) === false
        );
        
    }    

    // Load test data (adjust filename as needed)
    const CSCE_421_prereq_bucket2 = parsePrereq("data_Spring2026_Prereq.json", "CSCE_421");

    // ✅ Assertion 1 — should be false
    {
        const result = prereqchecker(["ECEN303 C", "CSCE120 C"], [], CSCE_421_prereq_bucket2);
        assert.strictEqual(
            result,
            false,
            `Expected false, got ${result} for prereqchecker(["ECEN303 C", "CSCE120 C"], [])`
        );
    }

    // ✅ Assertion 2 — should be false
    {
        const result = prereqchecker(["ECEN303 C", "CSCE120 C"], [], CSCE_421_prereq_bucket2);
        assert.strictEqual(
            result,
            false,
            `Expected false, got ${result} for prereqchecker(["ECEN303 C", "CSCE120 C", "CSCE310 B"], [])`
        );
    }
    console.log("ALL ASSERTIONS PASSED!")
}
