"""
Generates a program_requirements.json file containing all the degree programs and their requirements. Scrapes information from the CourseLeaf tables from the inputted links.
"""

import __main__
import os
import time
import requests
import re
import bs4
import json
from anyascii import anyascii

# Resolve data files relative to this script so it runs from any working directory.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

COLLEGE_LINKS_PATH = os.path.join(SCRIPT_DIR, "college_links.json")
PROGRAM_LINKS_PATH = os.path.join(SCRIPT_DIR, "program_links.json")

BASE_URL = "https://catalog.tamu.edu"

def clean_text(text):
    """Normalize scraped text: strip non-breaking spaces and transliterate to ASCII."""
    if text is None:
        return ""
    return anyascii(text.replace("\xa0", " ")).strip()

def get_program_links(college_links, MAJOR_DIV_ID="majorstextcontainer", MINOR_DIV_ID="minorstextcontainer", save_path="program_links.json"):    
    """
    Scrapes the CourseLeaf tables from the inputted links and generates a list of links to the degree programs.

    Args:
        college_links (list): A list of links to the CourseLeaf tables.
        MAJOR_DIV_ID (str): The id of the div containing the major links.
        MINOR_DIV_ID (str): The id of the div containing the minor links.
        save_path (str): The path to save the generated JSON file.
    """

    # Each college page lists every program twice (the catalog renders the list once per
    # layout), so dedupe on (desc_name, link) — otherwise the scrape does 2x the HTTP
    # requests for identical pages. Verified no link is tagged both major and minor.
    program_links = []
    seen = set()

    for link in college_links:
        response = requests.get(link)
        soup = bs4.BeautifulSoup(response.content, 'html.parser')
        
        # Which div a link came from is the authoritative major-vs-minor signal — the
        # name alone is unreliable. `kind` is carried through to the requirements JSON.
        for div_id, kind in ((MAJOR_DIV_ID, "major"), (MINOR_DIV_ID, "minor")):
            div = soup.find('div', id=div_id)
            if not div:
                continue
            for a in div.find_all('a', href=True):
                entry = {
                    "desc_name": clean_text(a.text.strip()),
                    "link": a['href'],
                    "kind": kind,
                }
                key = (entry["desc_name"], entry["link"])
                if key in seen:
                    continue
                seen.add(key)
                program_links.append(entry)

    with open(save_path, 'w') as f:
        json.dump(program_links, f, indent=4)

COURSE_LEAF_TABLE_ID = "programrequirementstextcontainer"
PROGRAM_REQUIRMENTS_PATH = os.path.join(SCRIPT_DIR, "program_requirements_raw.json")

# One session for the whole run: connection reuse cuts down the RemoteDisconnected errors
# the catalog server returns when hammered with hundreds of fresh connections.
_SESSION = requests.Session()
_SESSION.headers.update({"User-Agent": "course-explorer degree-requirements scraper"})


def fetch(url, retries=3, backoff=1.5, session=_SESSION):
    """GET with retries. The catalog intermittently drops connections mid-run, which is
    transient — retrying recovers it. Raises the last error if every attempt fails."""
    last_error = None
    for attempt in range(retries):
        try:
            response = session.get(url, timeout=30)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            last_error = e
            if attempt < retries - 1:
                time.sleep(backoff * (2 ** attempt))
    raise last_error

def scrape_tables_raw(program_links=PROGRAM_LINKS_PATH, COURSE_LEAF_TABLE_ID="programrequirementstextcontainer", save_path=PROGRAM_REQUIRMENTS_PATH, limit=None):
    """
    Scrapes the CourseLeaf tables from the inputted links and generates a JSON file containing all the degree programs and their requirements.

    Args:
        program_links (list): A list of links to the degree programs.
        COURSE_LEAF_TABLE_ID (str): The id of the div containing the course requirements.
        save_path (str): The path to save the generated JSON file.
        limit (int|None): Scrape only the first N programs (for quick dev runs). None = all.
    """

    with open(program_links, 'r') as f:
        program_links = json.load(f)

    if limit is not None:
        program_links = program_links[:limit]

    programs = []
    for entry in program_links:
        program = scrape_program(entry, COURSE_LEAF_TABLE_ID=COURSE_LEAF_TABLE_ID)
        programs.append(program)

    with open(save_path, 'w') as f:
        json.dump(programs, f, indent=4)

    return programs


