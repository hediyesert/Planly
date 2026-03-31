const express = require("express");
const { weekly } = require("../controllers/analyticsController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.get("/weekly", weekly);

module.exports = router;
