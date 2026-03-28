const express = require("express");
const router = express.Router();

const { listExams } = require("../controllers/examsController");

router.get("/exams", listExams);

module.exports = router;

