let _nodeId = 0;
function makeId() {
    return `node-${_nodeId++}`;
}

function parsePrereqs(input) {
    if (typeof input === "string") return { type: "single", id: makeId(), course: input };

    if (!Array.isArray(input)) throw new Error("Unexpected prereq format");

    if (input.includes(".")) {
        const segments = [];
        let current = [];

        for (const item of input) {
            if (item === ".") {
                if (current.length) {
                    segments.push(current);
                    current = [];
                }
            } else {
                current.push(item);
            }
        }
        if (current.length) segments.push(current);

        const children = segments.map(seg => parseAndSegment(seg));
        return { type: "or", id: makeId(), children };
    }

    return parseAndSegment(input);
}

function parseAndSegment(arr) {
    const children = arr.map(parsePrereqs);
    if (children.length === 1) return children[0];
    return { type: "and", id: makeId(), children };
}

// ------------------------------------------

function parseCourseString(raw) {
    let str = raw.replace(/\s+/g, "").toUpperCase();

    const concurrent = str.endsWith("^");
    if (concurrent) str = str.slice(0, -1);

    const dept = str.slice(0, 4);
    const num = str.slice(4, 7);
    let reqGrade = null;

    if (str.length > 7) {
        reqGrade = str[7]; // single letter
    }

    return { dept, num, reqGrade, concurrent };
}

function parseTakenCourse(input) {
    const parts = input.trim().toUpperCase().split(/\s+/);

    const str = parts[0];
    const grade = parts[1] ?? null;

    const dept = str.slice(0, 4);
    const num = str.slice(4, 7);

    return { dept, num, gotGrade: grade };
}

function gradeMeets(required, got) {
    if (!required) return true; // no grade requirement
    if (!got) return false; // no grade earned = no pass
    return got.charCodeAt(0) <= required.charCodeAt(0);
}

function isCourseMet(required, taken) {
    for (const t of taken) {
        const tk = parseTakenCourse(t);
        if (tk.dept === required.dept && tk.num === required.num) {
            return gradeMeets(required.reqGrade, tk.gotGrade);
        }
    }
    return false;
}

function isEnrolled(required, enrolled) {
    const target = required.dept + required.num; // e.g. "CSCE221"
    return enrolled.some((e) =>
        e.replace(/\s+/g, "").toUpperCase().startsWith(target)
    );
}

function evaluateTree(node, taken = [], enrolled = []) {
    if (node.type === "single") {
        const parsed = parseCourseString(node.course);

        const metByTaken = isCourseMet(parsed, taken);

        let isMet = metByTaken;

        if (!isMet && parsed.concurrent) {
            const concurrentOk = isEnrolled(parsed, enrolled);
            if (concurrentOk) isMet = true;
        }

        return {
            ...node,
            status: isMet ? "met" : "needed",
        };
    }

    const evaluatedChildren = node.children.map((child) =>
        evaluateTree(child, taken, enrolled)
    );

    let status;

    if (node.type === "and") {
        status = evaluatedChildren.every((c) => c.status === "met")
            ? "met"
            : "needed";
    } else {
        status = evaluatedChildren.some((c) => c.status === "met")
            ? "met"
            : "needed";
    }

    return {
        ...node,
        children: evaluatedChildren,
        status,
    };
}

module.exports = {
    parsePrereqs,
    evaluateTree,
};