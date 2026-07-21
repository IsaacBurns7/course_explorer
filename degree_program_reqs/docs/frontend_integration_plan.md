# Degree Progress — Frontend/Backend Integration Plan

> Handoff doc. Read this to resume the "degree progress" feature: a user picks a major
> (+ up to two minors), fills their planner, clicks **Check Requirements**, and sees what
> they're missing for Major / Minor(s) / UCC. Written for someone comfortable in the
> backend but new to wiring a React frontend to it.

---

## 1. Goal / user flow

1. User opens the **Degree Planner** (already exists, `frontend/src/pages/Planner.js`).
2. On load, the backend sends the **list of majors + minors** and the **UCC (core
   curriculum) data**.
3. User selects **one major** and **up to two minors**. Each selection fetches that
   program's requirements from the backend. *(Future: double major + University Honors,
   which behaves like a third minor. Design for ~5 selections max.)*
4. User fills in classes exactly as the planner works today.
5. A **Check Requirements** button runs a **client-side** matching function that diffs the
   selected programs' requirements against the planned courses.
6. Results render, bucketed by **Major / each Minor / UCC**: what's met, what's missing.

---

## 1b. Implementation status

| # | Step | Status |
|---|------|--------|
| 1 | Full 817-program re-scrape (`kind` tag, footnotes 6–11, 25-cap removed) | **done** — 817 programs, **811 with requirements**, **0 unresolved footnote refs** |
| 2 | `database/models/program_requirements.sql` | **written, NOT applied — blocked, see below** |
| 3 | `database/migration_tools/seedProgramRequirements.js` | written, cannot run until tables exist |
| 4 | `backend/src/routes/programs.ts` + `controllers/programs.js`, registered in `server.ts` | done, compiles, route verified live |
| 5 | `frontend/src/lib/degreeProgress.js` matching engine | done, verified against real catalog data |
| 6 | `frontend/src/components/DegreeProgress.js`, mounted in `components/Planner.js` | done, compiles |

### ⚠ Blocker: DDL permission on the `course_explorer` schema

The schema is owned by role **`isaac`**; the app connects as **`neondb_owner`**, which has
`USAGE` but not `CREATE`:

```
has_schema_privilege(current_user,'course_explorer','CREATE') -> false
GRANT CREATE ON SCHEMA course_explorer TO CURRENT_USER  -> reports OK but is a no-op
GRANT isaac TO CURRENT_USER                             -> permission denied
```

So steps 2–3 must be run with the **schema owner's credentials** (`isaac`, or via the Neon
console/psql as that role):

```sql
-- as isaac
\i database/models/program_requirements.sql
-- optionally, so the app role can keep seeding later:
GRANT CREATE ON SCHEMA course_explorer TO neondb_owner;
```
then
```
NODE_PATH=backend/node_modules node database/migration_tools/seedProgramRequirements.js
```

Everything downstream is already wired: with the tables present and seeded,
`GET /api/programs` starts returning data and the planner panel works. Verified today that
the route reaches the controller and the DB — it currently returns exactly
`relation "course_explorer.program_requirements" does not exist`, i.e. the only missing
piece is the table.

---

## 1a. Execution order (start here)

Build bottom-up; each step is testable in isolation, so you never debug two unknowns at
once. Steps 1–4 are backend-native (your comfort zone); only 5–6 are new frontend work,
and 5 is just pure logic.

| # | Step | Prove it works by | Layer file(s) |
|---|------|-------------------|---------------|
| 1 | Re-scrape to fill footnotes 6–11 | `program_requirements_clean.json` footnotes dict has keys 6–11 | `scrape_programs.py` |
| 2 | Create the two tables | `SELECT` returns the tables on Neon | `database/models/program_requirements.sql` |
| 3 | Seed DB from the JSON | `SELECT count(*)` ≈ #majors+#minors; a CS row has non-empty `requirements` | `database/migration_tools/seedProgramRequirements.js` |
| 4 | Add + register endpoints | `curl localhost:4000/api/programs` and `.../bs-computer-science/requirements` | `backend/src/routes/programs.ts`, `backend/src/controllers/programs.js`, `src/server.ts` |
| 5 | Pure matching engine | hand-made planner → `evaluateAll` gives correct met/missing by hand | `frontend/src/lib/degreeProgress.js` |
| 6 | Planner UI: fetch, selectors, Check button, results | select BS CS in browser, click Check, see Major/Minor/UCC | `frontend/src/pages/Planner.js` (+ optional `components/`) |

