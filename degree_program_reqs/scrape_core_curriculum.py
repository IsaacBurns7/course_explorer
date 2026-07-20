"""
Generates a core_curriculum.json file containing the University Core Curriculum, the
International and Cultural Diversity (ICD) requirement and the Cultural Discourse (CD)
requirement. Scrapes the CourseLeaf tables from the inputted links, in the same fashion
as scrape_programs.py.

Unlike the degree program pages, these pages hang their tables off `#textcontainer` and
each table is a flat pool of interchangeable courses: pick N semester credit hours from
the list. So instead of ordered requirement rows we emit, per area, the hours required
and the pool of courses that satisfy it.
"""

import os
import re
import json
import requests
import bs4
from anyascii import anyascii

# Resolve data files relative to this script so it runs from any working directory.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

CORE_CURRICULUM_PATH = os.path.join(SCRIPT_DIR, "core_curriculum.json")

BASE_URL = "https://catalog.tamu.edu"

TEXT_CONTAINER_ID = "textcontainer"

# The three pages that together make up the university-wide (non-major) requirements.
# `split_by_heading` marks the University Core page, whose single container holds eight
# Foundational Component Areas separated by <h2> headings; the other two pages are one
# undivided pool each.
SOURCES = [
    {
        "category": "university_core_curriculum",
        "name": "University Core Curriculum",
        "url": BASE_URL + "/undergraduate/general-information/university-core-curriculum/",
        "split_by_heading": True,
    },
    {
        "category": "international_cultural_diversity",
        "name": "International and Cultural Diversity",
        "url": BASE_URL + "/undergraduate/general-information/degree-information/international-cultural-diversity-requirements/",
        "split_by_heading": False,
    },
    {
        "category": "cultural_discourse",
        "name": "Cultural Discourse",
        "url": BASE_URL + "/undergraduate/general-information/degree-information/cultural-discourse-requirements/",
        "split_by_heading": False,
    },
]

# Trailing semester-credit-hour count on an area heading, e.g. "Communication - 6 SCH 1"
# (the trailing digit, when present, is a footnote reference).
HEADING_HOURS = re.compile(r"(?i)\b(\d+)\s*SCH\b")
# "three (3) semester credit hours" in the lead paragraph of the ICD/CD pages.
PARAGRAPH_HOURS = re.compile(r"(?i)\((\d+)\)\s*semester credit hours")


def clean_text(text):
    """Normalize scraped text: strip non-breaking spaces and transliterate to ASCII."""
    if text is None:
        return ""
    return anyascii(text.replace("\xa0", " ")).strip()


def _cell_by_col(tr, col):
    """Return the first cell whose CSS class set contains `col` (e.g. 'codecol')."""
    for cell in tr.find_all(["td", "th"]):
        if col in (cell.get("class") or []):
            return cell
    return None


def _footnote_refs(el):
    """Footnote reference numbers, which live in <sup> tags within the element."""
    refs = []
    for sup in el.find_all("sup"):
        for part in re.split(r"[,\s]+", clean_text(sup.get_text())):
            if part and part not in refs:
                refs.append(part)
    return refs


def _parse_courses(table):
    """Flatten a <table class="sc_courselist"> into a list of course objects.

    A code cell may name a cross-listed pair ("ARSC 105/CHEM 105"); the whole string is
    kept as `code` and the individual codes are split out into `cross_listed` so either
    number matches a transcript.
    """
    courses = []
    for tr in table.find_all("tr"):
        classes = set(tr.get("class") or [])
        # 'hidden'/'noscript' is the header row; anything without even/odd is structural.
        if not (classes & {"even", "odd"}):
            continue

        code_cell = _cell_by_col(tr, "codecol")
        hours_cell = _cell_by_col(tr, "hourscol")
        cells = tr.find_all(["td", "th"])
        if code_cell is None:
            code_cell = cells[0] if cells else None
        if code_cell is None:
            continue

        code = clean_text(code_cell.get_text(" ", strip=True))
        if not code:
            continue

        # The title is the cell between the code and hours columns.
        title = ""
        for cell in cells:
            cell_classes = cell.get("class") or []
            if "codecol" in cell_classes or "hourscol" in cell_classes:
                continue
            title = clean_text(cell.get_text(" ", strip=True))
            break

        hours = clean_text(hours_cell.get_text(" ", strip=True)) if hours_cell else ""

        courses.append({
            "code": code,
            "cross_listed": [c.strip() for c in code.split("/") if c.strip()],
            "title": title,
            "hours": hours,
            "footnote_refs": _footnote_refs(tr),
        })
    return courses


