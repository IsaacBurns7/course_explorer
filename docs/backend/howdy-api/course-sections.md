# POST /api/course-sections

## Summary

Returns the full list of course **sections** offered in a given term (campus).
This is the primary discovery endpoint: from it we get subject, course number,
section number, CRN, section attributes, and meeting/instructor info, which we
then key into the rest of the pipeline.

## Request

```
POST https://howdyportal.tamu.edu/api/course-sections
```

### Headers

```http
accept: application/json, text/plain, */*
accept-language: en-US,en;q=0.9
content-type: application/json; charset=UTF-8
```

### Body

```json
{
  "startRow": 0,
  "endRow": 0,
  "termCode": "202611",
  "publicSearch": "Y"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `startRow` | number | Pagination offset (row index to start at). `0` = first row. |
| `endRow` | number | Pagination limit (row index to stop at). `0` appears to return the full set — confirm behavior for large terms. |
| `termCode` | string | 6-digit `YYYYSC` term code. See [term codes](README.md#term-codes). |
| `publicSearch` | string | `"Y"` for the public (unauthenticated) search path. |

## Response

Returns a JSON array of section objects. Each object uses the
`SWV_CLASS_SEARCH_*` prefix. Known/used fields:

| Field | Meaning |
| --- | --- |
| `SWV_CLASS_SEARCH_SUBJECT` | Subject / department code (e.g. `CSCE`) |
| `SWV_CLASS_SEARCH_COURSE` | Course number (e.g. `120`) |
| `SWV_CLASS_SEARCH_SECTION` | Section number |
| `SWV_CLASS_SEARCH_ATTRIBUTES` | Pipe-delimited attribute string (e.g. `"Core| Univ Writing Req"`) |

> The response contains many more `SWV_CLASS_SEARCH_*` fields (CRN, title,
> instructor, meeting times, seats, etc.). Capture a full sample response and
> expand this table.

### Example (trimmed)

```json
[
  {
    "SWV_CLASS_SEARCH_SUBJECT": "CSCE",
    "SWV_CLASS_SEARCH_COURSE": "120",
    "SWV_CLASS_SEARCH_SECTION": "500",
    "SWV_CLASS_SEARCH_ATTRIBUTES": "Core| Univ Writing Req"
  }
]
```

## Notes & gotchas

- Some code paths read the array directly (`for (const entry of json)`), while
  the attribute-patching path reads `data.response?.data`. Confirm which response
  envelope this endpoint actually returns for a given call — it may differ by
  parameters. **TODO: verify the exact top-level shape.**
- `SWV_CLASS_SEARCH_ATTRIBUTES` is a single string; split on `"| "` to get an
  array. We filter to attributes containing `Core` or `Univ`.
- For past semesters the app falls back to archived grade-report PDFs instead of
  this API (see `parsePDF`).

## Where we use it

- `backend/services/populateClasses.js` → `gatherData()` (seeds courses/sections)
- `backend/services/RUNME.js` → `getAttributesForSemester()` (attribute patching)
