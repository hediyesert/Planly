const express = require("express");
const { completeTask, listByPlan } = require("../controllers/taskController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.get("/", listByPlan);
router.put("/:taskId/complete", completeTask);

module.exports = router;