def scrape_program(entry, COURSE_LEAF_TABLE_ID=COURSE_LEAF_TABLE_ID):
    """Scrape one program page into its raw record.

    Always returns a record: on a network failure it carries an `error` key, and on a page
    with no requirements container it stays `found: False`. Shared by the full run and the
    repair pass so both parse identically.
    """
    link = entry["link"]
    url = link if link.startswith("http") else BASE_URL + link

    program = {
        "desc_name": entry.get("desc_name"),
        "kind": entry.get("kind"),
        "link": link,
        "url": url,
        "found": False,
        "intro": [],
        "footnotes": {},
        "tables": [],
    }

    try:
        response = fetch(url)
    except requests.RequestException as e:
        program["error"] = str(e)
        print(f"[error] {entry.get('desc_name')}: {e}")
        return program

    soup = bs4.BeautifulSoup(response.content, 'html.parser')
    container = soup.find(id=COURSE_LEAF_TABLE_ID)

    if container is None:
        # Not a degree page (e.g. department/college landing page) — no table.
        print(f"[skip] no requirements container: {entry.get('desc_name')}")
        return program

    program["found"] = True

    # Intro paragraphs (may describe a shared freshman year, etc.).
    for p in container.find_all('p', recursive=False):
        text = clean_text(p.get_text(" ", strip=True))
        if text:
            program["intro"].append(text)

    # Footnotes: <dl class="sc_footnotes"> of <dt><sup>n</sup></dt><dd>text</dd> pairs.
    # A page may split these across MULTIPLE dl blocks (e.g. 1-5 in one, 6-9 in
    # another), so iterate every block, not just the first.
    for footnotes_dl in container.find_all(class_="sc_footnotes"):
        for dt in footnotes_dl.find_all("dt"):
            number = clean_text(dt.get_text(" ", strip=True))
            dd = dt.find_next_sibling("dd")
            text = clean_text(dd.get_text(" ", strip=True)) if dd else ""
            if number:
                program["footnotes"][number] = text

    # Requirement tables: plan grids and supplementary course lists.
    for table in container.find_all("table", class_=["sc_plangrid", "sc_courselist"]):
        classes = table.get("class", [])
        table_type = "sc_plangrid" if "sc_plangrid" in classes else "sc_courselist"
        table_data = {"type": table_type, "rows": []}

        for tr in table.find_all("tr"):
            row = {
                "classes": tr.get("class", []),
                "cells": [],
            }
            for cell in tr.find_all(["td", "th"]):
                # Footnote reference numbers live in <sup> tags within the cell. The
                # separator is usually a comma but a few pages use a period ("1.2" means
                # footnotes 1 and 2), so split on both.
                footnote_refs = []
                for sup in cell.find_all("sup"):
                    for part in re.split(r"[,.\s]+", clean_text(sup.get_text())):
                        if part:
                            footnote_refs.append(part)

                # Specific courses are <a class="bubblelink code"> hyperlinks.
                courses = []
                for a in cell.find_all("a", class_="code"):
                    courses.append({
                        "code": clean_text(a.get_text()),
                        "href": a.get("href"),
                    })

                row["cells"].append({
                    "classes": cell.get("class", []),
                    "text": clean_text(cell.get_text(" ", strip=True)),
                    "courses": courses,
                    "footnote_refs": footnote_refs,
                })

            table_data["rows"].append(row)

        program["tables"].append(table_data)

    print(f"[ok] {entry.get('desc_name')}: {len(program['tables'])} table(s)")
    return program


