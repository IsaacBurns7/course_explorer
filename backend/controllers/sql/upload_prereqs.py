import json
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

load_dotenv()
CONN_STR = os.getenv("NEON_DB_URL")

from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent
FILE_PATH = BASE_DIR / "../../data/data_Spring2026_Prereq_test.json"


def get_connection():
    return psycopg2.connect(CONN_STR)


def load_data():
    with open(FILE_PATH) as f:
        return json.load(f)


def build_rows(data):
    rows = []
    for course_id, course_data in data.items():
        prereqs = course_data.get("info", {}).get("prereqs")
        if prereqs:
            rows.append((course_id, json.dumps(prereqs)))
    return rows


def print_course(cur, course_id):
    cur.execute(
        "SELECT course_id, prereqs FROM course_prereqs WHERE course_id = %s",
        (course_id,)
    )
    result = cur.fetchone()

    print("\n--- DB RESULT ---")
    if result:
        print("course_id:", result[0])
        print("prereqs:", result[1])
    else:
        print("No entry found.")


def test_single_course(conn, course_id):
    cur = conn.cursor()
    data = load_data()

    course = data.get(course_id)
    if not course:
        print("Course not found in JSON.")
        return

    prereqs = course.get("info", {}).get("prereqs")
    if not prereqs:
        print("No prereqs for this course.")
        return

    row = (course_id, json.dumps(prereqs))

    print("\n--- TEST MODE ---")
    print("Course:", course_id)
    print("Prereqs:", prereqs)

    # Show SQL
    print("\nGenerated SQL:")
    print(cur.mogrify(
        "INSERT INTO course_prereqs (course_id, prereqs) VALUES (%s, %s)",
        row
    ).decode())

    # Execute but DO NOT commit
    query = """
    INSERT INTO course_prereqs (course_id, prereqs)
    VALUES %s
    ON CONFLICT (course_id)
    DO UPDATE SET prereqs = EXCLUDED.prereqs;
    """

    execute_values(cur, query, [row])

    print("\nExecuted insert (NOT committed).")

    # Show what's in DB (within transaction)
    print_course(cur, course_id)

    # Rollback
    conn.rollback()
    print("\nRollback complete — no changes saved.")

    cur.close()
    conn.close()


def run_full_upload(conn):
    confirm = input("⚠️ This will upsert ALL courses. Type 'yes' to continue: ")
    if confirm.lower() != "yes":
        print("Aborted.")
        return

    cur = conn.cursor()

    data = load_data()
    rows = build_rows(data)

    print(f"\nUploading {len(rows)} courses...")

    query = """
    INSERT INTO course_prereqs (course_id, prereqs)
    VALUES %s
    ON CONFLICT (course_id)
    DO UPDATE SET prereqs = EXCLUDED.prereqs;
    """

    execute_values(cur, query, rows)

    conn.commit()
    print("Upload complete and committed.")

    cur.close()
    conn.close()

def table_verification(conn):
    with conn.cursor() as cur:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS course_prereqs (
            course_id TEXT PRIMARY KEY,
            prereqs JSONB
        );
        """)
        conn.commit()

        cur.execute("SELECT current_database();")
        print("Connected to DB:", cur.fetchone())

        cur.execute("SHOW search_path;")
        print("Schema:", cur.fetchone())

def main():
    print("1) Test a single course")
    print("2) Run full upload")

    choice = input("Select option: ").strip()
    conn = get_connection()
    table_verification(conn)

    if choice == "1":
        course_id = input("Enter course ID (exact match): ").strip()
        test_single_course(conn, course_id)

    elif choice == "2":
        run_full_upload(conn)

    else:
        print("Invalid option.")


if __name__ == "__main__":
    main()