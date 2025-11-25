import type { Node } from "./types";

// ==============================================
// Helpers
// ==============================================

// Parse a course like:
//   "CSCE221C^"
//   dept = CSCE, num = 221, reqGrade = C (optional), concurrent = true (optional)
function parseCourseString(raw: string) {
  let str = raw.replace(/\s+/g, "").toUpperCase();

  const concurrent = str.endsWith("^");
  if (concurrent) str = str.slice(0, -1);

  const dept = str.slice(0, 4);
  const num = str.slice(4, 7);
  let reqGrade: string | null = null;

  if (str.length > 7) {
    reqGrade = str[7]; // single letter
  }

  return { dept, num, reqGrade, concurrent };
}

// Parse a TAKEN course:
// "CSCE120 C" → dept: CSCE, num:120, gotGrade: C
function parseTakenCourse(input: string) {
  const parts = input.trim().toUpperCase().split(/\s+/);

  const str = parts[0];
  const grade = parts[1] ?? null;

  const dept = str.slice(0, 4);
  const num = str.slice(4, 7);

  return { dept, num, gotGrade: grade };
}

// Ordinal grade check — A<B<C<D<F on ASCII table
function gradeMeets(required: string | null, got: string | null): boolean {
  if (!required) return true; // no grade requirement
  if (!got) return false; // no grade earned = no pass
  return got.charCodeAt(0) <= required.charCodeAt(0);
}

// Find taken + match grade
function isCourseMet(
  required: ReturnType<typeof parseCourseString>,
  taken: string[]
) {
  for (const t of taken) {
    const tk = parseTakenCourse(t);
    if (tk.dept === required.dept && tk.num === required.num) {
      return gradeMeets(required.reqGrade, tk.gotGrade);
    }
  }
  return false;
}

// Find if concurrently enrolled
function isEnrolled(
  required: ReturnType<typeof parseCourseString>,
  enrolled: string[]
) {
  const target = required.dept + required.num; // e.g. "CSCE221"
  return enrolled.some((e) =>
    e.replace(/\s+/g, "").toUpperCase().startsWith(target)
  );
}

// ==============================================
// Main evaluateTree
// ==============================================
export function evaluateTree(
  node: Node,
  taken: string[] = [],
  enrolled: string[] = []
): Node {
  if (node.type === "single") {
    const parsed = parseCourseString(node.course);

    // 1. Was requirement fully met via taken classes?
    const metByTaken = isCourseMet(parsed, taken);

    // 2. If not met, can it be met via concurrent enrollment?
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

  // Recurse on children
  const evaluatedChildren = node.children.map((child) =>
    evaluateTree(child, taken, enrolled)
  );

  let status: "met" | "needed";

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
