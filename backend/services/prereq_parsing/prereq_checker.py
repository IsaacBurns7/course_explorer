import json
import re

"""
WILL NOT BE IMPLEMENTED WITH PYTHON. 
TOOLS WERE DRAFTED IN PYTHON ORIGINALLY AND
CAN BE READ THROUGH THIS FILE FOR BETTER UNDERSTANDING
AT THE TIME OF INITIAL PUSH THIS IS NOT DOCUMENTED,
BUT THE TS VERSION IS, AND IT BEHAVES THE SAME
"""
def parse_prereq(filename, course_name):
    try:
        with open(filename) as f:
            data = json.load(f)
            class_bucket = data[course_name]
            prereq_buckets = class_bucket["info"]["prereqs"]
            return prereq_buckets
    except Exception as e:
        print("Error loading prereqs:", e)
        return False


def evaluate_bucket(courses_taken, courses_enrolled, bucket):
    """
    Recursively evaluate a prereq 'bucket' list.
    Returns True or False.
    """
    print("Evaluating bucket:", json.dumps(bucket, indent=2))
    # Base case: if it's a string
    if isinstance(bucket, str):
        return evaluate_single_requirement(courses_taken, courses_enrolled, bucket)
    
    # Base case: if it's a boolean already
    if isinstance(bucket, bool):
        return bucket
    
    # Recursive case: evaluate sub-buckets
    evaluated = []
    for element in bucket:
        if isinstance(element, list):
            evaluated.append(evaluate_bucket(courses_taken, courses_enrolled, element))
        elif isinstance(element, str):
            evaluated.append(evaluate_single_requirement(courses_taken, courses_enrolled, element))
        else: #boolean
            evaluated.append(element)
    
    # Process ORs (".") left to right
    while "." in evaluated:
        idx = evaluated.index(".")
        left = evaluated[idx - 1]
        right = evaluated[idx + 1]
        evaluated[idx - 1:idx + 2] = [left or right]

    # After ORs, the remaining items are ANDs
    return all(evaluated)


def evaluate_single_requirement(courses_taken, courses_enrolled, token):
    token = token.strip()

    # Handle OR symbol (.)
    if token == ".":
        return token

    # Regex for base course pattern, e.g., "CHEM107 C" or "CHEM107 C ^"
    pattern = r"^([A-Z]{4}\d{3})\s*([A-F])?(?:\s*\^)?$"
    match = re.match(pattern, token)
    if not match:
        return False

    course_code, min_grade = match.groups()
    min_grade = min_grade or "D"  # default to D if unspecified (most lenient)

    # Build both possible representations
    required_with_grade = f"{course_code} {min_grade}"
    required_concurrent = f"{required_with_grade} ^"

    # Helper: function to extract grade letter
    def extract_grade(entry):
        parts = entry.split()
        return parts[-1] if len(parts) > 1 and parts[-1].isalpha() else None

    # --- 1️⃣ Check if concurrently enrolled ---
    if required_concurrent in courses_enrolled:
        return True  # currently taking it → satisfies "C ^" type prereq

    # --- 2️⃣ Check if already taken with sufficient grade ---
    for taken_course in courses_taken:
        if taken_course.startswith(course_code):
            grade = extract_grade(taken_course)
            if grade and grade <= min_grade:
                # e.g., A <= C (satisfied)
                return True

    # --- 3️⃣ Check if enrolled in base course (not marked with ^)
    for enrolled_course in courses_enrolled:
        if enrolled_course.startswith(course_code):
            return True

    return False


def prereqchecker(courses_taken, courses_enrolled, prereq_bucket):
    return evaluate_bucket(courses_taken, courses_enrolled, prereq_bucket)


if __name__ == "__main__":
    #ECEN 403 prereq bucket
    prereq_bucket = parse_prereq("data_Spring2026_Prereq.json", "ECEN_403")
    
    # Example test cases:
    assert prereqchecker(
        ["COMM205 C", "ECEN314 C", "ECEN325 C", "CSCE350 C", "ECEN303 C", "ECEN322 C", "ECEN370 C"],
        [],
        prereq_bucket
    ) == True
    
    assert prereqchecker(
        ["ECEN314 C", "ECEN325 C", "CSCE350 C", "CSCE315 C",  "ECEN303 C", "COMM205 C"],
        ["ECEN449 C ^"],
        prereq_bucket
    ) == True

    assert prereqchecker(
        ["ECEN314 C", "ECEN325 C", "CSCE350 C", "CSCE315 C",  "ECEN303 C"],
        ["ECEN449 C ^"],
        prereq_bucket
    ) == False

    #FINC_428 prereq bucket
    FINC_428_prereq_bucket = parse_prereq("data_Spring2026_Prereq.json", "FINC_428")
    assert prereqchecker(
        [],
        [],
        FINC_428_prereq_bucket
    ) == False
    assert prereqchecker(
        ["FINC421 D","FINC361 D"],
        ["ACCT328 D ^"],
        FINC_428_prereq_bucket
    ) == True
    assert prereqchecker(
        ["FINC421 D","FINC361 D", "ACCT328 C"],
        [],
        FINC_428_prereq_bucket
    ) == True
    assert prereqchecker(
        ["FINC421 A","FINC361 D"],
        ["ACCT328 ^"],
        FINC_428_prereq_bucket
    ) == True
    CSCE_421_prereq_bucket = parse_prereq("data_Spring2026_Prereq.json", "CSCE_421")
    assert prereqchecker(
        ["ECEN303 C", "CSCE120 C"],
        [],
        CSCE_421_prereq_bucket
    ) == False
