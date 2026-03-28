const express = require("express");
const router = express.Router();

const { generatePlan } = require("../controllers/aiController");

router.post("/generate", generatePlan);

module.exports = router;