def repair_failed_programs(raw_path=PROGRAM_REQUIRMENTS_PATH, save_path=None):
    """Re-scrape only the programs whose last run errored, and merge them back in.

    The catalog drops connections sporadically during a long run, so a full scrape can
    finish with a handful of transient failures. This retries just those instead of
    re-fetching all ~800 pages. Entries that legitimately have no requirements container
    (`found: False` with no error) are left alone — refetching them changes nothing.
    """
    save_path = save_path or raw_path

    with open(raw_path, 'r') as f:
        programs = json.load(f)

    failed = [i for i, p in enumerate(programs) if p.get("error")]
    print(f"[repair] {len(failed)} program(s) to retry")

    fixed = 0
    for i in failed:
        entry = programs[i]
        result = scrape_program(entry)
        if not result.get("error"):
            fixed += 1
        programs[i] = result

    with open(save_path, 'w') as f:
        json.dump(programs, f, indent=4)

    print(f"[repair] recovered {fixed} of {len(failed)}")
    return programs


CLEAN_PROGRAM_REQUIRMENTS_LINK = os.path.join(SCRIPT_DIR, "program_requirements_clean.json")

# "Select one/two/N of the following:" group header — the option rows follow it.
SELECT_HEADER = re.compile(r'(?i)\bselect\s+(one|two|three|four|\d+)\b')
# Trailing footnote-reference digits on a label, e.g. "Complementary elective 1,7".
TRAILING_REFS = re.compile(r'\s*\d+(?:\s*,\s*\d+)*\s*$')

# Row classes that are structural (year/term headers, per-term and total sums) — never courses.
STRUCTURAL_ROW_CLASSES = {"plangridyear", "plangridterm", "plangridsum", "plangridtotal"}

# Labels to drop from requirements entirely — even when they appear as an alternative
# (University Core Curriculum is a free-choice pool, not a tracked requirement).
EXCLUDED_LABELS = {"university core curriculum"}


def _cell_by_col(row, col):
    """Return the first cell whose CSS class set contains `col` (e.g. 'codecol', 'hourscol')."""
    for cell in row.get("cells", []):
        if col in cell.get("classes", []):
            return cell
    return None


def _row_footnotes(row):
    """Union of footnote reference numbers across every cell in the row (they can sit on
    the code column or the title column).

    A few catalog pages separate multiple refs with a period rather than a comma, so a
    raw ref can arrive as "1.2" meaning footnotes 1 and 2 — split those apart here so
    they resolve against the program's footnote table.
    """
    refs = []
    for cell in row.get("cells", []):
        for raw_ref in cell.get("footnote_refs", []):
            for r in re.split(r"[,.\s]+", str(raw_ref)):
                if r and r not in refs:
                    refs.append(r)
    return refs


def _is_course_row(row):
    """A requirement row is an 'even'/'odd' plan-grid row that is not a structural
    (year/term/sum/total) row and has a non-empty code column."""
    classes = set(row.get("classes", []))
    if not (classes & {"even", "odd"}):
        return False
    if classes & STRUCTURAL_ROW_CLASSES:
        return False
    code_cell = _cell_by_col(row, "codecol")
    if code_cell is None:
        # sc_courselist rows may not tag a codecol; fall back to the first cell.
        code_cell = row["cells"][0] if row.get("cells") else None
    return bool(code_cell and code_cell.get("text"))


def _row_tokens(row):
    """The course code(s) or, failing that, the label text carried by a requirement row.

    Returns a list: the bubblelink course codes if present (an inline 'A or B' yields
    both, a cross-list 'ENGR 216/PHYS 216' stays a single token), otherwise the cleaned
    label text with trailing footnote digits stripped (e.g. 'University Core Curriculum')."""
    code_cell = _cell_by_col(row, "codecol") or (row["cells"][0] if row.get("cells") else {})
    courses = [c["code"] for c in code_cell.get("courses", [])]
    if courses:
        tokens = courses
    else:
        label = TRAILING_REFS.sub("", code_cell.get("text", "")).strip()
        tokens = [label] if label else []
    return [t for t in tokens if t.strip().lower() not in EXCLUDED_LABELS]


