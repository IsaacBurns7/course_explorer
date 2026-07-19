# Degree Program Requirements — Scraping Notes

_Working notes for reverse-engineering Texas A&M's Howdy degree-evaluation APIs to
build a degree planner. Snapshot of the plan + open questions as of this session._

## Goal

Programmatically pull the **requirements for every bachelor's program (and minor)** so
our website can check whether a user's submitted plan satisfies their selections.
There is no official API — we reuse an authenticated Howdy **session cookie**
(`credentials: include`; no token). Formal endpoint docs live in the other repo at
`course_explorer_docs/course_explorer/backend/openapi/openapi.json` (tag
`howdy.tamu.edu/main/api (requires auth)`), rendered via `openapi-swagger.html`.

## Endpoint inventory (all documented in openapi.json)

Public (no auth), `howdyportal.tamu.edu/api`:
- `POST /api/course-sections` — all sections for a term (subject, course, section, CRN, attributes)
- `POST /api/section-prereqs` — prereq text for one section (term + CRN)

Authenticated (session cookie), `howdy.tamu.edu/main/api`:
- `GET  degree-evaluation/what-if-programs?catalogTerm=` — **catalog of all programs** (majors/certs/grad/PhD)
- `POST degree-evaluation/degree-eval-program-info` — one program's `DEGC/COLL/CAMP/LEVL` + `SOBCURR_RULE`
- `POST degree-evaluation/what-if-submit` — submit a what-if eval → returns `reqNo`
- `POST degree/update-minors` — attach minors to the plan (state-changing)
- `GET  degree-evaluation/areas?reqNo=` — **THE requirements audit** (areas × rules × applied courses)
- `GET  degree-evaluation/program?reqNo=` — eval summary (totals, GPA, credits)
- `GET  degree-evaluation/additional-info?reqNo=` — supplementary rows (in-progress, non-course rules)
- `GET  degree-evaluation/prev-evals` — list prior evals (discover reqNos)
- `GET  curriculum/minors` — all minors `{CODE, DESC}` + current selection
- `GET  degree-evaluation/program-description` — program description text

Considered and **rejected** (don't advance the goal): `generate-new-eval` (own declared
program only), `original-code` (trivial metadata), `ugdp-approval-status` (advisor
approval workflow + PII).

## The pipeline

```
what-if-programs(catalogTerm)                      # enumerate programs
  → filter DESC to bachelor's (BA/BS/BBA/BFA/BLA/BSN); drop cert/masters/PhD/NDS/BAC-lowers
  → [per program]
       degree-eval-program-info(programCode)       # get params (pass code VERBATIM)
       what-if-submit({...params...})              # → reqNo
       (optional) update-minors(...)               # attach up to 2 minors to fold in minor areas
       wait until areas is complete                # eval is async
       areas?reqNo                                 # requirements audit
       (+ program?reqNo, additional-info?reqNo)
  → parse rules → structured requirements → DB
```

Minors: `what-if-programs` is majors-only. Minor requirements only appear in `areas`
when attached via `update-minors`. Two minors can ride on one major eval → 3 programs
per call. Since minor areas (`N-<minor>`) are independent of the major, pin one cheap
major and rotate all minors through in pairs.

`reqNo` (aka `request_no` / `requestNumber`) is the join key across the eval endpoints.

## `areas` response — structure

Flat array, one row per (area × rule × applied course). Rebuild the tree by grouping on
`SMBAOGN_AREA` (+ `AREA_DESC`) then `SMRDORQ_RULE`. Three layers per row:
- **Area** (program-level, reusable): `AREA_DESC`, `AREA_MET_IND`, req/act credits, area GPA
- **Rule** (program-level, reusable): `SMRDORQ_RULE`, `AND_OR_CONNECTOR`, `SMRDORQ_SET/SUBSET`,
  `REQUIRED_COURSE_INFORMATION` (label + hours), `SMRDORQ_COURSE_NOTES`, `GENERIC_AREA_COMMENT`
- **Fulfillment** (per-student overlay — DROP for a clean template): `SMRDOUS_*` (applied course,
  grade, `CRSE_SOURCE` H/R/P/O = history/registered/plan/other), met/not-met flags

## Electives — parsing status

Allowed-course sets live in `SMRDORQ_COURSE_NOTES` (HTML text) / `GENERIC_AREA_COMMENT`.
Three flavors:

| Flavor | Example | Status |
|---|---|---|
| Explicit list | `Select from CSCE 441; VIST 386.` | ✅ Solved — parse tokens |
| Attribute-based | `courses with the ... attribute [UWRT]` / `[KUCD]` | ✅ Handled as **core curriculum** — these bracket codes flag courses required regardless of major; the allowed set comes from a separate core-curriculum dataset (see Decisions), not a `course-sections` join. Non-core attributes are ignored. |
| Advisor-gated | `See academic advisor for a list of approved courses.` | ❌ No list in Howdy — catalog fallback |