**The mental model that makes this click:** the frontend never touches the DB. You
already own `route → controller → SQL → JSON`. Integration only adds a step on each end:
`React calls a URL → (that loop) → React puts the JSON in state → re-renders`. In dev the
seam is the webpack proxy — React calls `/server/api/...`, which is rewritten to
`localhost:4000/api/...`; never hardcode the backend host in frontend code.

---

## 2. Data we already have (inputs)

All in `degree_program_reqs/`:

- **`program_requirements_clean.json`** — one object per program:
  ```jsonc
  {
    "desc_name": "Bachelor of Science in Computer Science",
    "intro": [...],
    "footnotes": { "1": "A grade of C or better is required.", "6": "Science elective: ...", ... },
    "requirements": [
      {"course": "CSCE 120", "alternatives": [], "footnotes": ["1"]},
      {"course": "ENGL 103", "alternatives": ["ENGL 104"], "footnotes": ["1"]},   // inline OR
      {"course": "COMM 203", "alternatives": ["COMM 205","ENGL 210"], "footnotes": []}, // select-group
      {"course": "Science elective", "alternatives": [], "footnotes": ["6"]}      // elective slot (label, not a code)
    ]
  }
  ```
  - `course` is the primary; `alternatives` are swappable (OR / slash-cross-list stays one
    token like `"ENGR 216/PHYS 216"`; select-groups collapse to primary + alternatives).
  - A requirement whose `course` is **not a course code** (e.g. `"Science elective"`) is an
    **elective slot** — informational only (see §5, option B).
  - University Core Curriculum labels were intentionally **dropped** from `requirements` —
    UCC is handled separately (below).
  - Produced by `scrape_programs.py :: generate_clean_program_requirments()`.

- **`core_curriculum.json`** — the UCC / ICD / CD data:
  ```jsonc
  [
    { "category": "university_core_curriculum",
      "areas": [
        {"name": "Mathematics", "hours_required": 6, "courses": [{"code":"MATH 151","cross_listed":["MATH 151"],"hours":"4",...}, ...]},
        {"name": "Life and Physical Sciences", "hours_required": 9, "courses":[...]}, ...
      ]},
    { "category": "international_cultural_diversity", "areas": [{"name":..., "hours_required":3, "courses":[...]}] },
    { "category": "cultural_discourse",              "areas": [{"name":..., "hours_required":3, "courses":[...]}] }
  ]
  ```
  8 UCC Foundational Component Areas (Communication 6, Mathematics 6, Life & Physical
  Sciences 9, Language/Philosophy/Culture 3, Creative Arts 3, American History 6,
  Government/Political Science 6, Social & Behavioral Sciences 3) + ICD 3 + CD 3.
  Produced by `scrape_core_curriculum.py`.

**Prerequisite before shipping:** `program_requirements_raw.json` was scraped with an old
version that capped footnotes at #5. Re-run `scrape_tables_raw()` then
`generate_clean_program_requirments()` so footnote text for refs **6–11** (Science
elective, Senior design, etc.) is present — option B shows that text to the user.

---

## 3. Finalized approach (decisions already made)

- **No hours or `ucc_hours` stored on programs.** If a student takes the plan's named
  courses, the hours follow. Hours are used in exactly one place: the UCC calculation,
  and they come from the **planner course objects** (`course.hours`) + the core area's
  `hours_required` — never from the program JSON.
- **UCC = classification, not a stored per-major number.** UCC hour needs differ per major
  only because majors bake core courses into their required list (CS's `MATH 151`,
  `PHYS 206` are also UCC). So the engine classifies **every planned course** (major-required
  ones included) into the core area pools and sums hours per area vs `hours_required`.
  Double-counting a course as both a major requirement and a UCC fill is **correct**.
