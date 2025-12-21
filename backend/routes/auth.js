// backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { findOrCreateUserFromGoogle } = require("../users");

const router = express.Router();

//console.log("GOOGLE_CALLBACK_URL from env:", process.env.GOOGLE_CALLBACK_URL);
//console.log("GOOGLE_CLIENT_ID from env:", process.env.GOOGLE_CLIENT_ID);

// Passport strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // e.g. http://localhost:4000/auth/google/callback
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const user = await findOrCreateUserFromGoogle(profile);

      return done(null, user);
    }
  )
);

// Entry: /auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback: /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/fail" }),
  (req, res) => {
    const token = jwt.sign(req.user, process.env.JWT_SECRET, { expiresIn: "7d" });
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .redirect(process.env.CLIENT_ORIGIN || "http://localhost:3000");
  }
);

router.get("/fail", (_req, res) => res.status(401).json({ ok: false }));
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false });
  res.json({ ok: true });
});
router.get("/me", (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.json({ user: null });
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user });
  } catch {
    res.json({ user: null });
  }
});

module.exports = router;
