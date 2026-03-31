const express = require("express");
const { listExamTypes, listTopicsByExam } = require("../controllers/examTypeController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", listExamTypes);
router.get("/:examTypeId/topics", listTopicsByExam);

module.exports = router;
