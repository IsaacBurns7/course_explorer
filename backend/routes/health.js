const express = require('express');

const router = express.Router();

router.get("/level1", async (req, res) => {
    res.status(200).send({"STATUS": "HEALTHY"});
})

module.exports = router;