const pool = require("./db");

async function findOrCreateUserFromGoogle(profile) {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value || null;
    const name = profile.displayName || null;
    const picture = profile.photos?.[0]?.value || null;

    const existing = await pool.query(
        "SELECT id, email, name FROM course_explorer.users WHERE google_id = $1",
        [googleId]
    );

    if (existing.rows.length > 0) {
        return existing.rows[0];
    }

    const inserted = await pool.query(
        `INSERT INTO course_explorer.users (google_id, email, name, picture)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name`,
        [googleId, email, name, picture]
    );
    return inserted.rows[0];
}

module.exports = { findOrCreateUserFromGoogle };