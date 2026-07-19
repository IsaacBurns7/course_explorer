# TAMU CourseLeaf Catalog — Structure & Scraping Reference

How `catalog.tamu.edu` encodes undergraduate degree requirements, and the standardized
signals for scraping them. The catalog runs on **CourseLeaf (Leepfrog CMS)** — one template
site-wide, so a single parser works across all colleges and degree types.

**Verified against 21 degree pages / 8 colleges / 5 degree types** (BS, BA, BLA, BSN, BBA)
spanning Engineering, Arts & Sciences, Agriculture, Architecture, Fine Arts, Nursing, Vet
Med, and Business. No structural divergence observed.

---

## 1. URL taxonomy

```
/undergraduate/<college>/                                 college index (lists departments/majors)
/undergraduate/<college>/<department>/                    department page (lists that dept's degrees)
/undergraduate/<college>/<department>/<program>-<deg>/    DEGREE page  ← requirements live here
/undergraduate/<college>/<program>-<deg>/                 (some depts collapse a level)
```

- Degree suffixes: `-bs`, `-ba`, `-bba`, `-bfa`, `-bla`, `-bsn`, or a bare `/bs/`, `/ba/` when
  the department has one degree (e.g. `/engineering/chemical/bs/`).
- **A degree page has a requirements table; a department/college page does not.** Fetching
  `/engineering/chemical/` (no `/bs/`) returns a landing page with **no**
  `#programrequirementstextcontainer`. Always resolve to the `-<deg>/` URL.
- The `#programrequirementstext` fragment just scrolls to the tab; the content is in the
  server-rendered HTML regardless of the fragment.

**Enumerating programs:** a college index page contains `<a href>` links to every degree
page. Filter hrefs to those ending in a degree suffix, then keep only the ones whose fetched
HTML contains a `sc_plangrid`/`sc_courselist` table.

---

## 2. Page anatomy

The requirements live in one container:

```
#programrequirementstextcontainer
├── intro <p> paragraphs (may describe a shared freshman year)
├── table.sc_plangrid      × 1–2   ← the term-by-term plan (primary)
├── table.sc_courselist    × 0–n   ← supplementary option/elective lists (some programs)
└── <ol> footnotes                 ← grade rules, elective definitions ("see advisor")
```

- Presence check: `document.querySelector('#programrequirementstextcontainer')` (or the
  server HTML contains the string). Missing ⇒ not a degree page.
- Most programs use **`sc_plangrid`**; some also include **`sc_courselist`** tables for
  option lists. Parse both.

---

## 3. `sc_plangrid` table structure

A 4-year plan. Row types (by `<tr>` class):

| `<tr>` class | Role | Cells |
|---|---|---|
| `plangridyear` | Year header ("First Year") | `td.year` |
| `plangridterm` | Term header ("Fall Semester Credit Hours") | header text |
| `even` / `odd` | **Course/requirement rows** | `td.codecol`, `td.titlecol`, `td.hourscol` |
| `plangridsum even/odd` | Term subtotal | hours only |
| `plangridtotal lastrow …` | Grand total | hours only |

**Skip** `plangridyear`, `plangridterm`, `plangridsum`, `plangridtotal` — they carry no
requirement. Only `even`/`odd` rows with a `.codecol` matter.

### Cell anatomy of a course row

| Cell | Content |
|---|---|
| `td.codecol` | The course code **or** a flexible-slot label. Specific courses are a hyperlink: `<a class="bubblelink code">CSCE 313</a>`. Footnote refs are `<sup>` inside the cell. |
| `td.titlecol` | Course/slot title. |
| `td.hourscol` | Credit hours. May be blank (option sub-rows), a single number, or a range (`3-4`). |

---

## 4. THE required-vs-flexible signal (most important)

Whether a requirement is a **hard, specific course** or a **flexible slot satisfiable
elsewhere** is encoded by the hyperlink:

- **`codecol` contains `<a class="bubblelink code">`** → a **specific course**. The degree
  names this exact course.
- **`codecol` is plain text** ("Science elective", "University Core Curriculum") → a
  **flexible slot**; the shown text is a placeholder, not a course.

This held across all sampled programs: 447 specific-course cells all carried the
`bubblelink code` class; flexible slots were plain text.

⚠️ **Two refinements** (a linked course is not automatically "hard"):

1. **Filter to the `code` class, not any `<a>`.** ~20% of links in the container are
   *non-`code`* links — pointers to elective **list** pages or footnote anchors. Only
   `a.bubblelink.code` denotes a specific course.
2. **Grouping context demotes a linked course to flexible** when it sits under a
   `Select one of the following:` header or is joined by `or` / `/` (see §5).

---

## 5. Row classification

Apply in order per `even`/`odd` row:

| Detected | Classification | Signal |
|---|---|---|
| `codecol` text = `Select one of the following:` | **choice group header** | opens a group; the following blank-`hourscol` rows are its options |
| inside an open choice group (blank hours, has `a.code`) | **flexible choice option** | the group's options are mutual alternatives |
| `a.code` with `or` / `/` in the cell | **flexible choice** | e.g. `ENGR 216 or PHYS 216`, `CSCE 222/ECEN 222` (cross-list) |
| single standalone `a.code` | **hard requirement** | e.g. `CSCE 313` — must be taken |
| plain text matching `…elective(s)` | **flexible elective pool** | footnote usually defines it (often "see advisor") |
| plain text = core-category name | **core requirement** | satisfiable elsewhere; see vocabulary |
| plain text = `High Impact Experience`, `Semester Away`, etc. | **non-course requirement** | no course list |
| `plangridsum` / `plangridtotal` / headers | **skip** | totals & structure |

