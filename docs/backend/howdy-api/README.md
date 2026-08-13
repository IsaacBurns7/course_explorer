# Howdy Portal API

Reference documentation for the undocumented JSON APIs behind Texas A&M's Howdy
portal (`howdyportal.tamu.edu`). These are the endpoints the public course search
UI calls under the hood. We use them to ingest section, attribute, and prerequisite
data for the degree planner.

> **Status:** Reverse-engineered from network traffic and existing scraper code
> (`backend/services/populateClasses.js`, `RUNME.js`). Not an official, supported
> API — fields and behavior can change without notice. Treat everything here as
> observed behavior, not a contract.

## Base URL

```
https://howdyportal.tamu.edu/api
```

All known endpoints are **POST** with a JSON body and return JSON. No
authentication has been required for the `publicSearch: "Y"` paths so far.

### Common request headers

```http
accept: application/json, text/plain, */*
accept-language: en-US,en;q=0.9
content-type: application/json; charset=UTF-8
```

## Term codes

Most endpoints key off a 6-digit **term code** of the form `YYYYSC`:

| Part | Meaning | Values |
| --- | --- | --- |
| `YYYY` | Calendar year | e.g. `2026` |
| `S` | Semester | `1` = Spring, `2` = Summer, `3` = Fall |
| `C` | Campus / site | `1` = College Station, `2` = Galveston, `3` = Qatar |

Examples:
- `202611` → `2026` + `1` (Spring) + `1` (College Station) = **Spring 2026, College Station**
- `202532` → `2025` + `3` (Fall) + `2` (Galveston) = **Fall 2025, Galveston**

## Endpoints

| Endpoint | Method | Purpose | Doc |
| --- | --- | --- | --- |
| `/course-sections` | POST | List all sections for a term (subject, course, section, CRN, attributes, meeting info) | [course-sections.md](course-sections.md) |
| `/section-prereqs` | POST | Prerequisite text for a single section (by term + CRN) | [section-prereqs.md](section-prereqs.md) |

_More endpoints to be added as they are documented._

## How to document a new endpoint

Copy an existing endpoint file and fill in each section. When you capture a call
from the browser (DevTools → Network → right-click request → **Copy as fetch** /
**Copy as cURL**), paste it in and we can fill in the rest. Each endpoint doc
should cover:

1. **Summary** — one line on what it returns and why we care.
2. **Request** — method, URL, headers, and the JSON body with every field explained.
3. **Response** — shape, key fields, and a trimmed real example.
4. **Notes & gotchas** — pagination, empty-result behavior, quirks, rate limits.
5. **Where we use it** — the file(s)/functions in this repo that call it.
