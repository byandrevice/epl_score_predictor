const express = require("express");
const router = express.Router();

router.get("/dashboard-meta", async (req, res) => {
    res.json({
        success: true,
        message: "Dashboard metadata loaded"
    });
});

module.exports = router;
