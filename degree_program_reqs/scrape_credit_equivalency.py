"""
Scrapes the TAMU credit-by-examination equivalency tables into credit_equivalency.json.

Source: https://testing.tamu.edu/credits/index.html — four inline HTML tables (AP, IB,
SAT II, DANTES). Each table is [Exam, Required Score, Texas A&M Course(s), Credit Hours].
An exam with several score tiers uses a rowspan on its name cell: the first tier row has
four cells (name + score + courses + hours) and each following tier row has three
(score + courses + hours).

Course cells read like "BIOL 111 and 112", "PHYS 207 or PHYS 227", "SPAN 101, 102, and
201", or a non-course note ("See academic Advisor"). We expand these into explicit course
codes (carrying the department prefix forward onto bare numbers) and record whether the
listed courses are all awarded together ("and") or are a choice ("or").
"""

import os
import re
import json
import requests
import bs4
from anyascii import anyascii

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CREDIT_EQUIVALENCY_PATH = os.path.join(SCRIPT_DIR, "credit_equivalency.json")

SOURCE_URL = "https://testing.tamu.edu/credits/index.html"

# Table caption keyword -> method id + display name. Captions look like
# "A course equivalency list for the AP Examination, listing ...".
METHODS = [
    {"id": "ap", "name": "AP Examination", "caption": "AP Examination"},
    {"id": "ib", "name": "International Baccalaureate (IB)", "caption": "IB Examination"},
    {"id": "sat_ii", "name": "SAT II Subject Tests", "caption": "SAT II Subject Test"},
    {"id": "dantes", "name": "DANTES Subject Standardized Tests", "caption": "DANTES"},
]

# The catalog is inconsistent about the space ("BIOL 113" and "FREN101" both occur).
COURSE_TOKEN = re.compile(r"^([A-Z]{2,4})\s*(\d{3}[A-Z]?)$")
BARE_NUMBER = re.compile(r"^(\d{3}[A-Z]?)$")


def clean_text(text):
    if text is None:
        return ""
    return anyascii(text.replace("\xa0", " ")).strip()


def _leading_int(text):
    """First integer in a string, or None. Used for score/hours, which may carry footnote
    markers ("4*") or prose ("up to 3 hours")."""
    match = re.search(r"\d+", text or "")
    return int(match.group()) if match else None


def parse_courses(text):
    """Expand a Texas A&M Course(s) cell into explicit course codes.

    Returns {courses, relation, advisor, note}:
      - "BIOL 111 and 112"      -> ["BIOL 111", "BIOL 112"], relation "and"
      - "PHYS 207 or PHYS 227"  -> ["PHYS 207", "PHYS 227"], relation "or"  (a choice)
      - "AFST 289"              -> ["AFST 289"],              relation "single"
      - "See academic Advisor1" -> [], advisor True (credit is advisor-granted, no fixed course)
    """
    text = clean_text(text)
    if "advisor" in text.lower():
        return {"courses": [], "relation": "advisor", "advisor": True, "note": text}

    relation = "or" if re.search(r"\bor\b", text) else "and"

    courses = []
    current_dept = None
    for part in re.split(r"\s*,\s*|\s+and\s+|\s+or\s+", text):
        part = clean_text(part)
        if not part:
            continue
        m = COURSE_TOKEN.match(part)
        if m:
            current_dept = m.group(1)
            courses.append(f"{current_dept} {m.group(2)}")
            continue
        bare = BARE_NUMBER.match(part)
        if bare and current_dept:
            courses.append(f"{current_dept} {bare.group(1)}")
        # Anything else (stray footnote digits, leftover words) is ignored.

    if len(courses) <= 1:
        relation = "single"
    return {"courses": courses, "relation": relation, "advisor": False, "note": None}


def parse_table(table):
    """Parse one equivalency table into a list of {exam, tiers}."""
    exams = []
    current = None

    for tr in table.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        texts = [clean_text(c.get_text(" ", strip=True)) for c in cells]
        if not texts:
            continue
        # Skip the header row.
        if any(h in texts[0] for h in ("Examination", "Subject Test", "DANTES Test")) and "Score" in " ".join(texts):
            continue

        if len(cells) >= 4:
            # Exam names carry no footnote markers (those live on the score/course cells),
            # and a trailing digit is part of the name — "Physics 1" vs "Physics 2".
            current = {"exam": texts[0], "tiers": []}
            exams.append(current)
            tier = texts[1:4]
        elif len(cells) == 3 and current is not None:
            tier = texts[0:3]
        else:
            continue

        score_raw, courses_raw, hours_raw = tier
        current["tiers"].append({
            "score": _leading_int(score_raw),
            "score_raw": score_raw,
            "hours": _leading_int(hours_raw),
            "hours_raw": hours_raw,
            **parse_courses(courses_raw),
        })

    return exams


def scrape_credit_equivalency(url=SOURCE_URL, save_path=CREDIT_EQUIVALENCY_PATH):
    # The site 404s unknown user agents, so present a browser one.
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml",
    }
    response = requests.get(url, timeout=30, headers=headers)
    response.raise_for_status()
    soup = bs4.BeautifulSoup(response.content, "html.parser")

    tables = soup.find_all("table")
    equivalency = {}
    methods_out = []

    for method in METHODS:
        table = next(
            (t for t in tables if t.caption and method["caption"] in clean_text(t.caption.get_text())),
            None,
        )
        if table is None:
            print(f"[warn] no table found for {method['name']}")
            equivalency[method["id"]] = []
            continue
        exams = parse_table(table)
        equivalency[method["id"]] = exams
        methods_out.append({"id": method["id"], "name": method["name"]})
        print(f"[ok] {method['name']}: {len(exams)} exam(s)")

    result = {"methods": methods_out, "equivalency": equivalency}
    with open(save_path, "w") as f:
        json.dump(result, f, indent=4)
    return result


if __name__ == "__main__":
    scrape_credit_equivalency()
