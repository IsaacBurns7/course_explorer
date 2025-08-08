function parseAlternateDegreePlan(text) {
  const termPattern = /^(\d{4})\s*-\s*(Fall|Spring|Summer)/i;
  const coursePattern = /^([A-Z]{2,4})\s*-\s*(\d{3})\s*\((\d+)\)/;

  const terms = {};
  let currentTerm = null;
  let foundAnyCourses = false;

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Detect a term header
    const termMatch = trimmed.match(termPattern);
    if (termMatch) {
      const [, year, season] = termMatch;
      currentTerm = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
      terms[currentTerm] = [];
      continue;
    }

    // Detect course line
    if (currentTerm) {
      const courseMatch = trimmed.match(coursePattern);
      if (courseMatch) {
        const [, dept, num, hours] = courseMatch;

        // Title is usually on the next non-empty line
        let title = "";
        let j = i + 1;
        while (j < lines.length && title === "") {
          const nextLine = lines[j].trim();
          // Skip empty lines and grade/attribute codes
          if (nextLine && !/^[A-Z]{1,4}$/.test(nextLine)) {
            title = nextLine;
            break;
          }
          j++;
        }

        terms[currentTerm].push({
          department: dept,
          number: num,
          title: title.trim(),
          hours: parseInt(hours, 10),
        });

        foundAnyCourses = true;
      }
    }
  }

  if (Object.keys(terms).length === 0) {
    throw new Error("Parsing failed: No valid terms found.");
  }
  if (!foundAnyCourses) {
    throw new Error("No courses found — please make sure you copied from the correct view.");
  }

  return terms;
}

// Example usage:
const rawText = `
For items not currently on this menu, please search on the home page.
Texas A&M University
Howdy
(Search, select, and gig 'em)
Academic Terms
2024-2025
12 Courses, 29 Credits
2024 - Fall
8 Courses, 19 Credits
CHEM - 107 (3)
GEN CHEM FOR ENGINEERS
B
CHEM - 117 (1)
GEN CHEM FOR ENGR LAB
A
CLEN - 181 (0)
ENGR LC SUCCESS SEMINAR
S
CSCE - 110 (4)
PROGRAMMING I
TCR

ENGL - 104 (3)
COMPOSITION & RHETORIC
TCR

ENGR - 102 (2)
ENGR LAB I COMPUTATION
A
MATH - 251 (3)
ENGINEERING MATH III
A
POLS - 207 (3)
STATE & LOCAL GOVT
A
2025 - Spring
7 Courses, 18 Credits
CSCE - 120 (3)
PROGRAM DESIGN & CONCEPTS
A
MATH - 308 (3)
DIFFERENTIAL EQUATIONS
A
OCNG - 251 (3)
THE BLUE PLANET OUR OCEANS
A
OCNG - 252 (1)
THE BLUE PLANET OCEAN LAB
A

PHYS - 206 (3)
HNR-NEWTONIAN MECH ENGR & SCI
B
PHYS - 216 (2)
EX PHYS ENGR LAB II MECHANICS
A

STAT - 211 (3)
PRIN OF STATISTICS I
A
2025 - Summer
0 Courses, 0 Credits
2025-2026
11 Courses, 37 Credits
2025 - Fall
5 Courses, 16 Credits
CSCE - 221 (4)
DATA STRUC & ALGORITHMS


CSCE - 222 (3)
DISCRETE STRUC COMPUTING


ECEN - 248 (4)
INTRO TO DGTL SYM DSGN


PERF - 301 (3)
PERF IN WORLD CULTURES

PHYS - 217 (2)
EX PHYS ENGR LAB III ELEC MAGN

2026 - Spring
5 Courses, 18 Credits
CSCE - 313 (4)
INTRO TO COMPUTER SYSTEM

ECEN - 214 (4)
ELEC CIRCUIT THEORY

ECEN - 350 (4)
COMPUTER ARCH & DESIGN

MATH - 311 (3)
TOP IN APPLIED MATH I

MATH - 471 (3)
COMM AND CRYPTOGRAPHY II


2026 - Summer
1 Courses, 3 Credits
ENGL - 210 (3)
TECHNICAL PROFESSIONAL WRITING

2026-2027
12 Courses, 33 Credits
2026 - Fall
6 Courses, 17 Credits
CSCE - 331 (4)
FOUNDATIONS SOFTWARE ENGINEER

UWRT
CSCE - 441 (3)
COMPUTER GRAPHICS

CSCE - 462 (3)
MICROCOMPUTER SYSTEMS

CSCE - 481 (1)
SEMINAR

ECEN - 314 (3)
SIGNALS AND SYSTEMS

ECEN - 449 (3)
MICROPROCSR SYS DSGN

2027 - Spring
6 Courses, 16 Credits
CSCE - 399 (0)
HIGH-IMPACT EXPERIENCE

CSCE - 443 (3)
GAME DEVELOPMENT

CSCE - 447 (3)
DATA VISUALIZATION


CSCE - 483 (3)
COMPUTER SYS DESIGN


UCRT
ECEN - 325 (4)
ELECTRONICS

ECEN - 454 (3)
DIG INTEGRATEDCKT DES

2027 - Summer
0 Courses, 0 Credits
Courses 
Attributes
Subjects
Title or Number
Feedback

`;

try {
  const result = parseAlternateDegreePlan(rawText);
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error({ error: err.message });
}