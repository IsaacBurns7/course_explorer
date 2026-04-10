const express = require("express");
const {
  initPassport,
  googleAuth,
  googleCallback,
  authFail,
  logout,
  me,
  getPlanner,
  savePlanner,
} = require("../controllers/auth");

const router = express.Router();

// Initialize passport strategy once
initPassport();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/fail", authFail);
router.post("/logout", logout);
router.get("/me", me);
router.get("/getPlanner", getPlanner);
router.post("/savePlanner", savePlanner);

module.exports = router;