- **Electives = informational (option B).** Elective slots ("Science elective",
  "Complementary elective") are listed with their footnote text as self-check items; the
  engine does **not** auto-mark them met/missing. Assumption: the user read the footnote and
  whatever they entered is approved (or hoped-to-be-approved).
- **Endpoints are per-program** (see §7).

---

## 4. Architecture overview

```
 CourseLeaf catalog                         (scrape, offline, python)
        │  scrape_programs.py / scrape_core_curriculum.py
        ▼
 program_requirements_clean.json + core_curriculum.json
        │  seed script (node, run once / on update)   ← "how the API pulls into the DB"
        ▼
 Neon Postgres  course_explorer.program_requirements  (+ core stored too)
        │  GET /api/programs, GET /api/programs/:id/requirements   (Express, backend/src)
        ▼
 React planner  ── fetch via /server proxy ──►  client-side matching engine  ──►  progress UI
```

Key stack facts (verified):
- **Authoritative backend is the TypeScript app in `backend/src/`**, compiled by `npx tsc`
  → `backend/dist/`, run as `node dist/server.js` (repo `Makefile` `run_backend`). The
  root-level `backend/server.js` / `backend/controllers/*.js` / `backend/routes/` are
  **legacy/dead** — do not edit those.
- DB: **Neon Postgres**, `pg` Pool in `backend/src/db.ts`, schema `course_explorer`.
- Frontend dev proxy (`frontend/webpack.config.js`): `/server/*` → `http://localhost:4000`
  with `^/server` stripped. So the frontend calls `/server/api/...` and the backend serves
  `/api/...` on port 4000.

---

## 5. THE integration walkthrough (backend-dev-friendly)

The mental model of front↔back: **the frontend never touches the DB.** It makes an HTTP
request (fetch/axios) to a URL; Express matches that URL to a *route*; the route calls a
*controller*; the controller queries Postgres and returns JSON; React puts that JSON into
component state; the component re-renders. That's the whole loop. You already own the
right half (route→controller→SQL). The new half is: React calls a URL and renders the
result.

### Step A — Store the data in the DB

**Where:** a new table in the `course_explorer` schema. Follow the existing JSONB pattern
(`database/models/planner.sql` has `course_explorer.degree_prereqs(course_id TEXT PRIMARY
KEY, prereqs JSONB)`).

