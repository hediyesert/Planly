const express = require("express");
const router = express.Router();

const { generateSchedule } = require("../controllers/scheduleController");

router.post("/generate-schedule", generateSchedule);

module.exports = router;

