const express = require('express');

const router = express.Router();

router.get("/level1", async (req, res) => {
    return {
        status: "HEALTHY"
    };
})

module.exports = router;