Draft notes-parser (refine as more programs arrive):
```python
import re
def parse_notes(raw):
    text = re.sub(r'<[^>]+>', ' ', raw)            # strip HTML (any case: <font>, <Font>, <BR>)
    text = re.sub(r'\s+', ' ', text).strip()
    out = {"grade_min": None, "attributes": [], "courses": [], "advisor_gated": False}
    if re.search(r'academic advisor', text, re.I): out["advisor_gated"] = True
    g = re.search(r"grade of '([A-F])' or better", text);  out["grade_min"] = g and g.group(1)
    out["attributes"] = re.findall(r'\[([A-Z]{3,5})\]', text)
    m = re.search(r'Select from (.+)', text)
    if m:
        subj = None
        for tok in re.split(r'[;,]', m.group(1)):
            tok = tok.strip().rstrip('.')
            cm = re.match(r'([A-Z]{2,4}(?:/[A-Z]{2,4})*)\s*(\d{3})', tok)  # SUBJ 123 / ENGR/PHYS 217
            if cm: subj = cm.group(1); out["courses"].append((subj, cm.group(2)))
            elif re.fullmatch(r'\d{3}', tok) and subj: out["courses"].append((subj, tok))  # subject-carry
    return out
```
Parser messiness seen (from CPSC only): `<font color = red>` vs `<font color=red>` vs `<Font ...>`;
`<BR>`; subject-carry (`BIOL 101, 107, 111, 112`); cross-lists (`ENGR/PHYS 217`); parentheticals
(`(1 credit)`); stacked grade-rule + `<BR>` + `Select from`.

## Decisions & open questions (as of this session)

**Decided:**
- **Core curriculum** (Q1 + Q2): the bracket attribute codes (`[UWRT]`, `[KUCD]`, etc.) mark
  courses required regardless of major = core curriculum. We do NOT join them to `course-sections`;
  the allowed course lists for core (both the `[..]`-attribute rules AND the empty-notes core
  categories: Social Science, Creative Arts, Amer History, Lang-Phil-Culture) come from a **separate
  core-curriculum dataset** we source by another method. Non-core attributes are ignored. Removes
  the two biggest gaps.
- **Term** (Q6): a single constant `catalogTerm` for the whole term/sweep.
- **Approach** (Q3): **scrape all programs first, then decide** any further changes from the results —
  don't over-engineer the parser up front.

**Still open:**
- **More data points** — collecting a few more varied programs to compare before the full scrape
  (parser is still only exercised on CPSC).
- **"Complete `areas`" signal** — eval is async; pin the exact done-condition (`SF_STATUS == 1`?
  non-empty `areas`? specific field) so scrapes don't grab half-built audits.
- **Minor extraction** — assumed, only seen inside the CPSC eval; not yet tested standalone.
- **Duo trust duration** — cookie-refresh plan assumes "remember this device" works and lasts.

## Scraper design decisions (this session)

- **Sequential only** — `what-if-submit` mutates session state; one cookie can't parallelize.
- **Wait for correctly-formatted `areas`** before advancing (async eval) — see open Q #4.
- **Cache raw `areas` JSON to disk** keyed by `program+catalogTerm`; re-parse offline.
- **Filter to bachelor's** before submitting (don't waste calls on grad/cert/PhD).
- **Pass program codes VERBATIM** — separator is inconsistent (`=` vs `-`, even within a degree);
  never split/normalize. `degree-eval-program-info` decomposes it for you.
- **Strip `SMRDOUS_*`** and met/not-met — that's the personal transcript overlay, not the template.

### Cookie refresh (Howdy = Microsoft SSO + Duo 2FA)

Pure headless user/pass login is blocked by Duo. Plan: **Puppeteer with a persistent
`userDataDir`** (backend already has `puppeteer-extra` + stealth). Log in once headful,
complete Duo with "remember this device." Afterward the profile re-auths with just
`.env` creds (no Duo) until Duo trust expires (~weeks). `refreshCookie()`: launch
persistent profile → hit a Howdy page → if login form, fill `HOWDY_USER/HOWDY_PASS`,
submit, harvest `page.cookies()` → format `Cookie` header. Call on any `401`. Add a
keepalive (periodic `prev-evals` hit) to reduce refreshes. Keep `.env` and cookies
gitignored (personal NetID creds).

## Data typing gotchas

- Numbers arrive as **space-padded strings**: `"            126.000"`, `"   7"` — trim + coerce.
- Booleans as `"Yes"/"No"` and `"Met"/"Not Met"`.
- `program`/`areas` return clean arrays; `original-code`/`ugdp-approval-status` return the raw
  node-oracledb `{metaData, rows}` envelope — tolerate both if you touch the latter.
- Do NOT persist personal data (PIDM, grades, transfer records) into docs/examples.

## Files

- Endpoint docs: `../../course_explorer_docs/course_explorer/backend/openapi/openapi.json` (+ swagger HTML)
- Scraper scripts (this folder): `load_all_programs_to_json.py` (what-if-programs),
  `test.py` (degree-eval-program-info), `create_degree_eval_req.py` (what-if-submit),
  `load_all_minors.py` (what-if-minors), `load_program_degree_requirments.py` (stub)
- Cross-session memory index: `~/.claude/projects/.../memory/MEMORY.md`