def _parse_footnotes(container):
    """Footnotes: <dl class="sc_footnotes"> of <dt><sup>n</sup></dt><dd>text</dd> pairs.
    A page may split these across multiple dl blocks, so iterate every one."""
    footnotes = {}
    for dl in container.find_all(class_="sc_footnotes"):
        for dt in dl.find_all("dt"):
            number = clean_text(dt.get_text(" ", strip=True))
            dd = dt.find_next_sibling("dd")
            if number:
                footnotes[number] = clean_text(dd.get_text(" ", strip=True)) if dd else ""
    return footnotes


def _heading_area(heading):
    """Split an area heading into its name and required hours, e.g.
    'Mathematics - 6 SCH 1' -> ('Mathematics', 6, ['1'])."""
    refs = _footnote_refs(heading)
    text = clean_text(heading.get_text(" ", strip=True))
    match = HEADING_HOURS.search(text)
    hours = int(match.group(1)) if match else None
    # Drop the "- 6 SCH" tail (and any trailing footnote digits) from the name.
    name = text[:match.start()] if match else text
    name = re.sub(r"[\s\-/,]+$", "", name).strip()
    return name, hours, refs


def scrape_source(source):
    """Scrape one catalog page into a list of area objects.

    Each area is {name, hours_required, description, footnote_refs, courses}. The
    University Core page yields one area per <h2> Foundational Component Area; the ICD
    and CD pages yield a single area covering their one table.
    """
    response = requests.get(source["url"])
    response.raise_for_status()

    soup = bs4.BeautifulSoup(response.content, "html.parser")
    container = soup.find(id=TEXT_CONTAINER_ID)
    if container is None:
        raise ValueError(f"no #{TEXT_CONTAINER_ID} on {source['url']}")

    footnotes = _parse_footnotes(container)

    # Intro paragraphs preceding the first table/heading describe the requirement itself.
    intro = []
    for el in container.children:
        if getattr(el, "name", None) in ("h2", "h3", "table"):
            break
        if getattr(el, "name", None) in ("p", "ul"):
            text = clean_text(el.get_text(" ", strip=True))
            if text:
                intro.append(text)

    areas = []
    if source["split_by_heading"]:
        # Walk the container in order: an <h2> opens an area, the next table fills it and
        # the paragraph after that table describes it.
        current = None
        for el in container.children:
            name = getattr(el, "name", None)
            if name in ("h2", "h3"):
                area_name, hours, refs = _heading_area(el)
                current = {
                    "name": area_name,
                    "hours_required": hours,
                    "description": "",
                    "footnote_refs": refs,
                    "courses": [],
                }
                areas.append(current)
            elif name == "table" and current is not None and "sc_courselist" in (el.get("class") or []):
                current["courses"].extend(_parse_courses(el))
            elif name == "p" and current is not None and current["courses"] and not current["description"]:
                current["description"] = clean_text(el.get_text(" ", strip=True))
    else:
        hours_match = PARAGRAPH_HOURS.search(" ".join(intro))
        area = {
            "name": source["name"],
            "hours_required": int(hours_match.group(1)) if hours_match else None,
            "description": intro[0] if intro else "",
            "footnote_refs": [],
            "courses": [],
        }
        for table in container.find_all("table", class_="sc_courselist"):
            area["courses"].extend(_parse_courses(table))
        areas.append(area)

    return {
        "category": source["category"],
        "name": source["name"],
        "url": source["url"],
        "intro": intro,
        "footnotes": footnotes,
        "areas": areas,
    }


def scrape_core_curriculum(sources=SOURCES, save_path=CORE_CURRICULUM_PATH):
    """Scrape every source page and conjoin them into one JSON file."""
    requirements = []
    for source in sources:
        try:
            scraped = scrape_source(source)
        except (requests.RequestException, ValueError) as e:
            requirements.append({
                "category": source["category"],
                "name": source["name"],
                "url": source["url"],
                "error": str(e),
                "areas": [],
            })
            print(f"[error] {source['name']}: {e}")
            continue

        requirements.append(scraped)
        total = sum(len(a["courses"]) for a in scraped["areas"])
        print(f"[ok] {source['name']}: {len(scraped['areas'])} area(s), {total} course(s)")

    with open(save_path, "w") as f:
        json.dump(requirements, f, indent=4)

    return requirements


if __name__ == "__main__":
    scrape_core_curriculum(sources=SOURCES, save_path=CORE_CURRICULUM_PATH)