`/` is ambiguous: **different subjects** (`CSCE 222/ECEN 222`) = cross-list (either satisfies);
**same subject** (`CHEM 107/117`) = usually a lecture+lab pair (**both** required). Disambiguate
by subject equality.

---

## 6. Flexible-slot vocabulary (standardized)

Plain-text placeholders fall into a small, consistent set:

- **Choice header:** `Select one of the following:`
- **Elective pools:** `<X> elective(s)` — `general`, `science`, `supporting`, `directed`,
  `complementary`, `computer science`, `math`, `history`, `english`, `economics`, `technical`,
  `international`, `biology`, … (the `elective` suffix is the reliable marker)
- **Core categories:** `University Core Curriculum`, `Foreign Language`, `Life and Physical
  Sciences`, `Social and Behavioral Sciences`, `Communication`, `Mathematics`, `Creative Arts`,
  `Language, Philosophy and Culture`, `American History`, `Government/Political Science`,
  `International and Cultural Diversity`, `Cultural Discourse`
- **Non-course:** `High Impact Experience`, `Semester Away`
- **Program-specific (rare):** `CHEN Specialty Options`, `Community Health/Environmental
  Health` — treat as flexible/other via the "not an `a.code` and not matched above" fallback

---

## 7. Footnotes

A trailing `<ol>` in the container; item *n* = superscript reference *n* in the grid.

- Extract from `.sc_footnotes ol li` / `ol li` (position = number).
- **Footnote 1 is almost always** `"A grade of C or better is required."` → any row whose
  `<sup>` includes `1` carries `program_grade_min = "C"`.
- **Elective definitions** live here and are usually **advisor-gated**: `"See advisor for
  list of acceptable science courses."`, `"…chosen only after consultation with a departmental
  advisor."`, `"Of the 18 hours shown as computer science electives, 3 must be from systems…
  See advisor for list of acceptable course choices."` The catalog does **not** enumerate
  these pools — flag such slots `advisor_gated: true` and source the eligible courses elsewhere.
- Core-distribution rules (how many hours of creative arts / social science / history) also
  live in footnotes.

---

## 8. `sc_courselist` tables

Same cell classes (`.codecol` / `.titlecol` / `.hourscol`) and the same `a.bubblelink.code`
signal, but organized as a flat list rather than a term plan. Used for supplementary option
lists (e.g., an enumerated set of acceptable electives when the department *does* publish one).
Rows include `.courselistcomment` for "Select N hours from the following" headers. Parse with
the same §4–§5 rules.

---

## 9. Gotchas & limits

1. **Department vs degree URL** — resolve to the `-<deg>/` page (§1).
2. **`a.code` only** — ignore non-`code` links (list-page/anchor links).
3. **No major-vs-core label.** `MATH 151` and `CSCE 313` are both `a.code` hard requirements;
   the catalog does **not** tag which bucket (major / supporting / core) a course belongs to.
   Howdy's `areas` does (via `M-`/`S-`/`UNIV-*` area codes). If "required for the *major*"
   must exclude hard core courses, layer a subject filter (major subject, e.g. `CSCE`).
4. **The plangrid can hard-code a flexible pick** — occasionally a specific course is placed
   in a slot that is actually flexible, making it look mandatory. Rare; footnotes/`University
   Core Curriculum` rows are the reliable flexible markers.
5. **Advisor-gated electives are unenumerable here** (and in Howdy) — inherent to the degree
   design, not a scraping limit.
6. **Shared freshman year** — many engineering plans share an identical first year (stated in
   the intro paragraph); the grid still lists it per-program, so no special handling needed.
7. **Catalog-year drift** — the catalog is the current published curriculum; a Howdy eval
   reflects whatever catalog term its what-if was submitted under. The two can list different
   courses (e.g. CPSC catalog includes `CSCE 231/325/399/411` that a prior Howdy eval omitted).
   The catalog is the authoritative *published* version.

---

## 10. Scraping recipe

```
enumerate degree URLs from each college index (filter to -<deg>/ suffixes that render a grid)
for each degree page:
  prc = #programrequirementstextcontainer
  footnotes = { n: text } from prc <ol>
  pending_choice = None
  for tr in prc 'table.sc_plangrid tr, table.sc_courselist tr':
    if tr is year/term/sum/total header: continue
    cc = tr .codecol ; hrs = tr .hourscol
    refs = digits from cc <sup> ; grade = 'C' if '1' in refs
    strip <sup> from cc ; text = cc.text
    if text == 'Select one of the following:':  pending_choice = []; continue
    links = cc 'a.bubblelink.code' (specific courses)
    if pending_choice is not None and links and hrs is blank:
        pending_choice += links; continue
    if pending_choice: emit_choice(pending_choice, grade); pending_choice = None
    if links:
        alts = other links + 'or'/'/'-parsed alternatives
        emit each link as { role: required, alternatives: alts, grade } # hard if alts == []
    elif text matches /elective/i:
        advisor = any 'advisor' in footnotes[ref]
        emit slot { name: text, hours: hrs, advisor_gated, grade }
    elif text in core-vocabulary:  emit core slot (or skip; handled separately)
    else: emit non-course / other slot
```

**Key selectors:** container `#programrequirementstextcontainer` · rows
`table.sc_plangrid tr` / `table.sc_courselist tr` · code cell `td.codecol` · hours
`td.hourscol` · **specific course** `a.bubblelink.code` · footnotes `.sc_footnotes ol li`.

**Required-vs-flexible in one line:** a standalone `a.bubblelink.code` is a hard requirement;
anything else (choice option, `or`/`/`, `…elective`, core placeholder) is flexible.
