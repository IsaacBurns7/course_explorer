const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("../db");

const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

async function findOrCreateUserFromGoogle(profile) {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value || null;
    const name = profile.displayName || null;
    const picture = profile.photos?.[0]?.value || null;

    const existing = await pool.query(
        "SELECT id, email, name, picture FROM course_explorer.users WHERE google_id = $1",
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

    await pool.query(
    `
    INSERT INTO course_explorer.users_planner (id, planner)
    VALUES ($1, $2)
    ON CONFLICT (id) DO NOTHING
    `,
    [inserted.rows[0].id, null]
  );
    return inserted.rows[0];
}

function initPassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUserFromGoogle(profile);
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

/**
 * GET /auth/google
 */
const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

/**
 * GET /auth/google/callback
 */
const googleCallback = [
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/fail",
  }),
  (req, res) => {
    const token = jwt.sign(req.user, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set true in production (HTTPS)
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .redirect(process.env.CLIENT_ORIGIN || "http://localhost:3000");
  },
];

/**
 * GET /auth/fail
 */
function authFail(_req, res) {
  res.status(401).json({ ok: false });
}

/**
 * POST /auth/logout
 */
function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  res.json({ ok: true });
}

/**
 * GET /auth/me
 */
function me(req, res) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.json({ user: null });

    const user = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ user });
  } catch {
    return res.json({ user: null });
  }
}

/*
* GET /auth/getPlanner
*/
async function getPlanner(req, res) {
    const token = req.cookies?.token;
    if (!token) return res.json({});

    const user = jwt.verify(token, process.env.JWT_SECRET);

    const existing = await pool.query(
        "SELECT planner FROM course_explorer.users_planner WHERE id = $1",
        [user.id]
    );

    if (!existing.rows[0]?.planner) {
        return res.status(200).json({});
    }

    try {
        // Decompress the stored buffer
        const compressedBuffer = existing.rows[0].planner;
        const decompressed = await gunzip(compressedBuffer);
        const plannerData = JSON.parse(decompressed.toString());
        
        return res.status(200).json(plannerData);
    } catch (error) {
        console.error('Failed to decompress planner:', error);
        return res.status(500).json({ error: 'Failed to retrieve planner' });
    }
}

/*
* POST /auth/savePlanner
*/
async function savePlanner(req, res) {
    const token = req.cookies?.token;
    if (!token) return res.json({});

    const user = jwt.verify(token, process.env.JWT_SECRET);

    try {
        // Compress the planner data
        const plannerJson = JSON.stringify(req.body);
        const compressed = await gzip(plannerJson);

        const existing = await pool.query(
            "SELECT planner FROM course_explorer.users_planner WHERE id = $1",
            [user.id]
        );

        // Store as bytea (binary data)
        if (existing.rows.length > 0) {
            await pool.query(
                "UPDATE course_explorer.users_planner SET planner = $1 WHERE id = $2",
                [compressed, user.id]
            );
        } else {
            await pool.query(
                `INSERT INTO course_explorer.users_planner (id, planner)
                VALUES ($1, $2)`,
                [user.id, compressed]
            );
        }

        console.log(`Compressed: ${plannerJson.length} bytes → ${compressed.length} bytes`);
        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Failed to save planner:', error);
        return res.status(500).json({ error: 'Failed to save planner' });
    }
}



module.exports = {
  initPassport,
  googleAuth,
  googleCallback,
  authFail,
  logout,
  me,
  getPlanner,
  savePlanner,
};