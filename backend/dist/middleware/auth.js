"use strict";
// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
exports.requireAuth = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token)
        return res.status(401).json({ error: "Not authenticated" });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (e) {
        return res.status(401).json({ error: "Invalid/expired token" });
    }
};
