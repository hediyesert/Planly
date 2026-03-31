const express = require("express");
const { startSession, getCurrentSession, updateStatus, finishSession } = require("../controllers/studySessionController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { requireFields } = require("../middlewares/validateMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.post("/start", startSession);
router.get("/current", getCurrentSession);
router.put("/:sessionId/status", requireFields(["status"]), updateStatus);
router.put("/:sessionId/finish", finishSession);

module.exports = router;
