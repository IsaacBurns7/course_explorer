const { expect } = require("chai");

const {
  parsePrereq,
  parseClause,
  parseDisjunction,
  parseConjunction,
  parseCondition,
  parseCourse,
  parseCourseList,
} = require("../services/planner/createDAG"); // adjust path

// describe("Parser functions", () => {
//   // --- Leaf parsers ---
//   it("parseCourse returns a COURSE node", () => {
//     const result = parseCourse("ACCT 315");
//     expect(result).to.deep.equal({
//       type: "COURSE",
//       children: ["ACCT 315"]
//     });
//   });

//   it("parseCourseList returns a COURSE_LIST node", () => {
//     const result = parseCourseList("ACCT 315, ACCT 327");
//     expect(result.type).to.equal("COURSE_LIST");
//     expect(result.children[0]).to.include("ACCT 315");
//   });

//   it("parseCondition wraps input as CONDITION", () => {
//     const result = parseCondition("Grade of C or better");
//     expect(result).to.deep.equal({
//       type: "CONDITION",
//       children: ["Grade of C or better"]
//     });
//   });

//   // --- Higher-level rules ---
//   it("parseConjunction splits on 'and'", () => {
//     // NOTE: depends on delimiterIndexes implementation being correct
//     const result = parseConjunction("ECEN 314 and ECEN 325");
//     expect(result.type).to.equal("CONJUNCTION");
//     expect(result.children.length).to.be.greaterThan(1);
//   });

//   it("parseDisjunction splits on 'or'", () => {
//     const result = parseDisjunction("ACCT 315 or ACCT 327");
//     expect(result.type).to.equal("DISJUNCTION");
//     expect(result.children).to.be.an("array");
//     expect(result.children.length).to.equal(2);
//     expect(result.children[0].type).to.equal("CONJUNCTION");
//   });

//   it("parseClause wraps disjunctions into CLAUSE", () => {
//     const result = parseClause("ACCT 315 or ACCT 327");
//     expect(result.type).to.equal("CLAUSE");
//     // children[0] is the array returned by parseSyntaxTreeGeneric
//     expect(result.children[0][0].type).to.equal("DISJUNCTION");
//   });

//   it("parsePrereq splits clauses on semicolon", () => {
//     const input = "ACCT 315 or ACCT 327; FINC 341";
//     const result = parsePrereq(input);

//     expect(result.type).to.equal("PREREQ");
//     expect(result.children.length).to.equal(2);
//     expect(result.children[0].type).to.equal("CLAUSE");
//   });

//   // --- Edge cases ---
//   it("parsePrereq handles trailing semicolon gracefully", () => {
//     const input = "ACCT 315;";
//     const result = parsePrereq(input);
//     expect(result.children.length).to.equal(1);
//   });

//   it("parseDisjunction preserves protected words", () => {
//     const input = "Junior or senior classification";
//     const result = parseDisjunction(input);
//     expect(result.children.length).to.equal(2);
//   });
// });

describe("Parser full prerequisite test", () => {
  it("parses a complex prerequisite string into a PREREQ syntax tree", () => {
    const input = "Grade of C or better in MART 200 or NAUT 200; grade of C or better in MART 202, MART 210 or MART 306, MART 212 or MART 312, MART 215 or MART 301, MART 303 and MART 321, or concurrent enrollment; junior or senior classification or approval of MART department head.";

    const result = parsePrereq(input);

    // Top-level node
    expect(result.type).to.equal("PREREQ");
    expect(result.children).to.be.an("array");
    expect(result.children.length).to.be.greaterThan(1);

    // Check first clause
    const firstClause = result.children[0];
    expect(firstClause.type).to.equal("CLAUSE");
    expect(firstClause.children[0].type).to.equal("DISJUNCTION");

    // Check second clause
    const secondClause = result.children[1];
    expect(secondClause.type).to.equal("CLAUSE");

    // Check third clause
    const thirdClause = result.children[2];
    expect(thirdClause.type).to.equal("CLAUSE");

    // Optional: check that the leaves contain strings
    function checkLeaves(node) {
      if (!node.children) return;
      node.children.forEach(child => {
        if (child.children) {
          checkLeaves(child);
        } else {
          expect(child).to.be.a("string");
        }
      });
    }

    result.children.forEach(clause => checkLeaves(clause));
  });
});