def _requirement(tokens, footnotes):
    """Build a uniform requirement object: first token is the course, the rest are
    swappable alternatives."""
    return {
        "course": tokens[0],
        "alternatives": tokens[1:],
        "footnotes": footnotes,
    }


def generate_clean_program_requirments(program_requirments_path=PROGRAM_REQUIRMENTS_PATH, save_path=CLEAN_PROGRAM_REQUIRMENTS_LINK):
    """Convert the raw CourseLeaf scrape into a per-program list of requirement objects.

    Each requirement is {course, alternatives, footnotes}:
      - single course / cross-list  -> course=code as shown, alternatives=[]
      - inline 'A or B'             -> course=A, alternatives=[B, ...]  (from the bubblelinks)
      - 'Select one of the following:' + following empty-hours rows
                                    -> course=first option, alternatives=[rest]
      - elective/category label     -> course=label text (footnote digits stripped)
    Footnote numbers are unioned across the row's cells; the program's footnote text is
    carried alongside so the numbers resolve. desc_name and intro are passed through.
    """
    with open(program_requirments_path, 'r') as f:
        program_requirments = json.load(f)

    clean = []
    for program in program_requirments:
        entry = {
            "desc_name": program.get("desc_name"),
            "kind": program.get("kind"),
            "url": program.get("url"),
            "intro": program.get("intro", []),
            "footnotes": program.get("footnotes", {}),
            "requirements": [],
        }

        for table in program.get("tables", []):
            rows = table.get("rows", [])
            i = 0
            while i < len(rows):
                row = rows[i]

                if not _is_course_row(row):
                    i += 1
                    continue

                code_cell = _cell_by_col(row, "codecol") or row["cells"][0]

                # "Select one of the following:" — consume the following option rows,
                # which are marked by an EMPTY hours column, into one requirement.
                if SELECT_HEADER.search(code_cell.get("text", "")) and not code_cell.get("courses"):
                    footnotes = _row_footnotes(row)
                    tokens = []
                    j = i + 1
                    while j < len(rows):
                        opt = rows[j]
                        opt_classes = set(opt.get("classes", []))
                        if not (opt_classes & {"even", "odd"}) or (opt_classes & STRUCTURAL_ROW_CLASSES):
                            break
                        hours_cell = _cell_by_col(opt, "hourscol")
                        if hours_cell is not None and hours_cell.get("text", "").strip():
                            break  # own hours => a new requirement, group is over
                        tokens.extend(_row_tokens(opt))
                        for r in _row_footnotes(opt):
                            if r not in footnotes:
                                footnotes.append(r)
                        j += 1
                    if tokens:
                        entry["requirements"].append(_requirement(tokens, footnotes))
                    i = j
                    continue

                # Ordinary requirement row (single course, cross-list, inline OR, or label).
                tokens = _row_tokens(row)
                if tokens:
                    entry["requirements"].append(_requirement(tokens, _row_footnotes(row)))
                i += 1

        clean.append(entry)

    with open(save_path, 'w') as f:
        json.dump(clean, f, indent=4)

if __name__ == "__main__":
    # Load the college links from the JSON file.
    with open(COLLEGE_LINKS_PATH, 'r') as f:
        college_links = json.load(f)

    # Scrape the program links and save them to a JSON file.
    get_program_links(college_links, save_path=PROGRAM_LINKS_PATH)

    # Scrape the program requirements and save them to a JSON file.
    scrape_tables_raw(program_links=PROGRAM_LINKS_PATH, save_path=PROGRAM_REQUIRMENTS_PATH)
    
    # Generate the clean program requirements and save them to a JSON file.
    generate_clean_program_requirments(program_requirments_path=PROGRAM_REQUIRMENTS_PATH, save_path=CLEAN_PROGRAM_REQUIRMENTS_LINK)