const express = require("express");
const router = express.Router();

const { recordProgress, getWeeklyAnalysis } = require("../controllers/analyticsController");

router.post("/progress", recordProgress);
router.get("/weekly", getWeeklyAnalysis);

module.exports = router;