Create `database/models/program_requirements.sql`:
```sql
CREATE TABLE course_explorer.program_requirements (
    program_id    TEXT PRIMARY KEY,          -- slug, e.g. 'bs-computer-science'
    desc_name     TEXT NOT NULL,             -- 'Bachelor of Science in Computer Science'
    kind          TEXT NOT NULL,             -- 'major' | 'minor'
    requirements  JSONB NOT NULL,            -- the requirements array from the clean JSON
    footnotes     JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE course_explorer.core_curriculum (
    category      TEXT PRIMARY KEY,          -- 'university_core_curriculum' | 'international_cultural_diversity' | 'cultural_discourse'
    data          JSONB NOT NULL             -- the areas array for that category
);
```
`kind` is derived at seed time: minors have `desc_name` ending in "Minor"; everything else
is a major. (Confirm against `program_links.json`, which was built from the catalog's
major vs minor divs — that's the authoritative source of which is which.)

Run this SQL once against Neon (psql or the Neon console).

### Step B — Seed the DB from the JSON  ("how the API pulls into the database")

This is a **one-off ingestion script**, not a request-time thing. The API *reads* from the
DB; a separate seed script *writes* the scraped JSON into the DB. Put it beside the other
migration/populate scripts: `database/migration_tools/seedProgramRequirements.js`
(pattern-match `populateCoursesSectionInfo.js`).

It should:
1. `require('pg')` Pool with `process.env.NEON_DB_URL` (same as `backend/src/db.ts`).
2. Read `degree_program_reqs/program_requirements_clean.json` and `core_curriculum.json`.
3. For each program: derive `program_id` (slugify `desc_name`) and `kind`, then
   `INSERT ... ON CONFLICT (program_id) DO UPDATE` so re-running is idempotent.
4. For each core category: upsert into `core_curriculum`.

Run manually whenever the scrape is refreshed: `node database/migration_tools/seedProgramRequirements.js`.

### Step C — Backend endpoints

**Where APIs live:** each resource is a *route file* in `backend/src/routes/<name>.ts`
that wires URLs to controller functions, plus a *controller* in
`backend/src/controllers/<name>.js` that runs the SQL. You register the route in
`backend/src/server.ts` with `app.use("/api/<name>", <name>Routes)`. (Pattern to copy:
`src/routes/course.ts` + `src/controllers/course.js`.)

Add `backend/src/routes/programs.ts`:
```ts
const express = require('express');
const { listPrograms, getProgramRequirements } = require('../controllers/programs');
const router = express.Router();
router.get("/", listPrograms);                        // GET /api/programs
router.get("/:id/requirements", getProgramRequirements); // GET /api/programs/:id/requirements
module.exports = router;
```

Add `backend/src/controllers/programs.js` (copy the `getPool()` + connect/try/finally
shape from `src/controllers/planner2.js`):
- `listPrograms`: returns `{ majors: [{program_id, desc_name}], minors: [...], core: [ ...core_curriculum rows... ] }`.
  - `SELECT program_id, desc_name, kind FROM course_explorer.program_requirements ORDER BY desc_name` → split by `kind`.
  - `SELECT category, data FROM course_explorer.core_curriculum`.
- `getProgramRequirements`: `SELECT desc_name, requirements, footnotes FROM course_explorer.program_requirements WHERE program_id = $1` → 404 if none.

Register in `backend/src/server.ts` (alongside the other `app.use`s):
```ts
const programRoutes: Router = require("./routes/programs");
app.use("/api/programs", programRoutes);
```
Then `npx tsc` and restart `node dist/server.js` (or `make run_backend`).

Smoke-test the backend directly before touching React:
`curl http://localhost:4000/api/programs` and
`curl http://localhost:4000/api/programs/bs-computer-science/requirements`.

### Step D — Frontend integration into the planner

The planner state lives in `frontend/src/pages/Planner.js` (`planner` object keyed by
semester, each course `{department, number, hours}`, persisted to
`localStorage["academicPlanner"]`). Course identity string is `` `${department} ${number}` ``
(see `Planner.js:187`). Four additions:

1. **Fetch programs + core on load.** In the planner page, add a `useEffect` that does
   `axios.get('/server/api/programs')` (axios is already a dependency; the add-course modal
   uses it) and stores `{majors, minors, core}` in React state. `/server` is rewritten to
   the backend by the dev proxy — you never hardcode `localhost:4000` in frontend code.

2. **Selectors.** A small component with one `<select>` for the major and up to two for
   minors, populated from the fetched `majors`/`minors`. On change, if not already cached,
   `axios.get(\`/server/api/programs/${id}/requirements\`)` and stash the result in a
   `selectedRequirements` map. Persist the *selection* (the ids) to
   `localStorage["degreeSelection"]`, mirroring how the planner persists itself.

3. **Matching engine** — new pure module `frontend/src/lib/degreeProgress.js`, no React, no
   network. Signature roughly:
   ```js
   plannedCodeSet(planner)         // -> Set of `${dept} ${number}`
   plannedByCode(planner)          // -> Map code -> {hours, ...}
   evaluateProgram(program, planned) // named reqs: met/missing; elective slots: listed (info)
   evaluateCore(coreData, planned)   // per area: sum planned-course hours in pool vs hours_required
   evaluateAll({major, minors, core, planner}) // -> { major, minors:[], core:{ areas:[{name, need, have, met}] } }
   ```
   - Named requirement `met = planned.has(course) || alternatives.some(a => planned.has(a))`.
   - Elective slot (primary isn't a code) → push to an `electiveSlots` info list with its
     footnote text; **no** met/missing status (option B).
   - Core area: for each area, `have = sum(course.hours for planned courses whose code (or a
     cross_listed alias) is in the area pool)`; `met = have >= hours_required`.

4. **Check button + results view.** A button that calls `evaluateAll(...)` on the current
   planner + selections and renders three sections (Major / each Minor / UCC). Reuse the
   existing Tailwind card styling from `Planner.js` (`bg-dark-card border border-gray-700
   rounded-xl`). Show per section: met count vs total, the list of missing named courses,
   and the elective-slot self-check list. For UCC: per area, `have/need` hours and a
   met/short flag. Because the engine is pure and reads current `planner` state, results
   update whenever they re-click Check.

**Placement:** simplest is a panel inside the planner view (`components/Planner.js` already
holds `planner`), so it reacts to plan edits without new routing. Alternative: a new
`pages/DegreeProgress.js` route added to `App.js`.

---

## 5a. Scraper robustness notes

- **Transient connection drops.** A full ~800-page run reliably ends with a handful of
  `RemoteDisconnected` failures — the catalog drops connections when hit hard. `fetch()`
  now retries with exponential backoff over a shared `requests.Session`, and
  `repair_failed_programs()` re-scrapes only the records that still carry an `error` and
  merges them back, so you never re-fetch all 800 to recover a few. The first full run hit
  18 such failures; the repair pass recovered 18 of 18.
- **`limit` parameter** on `scrape_tables_raw()` for quick dev runs (was a hardcoded
  25-program cap).
- **Footnote separators.** Most pages use commas between refs, a few use a period
  (`"Engineering Mathematics I 1.2"` means footnotes 1 *and* 2). Both the scraper and
  `_row_footnotes()` split on `[,.\s]+`.
- Six programs legitimately have no plan grid (department landing pages / prose-only
  minors); the seed script skips records with empty `requirements`.

---

## 6. Known limitations (acceptable v1)

- "Select **two/three** of the following" collapses to primary + alternatives — undercounts
  multi-pick groups. Pre-existing in the clean JSON.
- Elective/ICD/CD picks are trusted, not validated against approved pools (by design).
- Cross-list matching relies on the exact code string; the core pools carry `cross_listed`
  aliases to help, but the program JSON keeps the combined `"A/B"` token — the engine should
  check both the raw token and its `/`-split parts against the planner.

---

## 7. Verification (end to end)

1. **DB/seed:** run the schema SQL + seed script; `SELECT count(*) FROM
   course_explorer.program_requirements;` (expect ~majors+minors), and confirm a CS row has
   a non-empty `requirements` JSONB and CS core is absent from it.
2. **API:** `curl localhost:4000/api/programs` (majors, minors, core present) and
   `.../api/programs/bs-computer-science/requirements` (requirements + footnotes).
3. **Engine (unit):** feed a hand-made planner (a few CSCE + MATH + PHYS courses) into
   `evaluateAll` for BS CS; by hand, confirm met/missing named lists, elective slots listed,
   and that Mathematics/Life & Physical Sciences UCC areas pick up MATH/PHYS hours.
4. **UI (browser):** `make run` (or `cd frontend && npm run dev` + `node dist/server.js`);
   open the planner, add CSCE courses, select BS Computer Science, click Check — CSCE core
   shows met, the rest missing, electives listed, UCC areas show have/need. Add a minor and
   confirm its section. Use the Browser pane to watch it react to plan edits.

---

## 8. Task checklist

- [ ] Re-scrape to fill footnotes 6–11 (`scrape_tables_raw()` → `generate_clean_program_requirments()`).
- [ ] `database/models/program_requirements.sql` (two tables) + run on Neon.
- [ ] `database/migration_tools/seedProgramRequirements.js` + run once.
- [ ] `backend/src/routes/programs.ts` + `backend/src/controllers/programs.js` + register in `src/server.ts`; `npx tsc`.
- [ ] `frontend/src/lib/degreeProgress.js` (pure matching engine).
- [ ] Planner: fetch-on-load, selectors, Check button, results view.
