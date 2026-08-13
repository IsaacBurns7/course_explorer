from pypdf import PdfReader
import re
import json

def extract_degree_from_pdf(degree_plan_pdf):
    SEMESTER_APPROVED_FORMAT = re.compile(r'(Fall|Spring|Summer)\s+(\d{4})')   # "Fall 2024" from the advisor approved download
    SEMESTER_DEGREE_PLANNER_FORMAT = re.compile(r'(\d{4})\s+-\s+(Fall|Spring|Summer)') # "2024 - Fall" from the general degree planner download
    COURSE = re.compile(r'([A-Z]{4,5})\s+(\d{3,4})\s+(.+?)\s+(\d)$')
    KEYS = ("department", "number", "title", "hours")

    pdf_bytes = degree_plan_pdf.read()
    reader = PdfReader(pdf_bytes)
    lines = "\n".join(page.extract_text() for page in reader.pages).splitlines()

    degree_plan: dict[str, list] = {}
    current_sem = ""

    for line in lines:
        m = SEMESTER_APPROVED_FORMAT.search(line)
        if m:
            current_sem = f"{m.group(1)} {m.group(2)}"  # "Fall 2024"
            degree_plan[current_sem] = []

        elif m := SEMESTER_DEGREE_PLANNER_FORMAT.search(line):
            current_sem = f"{m.group(2)} {m.group(1)}"  # normalize to "Fall 2024"
            degree_plan[current_sem] = []

        elif m := COURSE.search(line):
            degree_plan[current_sem].append(dict(zip(KEYS, m.groups())))

    print(json.dumps(degree_plan))
    
if __name__ == "__main__":
    with open("c:/Users/kotha/Downloads/approval.pdf", 'r') as f:
        extract_degree_from_pdf(f)