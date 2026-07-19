# Degree Requirements — Adapted Format

Target schema that `GET /main/api/degree-evaluation/areas?reqNo=<reqNo>` responses are
transformed into. Program-agnostic: derived purely from the structure of the audit, so it
works for **any** `reqNo` (any major or minor).

## Top-level shape

A map of **program → its requirement courses**. Each program key pairs to a map of
**course code → course object**.

```jsonc
{
  "BS IDIS": {
    "MMET 201": Course,
    "STAT 211": Course,
    ...
  },
  "BS CPSC": {
    ...
  }
}
```

The program is the outer key, so nothing under it repeats the program. Each course appears
**once** per program (see de-dup rule below).

The raw `areas` response is a flat array (one row per **area × rule × applied course**).
Adaptation:

1. **Drops the personal transcript layer** — every `SMRDOUS_*` field, `AREA_MET_IND`,
   `AREA_GPA`, `*_ACT_*`, `SMBAOGN_PIDM`. What remains is the reusable requirement template.
2. **Groups** rows by `SMBAOGN_AREA` → `SMRDORQ_RULE` (dedupes repeated fulfillment rows).
3. **Classifies** each rule (see taxonomy) to decide whether it produces course entries.
4. **Emits course objects** under the program.

Course facts (`hours`, `pass_grade`, `prereqs`, `coreqs`) do **not** come from `areas` — they
are merged in from the separate course source, keyed on the course code.

---

## `Course` object

```jsonc
"MMET 201": {
  "hours": 4,                 // from course source (not areas)
  "pass_grade": "D",          // from course source (not areas)
  "prereqs": ["MMET 181"],    // from course source (not areas)
  "coreqs": [],               // from course source (not areas)

  "role": "required",         // from areas
  "alternatives": [],         // from areas
  "program_grade_min": "C"    // from areas
}
```

| Field | Type | Source | Description |
|---|---|---|---|
| `hours` | int \| null | course source | Catalog credit hours. `areas` never provides this. |
| `pass_grade` | string \| null | course source | Catalog grade for credit (usually `"D"`). **Distinct from** `program_grade_min`. |
| `prereqs` | string[] | course source | `areas` never contains prereqs. |
| `coreqs` | string[] | course source | Same. |
| `role` | enum | derived | `"required"` (the course is named by a rule) or `"elective_option"` (the course is one acceptable choice in a set/range/core category). |
| `alternatives` | string[] | `REQUIRED_COURSE_INFORMATION` or `SMRDORQ_COURSE_NOTES` | Other courses that satisfy the **same** requirement. Empty ⇒ pinned/mandatory. Non-empty ⇒ swappable. `mandatory == (alternatives == [])`, so no separate flag. |
| `program_grade_min` | string \| null | `SMRDORQ_COURSE_NOTES` | Minimum grade **this program** requires for the course to count. `null` when the notes state no grade rule. May be **stricter** than `pass_grade`. |

### `role` values

| Value | When | Signal |
|---|---|---|
| `required` | A rule **names this course**. `alternatives` empty ⇒ pinned; non-empty ⇒ OR-choice (e.g. `ENGR 216 or PHYS 216`). | `REQUIRED_COURSE_INFORMATION` starts with a course code: `"MMET 201 4hrs"`. |
| `elective_option` | The course is one acceptable choice for a slot whose set lives in the notes, a range, or a core category. | Course comes from `SMRDORQ_COURSE_NOTES` "Select from…", a `SUBJ NNN-NNN` range, or the external core dataset. |

### De-dup rule (one entry per course per program)

Since `area`/`rule` are not stored, a course that satisfies more than one requirement in the
same program collapses to a single entry. Resolve collisions by keeping the **strongest role**
— `required` beats `elective_option` — and unioning `alternatives`. (In practice this is rare;
it happens when a course is both a named requirement and a member of a core/elective set.)

---

## Derivation from `areas`

Every field on the object maps back to the raw row (or the course source):

| Object field | From |
|---|---|
| `hours`, `pass_grade`, `prereqs`, `coreqs` | **course source** — not `areas`. |
| *(course key)* `"MMET 201"` | `REQUIRED_COURSE_INFORMATION` (named) or `SMRDORQ_COURSE_NOTES` list (elective). |
| `role` | Whether the course is named by the rule vs. drawn from a list/range/core set. |
| `alternatives` | Named OR-partners in the label (` or `, `/`), or the sibling courses in the notes "Select from…" set. |
| `program_grade_min` | `SMRDORQ_COURSE_NOTES`, regex `grade of '?([A-F])'? or better`. |
| *(program key)* `"BS IDIS"` | `program_summary(reqNo).PROGRAM_DESC`, via the row's `SMBAOGN_REQUEST_NO`. |

`SMBAOGN_AREA` and `SMRDORQ_RULE` are used **during adaptation** (to classify and group rows)
but are **not** stored on the object.

---

## How each requirement kind becomes course entries

| Slot kind | Signal | Becomes |
|---|---|---|
| **fixed** | Label names one course: `MMET 201 4hrs` | 1 entry, `role: required`, `alternatives: []`. |
| **choice** | Label has ` or ` / `/`: `ENGR 216 or PHYS 216`, `CHEM 107/117`, `CSCE 222/ECEN 222` | One entry per named course, `role: required`, `alternatives` = the other option(s). |
| **elective_list** | Notes: `Select from STAT 201, 211, 303` | One entry per listed course, `role: elective_option`, `alternatives` = the rest of the set. |
| **range** | Notes/label: `CSCE 300-499`, "level 300-499" | Expand the band against your course source; one `elective_option` entry per resulting course, `alternatives` = the rest of the band. |
| **core_attribute** | Notes: `[UWRT]`, `[KUCD]`, … | Expand from the external core dataset for the attribute; `elective_option` entries. |
| **core_category** | Named slot, empty notes, `area_desc` = a core category (Creative Arts, Social Science…) | Expand from the external core dataset for the category; `elective_option` entries. |
| **advisor_gated** | Notes: "academic advisor" | **No course list exists** — cannot become course entries. |
| **non_course** | Policy/experience areas (residence, high-impact, foreign language) | No specific course. |

