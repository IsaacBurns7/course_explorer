// src/diagram_parser.ts
import type { Node } from "./types";

let _nodeId = 0;
function makeId() {
  return `node-${_nodeId++}`;
}
/**
 * Parse an input prereq expression (arrays with "." as OR) into a Node.
 * For top-level usage we expose parsePrereqsList which returns Node[] (branches).
 */

export function parsePrereqs(input: any): Node {
  // If input is a string -> single node
  if (typeof input === "string") return { type: "single", id:makeId(), course: input };

  if (!Array.isArray(input)) throw new Error("Unexpected prereq format");

  // If the array contains "." treat the array as OR of segments
  if (input.includes(".")) {
    const segments: any[][] = [];
    let current: any[] = [];

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
    return { type: "or", id:makeId(), children };
  }

  // otherwise the array is an AND group
  return parseAndSegment(input);
}

function parseAndSegment(arr: any[]): Node {
  const children = arr.map(parsePrereqs);
  if (children.length === 1) return children[0];
  return { type: "and", id:makeId(), children };
}

/**
 * Helper to parse the top-level prereq array into an array of Node branches
 * (useful for attaching them to the root single course)
 */
export function parsePrereqsList(input: any): Node[] {
  if (!Array.isArray(input)) {
    // single item -> single node as single branch
    return [parsePrereqs(input)];
  }

  // We want top level to be multiple branches, split by "." into segments.
  if (input.includes(".")) {
    const segments: any[][] = [];
    let current: any[] = [];
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
    return segments.map(seg => parseAndSegment(seg));
  }

  // no "." -> every element is its own branch (AND collapsed into a branch or single)
  // But you said you want separate branches at top-level, so treat each item as one branch.
  return input.map((it: any) => parsePrereqs(it));
}
