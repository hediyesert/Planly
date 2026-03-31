const express = require("express");
const { aiGenerate, listMine, getOne } = require("../controllers/studyPlanController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.post("/ai-generate", aiGenerate);
router.get("/", listMine);
router.get("/:id", getOne);

module.exports = router;
