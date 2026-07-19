"""api_helpers.py

Python helpers for the authenticated **Howdy degree-evaluation API**
(`howdy.tamu.edu/main/api`), transcribed from the OpenAPI spec at
``course_explorer_docs/course_explorer/backend/openapi/openapi.json`` (rendered
as ``openapi-swagger.html``).

Every endpoint here requires an active Howdy session cookie — there is no token
or API key. Store the cookie in the ``HOWDY_COOKIE`` environment variable; it is
sent as the ``Cookie`` header on every request. Without a valid, unexpired
cookie these calls return 401 (redirect to login).

Each function accepts either the individual parameters documented in the spec
**or** a single ``payload`` dict (a query dict for GET, a JSON body for POST),
and returns the decoded JSON response.

Typical flow to get a program's requirements::

    from api_helpers import (
        what_if_programs, degree_eval_program_info, what_if_submit, areas,
    )

    programs = what_if_programs("202611")               # enumerate programs
    info = degree_eval_program_info("202611", "BA=SEAL")  # codes + SOBCURR_RULE
    res = what_if_submit(payload={...})                  # -> request_no (reqNo)
    reqs = areas(res["request_no"])                      # the requirements audit
"""

from __future__ import annotations

import os
from typing import Any, Optional

from dotenv import load_dotenv

import requests

BASE_URL = os.environ.get("HOWDY_BASE_URL", "https://howdy.tamu.edu")
DEFAULT_TIMEOUT = 30  # seconds


# --------------------------------------------------------------------------- #
# Low-level transport
# --------------------------------------------------------------------------- #
def _request(
    method: str,
    path: str,
    *,
    params: Optional[dict] = None,
    json_body: Optional[Any] = None,
    timeout: float = DEFAULT_TIMEOUT,
) -> Any:
    """Send an authenticated request and return the decoded JSON response.

    The Howdy session cookie is read from ``HOWDY_COOKIE`` and sent as the
    ``Cookie`` header. Raises ``RuntimeError`` if it is not set, and
    ``requests.HTTPError`` on 4xx/5xx. Falls back to raw text if the body is
    not JSON.
    """
    load_dotenv()
    cookie = os.environ.get("HOWDY_COOKIE")
    if not cookie:
        raise RuntimeError(
            "HOWDY_COOKIE is not set. These endpoints require an active Howdy "
            "session cookie; set the HOWDY_COOKIE environment variable."
        )

    resp = requests.request(
        method,
        f"{BASE_URL}{path}",
        params=params,
        json=json_body,
        headers={"Cookie": cookie},
        timeout=timeout,
    )
    resp.raise_for_status()
    try:
        return resp.json()
    except ValueError:
        return resp.text


def _pick(payload: Optional[dict], built: dict) -> dict:
    """Use an explicit ``payload`` if given; otherwise the built dict."""
    return payload if payload is not None else built


# --------------------------------------------------------------------------- #
# GET /main/api/degree-evaluation/what-if-programs
# --------------------------------------------------------------------------- #
def what_if_programs(catalog_term: Optional[str] = None, *, payload: Optional[dict] = None) -> Any:
    """List all degree programs for a catalog term (the what-if program catalog).

    Each entry's ``SMRPRLE_PROGRAM`` code feeds ``degree_eval_program_info``.
    """
    return _request(
        "GET",
        "/main/api/degree-evaluation/what-if-programs",
        params=_pick(payload, {"catalogTerm": catalog_term}),
    )


# --------------------------------------------------------------------------- #
# POST /main/api/degree-evaluation/degree-eval-program-info
# --------------------------------------------------------------------------- #
def degree_eval_program_info(
    catalog_term: Optional[str] = None,
    program: Optional[str] = None,
    *,
    payload: Optional[dict] = None,
) -> Any:
    """Get one program's codes (DEGC/COLL/CAMP/LEVL) + ``SOBCURR_RULE``.

    These are the values needed to build a ``what_if_submit`` request. Pass the
    ``program`` code from ``what_if_programs`` VERBATIM (the separator is
    inconsistent — never split/normalize it).
    """
    return _request(
        "POST",
        "/main/api/degree-evaluation/degree-eval-program-info",
        json_body=_pick(payload, {"catalogTerm": catalog_term, "program": program}),
    )


