# POST /api/section-prereqs

## Summary

Returns the prerequisite description for a **single section**, identified by term
and CRN. Used to attach a human-readable prerequisite string to a course.

## Request

```
POST https://howdyportal.tamu.edu/api/section-prereqs
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
  "term": "202611",
  "crn": "12345"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `term` | string | 6-digit `YYYYSC` term code. See [term codes](README.md#term-codes). |
| `crn` | string/number | Course Reference Number of the specific section (obtained from `/course-sections`). |

## Response

```json
{
  "P_PRE_REQS_OUT": "Prerequisite text as displayed in Howdy..."
}
```

| Field | Meaning |
| --- | --- |
| `P_PRE_REQS_OUT` | Free-text prerequisite description. May be absent when the section has no prerequisites. |

> Capture and document any other fields returned alongside `P_PRE_REQS_OUT`.

## Notes & gotchas

- The prereq string is unstructured free text (not a parsed requirement tree).
  Parsing it into an actual prerequisite graph is a separate step.
- We query prereqs using the **latest** semester a course was offered, picking the
  first section that has a CRN.
- When `P_PRE_REQS_OUT` is missing, the code logs "No prereq found" and moves on.

## Where we use it

- `backend/services/populateClasses.js` → `getPrereq()`
