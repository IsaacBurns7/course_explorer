const fetch = require('node-fetch')
const fs = require('fs')
const BASE_URL = "https://www.ratemyprofessors.com/graphql";
const SCHOOL_NODE_ID = "U2Nob29sLTEwMDM="; // Texas A&M University at College Station
const PAGE_SIZE = 20; // RMP caps page sizes; 20 is a safe upper bound
const SEARCH_TEXT = ""; // empty = all teachers at the school

// Minimal headers. If you find you need cookies or extra headers in your environment,
// you can add them to HEADERS below.
const HEADERS = {
  "content-type": "application/json",
  "accept": "*/*",
};

const QUERY = `
  query TeacherSearch($query: TeacherSearchQuery!, $first: Int!, $after: String) {
    newSearch {
      teachers(query: $query, first: $first, after: $after) {
        edges {
          node {
            id
            legacyId
            firstName
            lastName
            department
            avgRating
            numRatings
            wouldTakeAgainPercent
            avgDifficulty
            school { name id }
          }
        }
        pageInfo { hasNextPage endCursor }
        resultCount
      }
    }
  }
`;

async function fetchPage({ after }) {
  const body = {
    query: QUERY,
    variables: {
      query: {
        text: SEARCH_TEXT,
        schoolID: SCHOOL_NODE_ID,
        fallback: true,
      },
      first: PAGE_SIZE,
      after: after ?? "",
    },
  };

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data.newSearch.teachers;
}

async function fetchAllTeachers() {
  let all = [];
  let after = "";
  let hasNext = true;

  // Simple retry wrapper for transient errors (e.g., 429 / 5xx)
  const withRetry = async (fn, { retries = 4 } = {}) => {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt > retries) throw err;
        const backoffMs = Math.min(30_000, 500 * 2 ** (attempt - 1));
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  };

  while (hasNext) {
    const page = await withRetry(() => fetchPage({ after }));
    const edges = page.edges ?? [];
    const mapped = edges.map(({ node }) => {
      const name = [node.firstName, node.lastName].filter(Boolean).join(" ").trim();
      const legacyId = node.legacyId; // used for profile URL
      return {
        name: name || null,
        department: node.department ?? null,
        school: node.school?.name ?? null,
        rating: node.avgRating ?? null,
        numRatings: node.numRatings ?? 0,
        wouldTakeAgain: node.wouldTakeAgainPercent ?? null, // already in percent
        difficulty: node.avgDifficulty ?? null,
        profileLink: legacyId ? `https://www.ratemyprofessors.com/professor/${legacyId}` : null,
      };
    });

    all.push(...mapped);
    hasNext = page.pageInfo?.hasNextPage ?? false;
    after = page.pageInfo?.endCursor ?? "";
  }

  return all;
}

(async () => {
  try {
    const professors = await fetchAllTeachers();
    // Write to file
   fs.writeFile("professors.json", JSON.stringify(professors, null, 2), "utf8", (err) => {
    if (err) return console.error(err);
    console.log("Saved professors.json");
    });
    console.log(`Saved ${professors.length} professors to professors.json`);
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  }
})();