# --------------------------------------------------------------------------- #
# POST /main/api/degree-evaluation/what-if-majors
# --------------------------------------------------------------------------- #
def what_if_majors(
    program: Optional[str] = None,
    rule_ind: Optional[str] = None,
    catalog_term: Optional[str] = None,
    *,
    payload: Optional[dict] = None,
) -> Any:
    """List the program's major(s) with the codes needed for ``what_if_submit``.

    Call with ``program`` (verbatim), ``rule_ind`` = ``SMRPRLE_CURR_RULE_IND``
    from ``degree_eval_program_info``, and ``catalog_term``. Each row carries:
    ``STVMAJR_CODE`` (-> ``majr_code_1_1_in``), ``SORCMJR_DEPT_CODE`` (->
    ``dept_code_1_1_in``), ``CMJR_RULE`` (the ``cmjr``), and ``STVMAJR_CIPC_CODE``
    (the ``cipc``). This is THE source of majr_code / dept_code / cmjr / cipc.

    NOTE: sending ``{rule, catalogTerm}`` instead returns a degenerate all-majors
    list without these fields — always send ``{program, ruleInd, catalogTerm}``.
    """
    return _request(
        "POST",
        "/main/api/degree-evaluation/what-if-majors",
        json_body=_pick(
            payload,
            {"program": program, "ruleInd": rule_ind, "catalogTerm": catalog_term},
        ),
    )


# --------------------------------------------------------------------------- #
# POST /main/api/degree-evaluation/what-if-major-and-dept-codes
# --------------------------------------------------------------------------- #
def what_if_major_and_dept_codes(
    cipc: Optional[str] = None,
    rule: Optional[int] = None,
    catalog_term: Optional[str] = None,
    cmjr: Optional[int] = None,
    *,
    payload: Optional[dict] = None,
) -> Any:
    """Resolve one major's ``MAJR_CODE`` + ``DEPT_CODE`` from cipc + cmjr.

    REDUNDANT for building a submit: ``what_if_majors`` already returns
    ``STVMAJR_CODE`` and ``SORCMJR_DEPT_CODE`` directly. ``cmjr`` is required
    (``cipc`` alone is ambiguous — one CIP maps to several majors)."""
    return _request(
        "POST",
        "/main/api/degree-evaluation/what-if-major-and-dept-codes",
        json_body=_pick(
            payload,
            {"cipc": cipc, "rule": rule, "catalogTerm": catalog_term, "cmjr": cmjr},
        ),
    )


# --------------------------------------------------------------------------- #
# GET /main/api/degree-evaluation/what-if-eval-terms
# --------------------------------------------------------------------------- #
def what_if_eval_terms() -> Any:
    """List selectable evaluation/entry terms (source of ``eval_term_in``).

    Each row is a Banner STVTERM record; ``STVTERM_CODE`` is the term code."""
    return _request("GET", "/main/api/degree-evaluation/what-if-eval-terms")


# --------------------------------------------------------------------------- #
# POST /main/api/degree-evaluation/what-if-submit
# --------------------------------------------------------------------------- #
def what_if_submit(
    *,
    payload: Optional[dict] = None,
    term_in: Optional[str] = None,
    catlg_term_in: Optional[str] = None,
    program_in: Optional[str] = None,
    eval_term_in: Optional[str] = None,
    levl_in: Optional[str] = None,
    degc_in: Optional[str] = None,
    coll_in: Optional[str] = None,
    camp_in: Optional[str] = None,
    sobcurr_rule_in: Optional[int] = None,
    majr_code_1_1_in: Optional[str] = None,
    dept_code_1_1_in: Optional[str] = None,
    dflt_ip_in: Optional[str] = None,
) -> Any:
    """Submit a what-if evaluation. Returns a handle with ``request_no`` (reqNo).

    Provide the fields individually or as a ``payload`` dict. Field names match
    the API (``*_in``); most are sourced from ``degree_eval_program_info``.
    """
    built = {
        "term_in": term_in,
        "catlg_term_in": catlg_term_in,
        "program_in": program_in,
        "eval_term_in": eval_term_in,
        "levl_in": levl_in,
        "degc_in": degc_in,
        "coll_in": coll_in,
        "camp_in": camp_in,
        "sobcurr_rule_in": sobcurr_rule_in,
        "majr_code_1_1_in": majr_code_1_1_in,
        "dept_code_1_1_in": dept_code_1_1_in,
        "dflt_ip_in": dflt_ip_in,
    }
    return _request(
        "POST",
        "/main/api/degree-evaluation/what-if-submit",
        json_body=_pick(payload, {k: v for k, v in built.items() if v is not None}),
    )