> **Known loss in this flat model:** the slot's required **hours** (e.g. "pick 9 hrs from
> this pool") and the **area bucket** (major vs core vs minor) are not stored on the course
> object. You can still tell a course *can* satisfy an elective (`role: elective_option` +
> `alternatives`), but not *how many* hours the pool needs, nor which bucket it counts toward.
> And `advisor_gated` / `non_course` requirements have no course to key on, so they do **not**
> appear at all. If any of those matter later, they'd need a side channel (they are out of
> scope for this format).

---

## Area taxonomy — used at adaptation time (not stored)

Classification decides which rows produce course entries. **Map on `AREA_DESC` (stable), not
the prefix** — several prefixes are catalog-year variants of the same category (`UC-`/`UKCM-`
= Communication; `UM-`/`UMTH-` = Mathematics; `UL-`/`ULPS-` = Life & Physical Sciences;
`US-`/`UKSC-` = Social & Behavioral Sciences).

### Include (produce course entries)

| `AREA_DESC` | Prefixes seen |
|---|---|
| Major Coursework | `M-` |
| Supporting Coursework / Senior Design | `S-`, `S-…-X` |
| Area / Directed / Additional Electives | `X-` |
| General Electives | `E-` |
| *(minor name)* Minor | `N-` |
| Communication | `UC-`, `UKCM-` |
| Mathematics | `UM-`, `UMTH-` |
| Life and Physical Sciences | `UL-`, `ULPS-` |
| Social and Behavioral Sciences | `US-`, `UKSC-`, `UNIV-KSOC` |
| Language, Philosophy & Culture | `UA-`, `UNIV-KLPC` |
| Creative Arts | `UR-`, `UNIV-KCRA` |
| Citizenship | `UZ-`, `UNIV-CITZ` |
| University Writing Requirement | `UW-` |
| Foreign Language | `UNIV-FORLN` |
| Int'l & Cultural Diversity / Cultural Discourse | `UNIV-KICD` |

### Exclude

| `AREA_DESC` | Prefix | Why |
|---|---|---|
| GPA-Major | `G-` | GPA-calculation pool, **not** a requirement. Its `Select from … NNhrs` note lists the courses whose grades form the major GPA — **never** parse it as an elective. |
| Work Not Applied | `NOT-APPL` | Courses that satisfy nothing. |
| Residence Requirement | `R-` | Policy (hours in residence), no course list. |
| High Impact Experience | `HI-` | Non-course requirement. |

---

## Value reference (observed)

- **Choices are almost always inline in the label** (`X or Y`, `X/Y`); the `AND_OR_CONNECTOR`
  field is `AND` in 478 of 480 rows and `OR` in only 2. Parse `alternatives` from the label
  first; `OR`/`SMRDORQ_SET`/`SUBSET` grouping is a rare secondary signal.
- **`program_grade_min`**: observed `"C"` ("Must make a grade of 'C' or better"). Single
  letter `A`–`F`, semantics "or better"; `null` when absent. Do **not** assume it equals
  `pass_grade`.
- **Core attribute codes** (non-exhaustive): `UWRT` (Univ Writing), `UCRT` (Oral
  Communication), `KUCD` (Cultural Discourse), `SABR`, `QRES` (Quantitative Reasoning). Open set.
- **Range subjects** seen: `CHEN, CSCE, CVEN, ECEN, MEEN, OCEN, PETE, PHYS` — any subject may
  occur; a range means any course in `[low, high]` inclusive.

---

## Parsing rules & edge cases

- **Strip HTML from notes first.** Markup is inconsistent: `<font color = red>…</font>`,
  `<font color=red>`, `<Font>`, `<BR>`. Regex out `<[^>]+>` and collapse whitespace.
- **Choice detection**: split the label on ` or ` and `/`. `CHEM 107/117` (same subject) and
  `CSCE 222/ECEN 222` (cross-listed) are both choices.
- **Subject-carry in lists/ranges**: `Select from STAT 315, 335, 404` → bare numbers inherit
  the last subject; `216-217` after a subject is a same-subject range.
- **Repeated `(area, rule)` rows** are per-student fulfillment repeating — dedupe to one rule.
- **Structured `SMRDORQ_*` fields are always null** (`SUBJ_CODE`, `CRSE_NUMB_LOW/HIGH`,
  `REQ_CREDITS`, `MIN/MAX_VALUE`). The requirement lives only in `REQUIRED_COURSE_INFORMATION`
  + `SMRDORQ_COURSE_NOTES`.
- **Course collisions** across areas in one program → apply the de-dup rule (strongest role
  wins, union `alternatives`).

---

## Completion check (what this model supports)

For a program, a course is satisfied if it is taken at `program_grade_min` or better. A
requirement is met when:

- `role: required`, `alternatives: []` → that exact course is taken.
- `role: required`, `alternatives` non-empty → any one of `{course} ∪ alternatives` is taken.
- `role: elective_option` → any course from `{course} ∪ alternatives` is taken.

Note: because `slot_hours` is not stored, "pick **N** hours from a pool" can only be checked
as "at least one option taken," not the full quantity — a known limitation of the flat shape.