# --------------------------------------------------------------------------- #
# POST /main/api/degree-evaluation/what-if-minors
# --------------------------------------------------------------------------- #
def what_if_minors(
    rule: Optional[int] = None,
    catalog_term: Optional[str] = None,
    *,
    payload: Optional[dict] = None,
) -> Any:
    """Get all available minors for a catalog term. ``rule`` is the curriculum
    rule number (from ``degree_eval_program_info`` / ``SOBCURR_RULE``)."""
    return _request(
        "POST",
        "/main/api/degree-evaluation/what-if-minors",
        json_body=_pick(payload, {"rule": rule, "catalogTerm": catalog_term}),
    )


# --------------------------------------------------------------------------- #
# POST /main/api/degree-evaluation/program-description
# --------------------------------------------------------------------------- #
def program_description(
    program: Optional[str] = None,
    entry_term: Optional[str] = None,
    req_no: Optional[int] = None,
    *,
    payload: Optional[dict] = None,
) -> Any:
    """Get the description text for a single program. ``req_no`` may be ``None``."""
    return _request(
        "POST",
        "/main/api/degree-evaluation/program-description",
        json_body=_pick(payload, {"reqNo": req_no, "program": program, "entryTerm": entry_term}),
    )


# --------------------------------------------------------------------------- #
# POST /main/api/degree/update-minors  (STATE-CHANGING)
# --------------------------------------------------------------------------- #
def update_minors(
    prog1_minor1: Optional[str] = None,
    prog1_minor2: Optional[str] = None,
    prog2_minor1: Optional[str] = None,
    prog2_minor2: Optional[str] = None,
    *,
    payload: Optional[dict] = None,
) -> Any:
    """Attach minors to the current plan (up to two per program slot).

    STATE-CHANGING: mutates server-side plan state for the session; typically a
    prerequisite step before fetching an evaluation that should reflect the
    chosen minors. All four slots are always sent (``None`` -> JSON null).
    """
    return _request(
        "POST",
        "/main/api/degree/update-minors",
        json_body=_pick(
            payload,
            {
                "prog1Minor1": prog1_minor1,
                "prog1Minor2": prog1_minor2,
                "prog2Minor1": prog2_minor1,
                "prog2Minor2": prog2_minor2,
            },
        ),
    )


# --------------------------------------------------------------------------- #
# GET /main/api/degree-evaluation/program
# --------------------------------------------------------------------------- #
def program_summary(req_no: Optional[int] = None, *, payload: Optional[dict] = None) -> Any:
    """Degree-evaluation summary/header for a request (totals, GPA, credits)."""
    return _request(
        "GET",
        "/main/api/degree-evaluation/program",
        params=_pick(payload, {"reqNo": req_no}),
    )


# --------------------------------------------------------------------------- #
# GET /main/api/degree-evaluation/areas
# --------------------------------------------------------------------------- #
def areas(req_no: Optional[int] = None, *, payload: Optional[dict] = None) -> Any:
    """THE degree requirements audit (areas x rules x applied courses)."""
    return _request(
        "GET",
        "/main/api/degree-evaluation/areas",
        params=_pick(payload, {"reqNo": req_no}),
    )


# --------------------------------------------------------------------------- #
# GET /main/api/degree-evaluation/additional-info
# --------------------------------------------------------------------------- #
def additional_info(req_no: Optional[int] = None, *, payload: Optional[dict] = None) -> Any:
    """Supplementary evaluation rows (in-progress, non-course rules, ranges)."""
    return _request(
        "GET",
        "/main/api/degree-evaluation/additional-info",
        params=_pick(payload, {"reqNo": req_no}),
    )


# --------------------------------------------------------------------------- #
# GET /main/api/degree-evaluation/prev-evals
# --------------------------------------------------------------------------- #
def prev_evals() -> Any:
    """List the caller's previous degree evaluations (discover valid reqNos)."""
    return _request("GET", "/main/api/degree-evaluation/prev-evals")


# --------------------------------------------------------------------------- #
# GET /main/api/curriculum/minors
# --------------------------------------------------------------------------- #
def curriculum_minors() -> Any:
    """Full minor catalog (``allMinors``) + the current plan's minor selection."""
    return _request("GET", "/main/api/curriculum/minors")
