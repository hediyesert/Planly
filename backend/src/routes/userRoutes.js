const express = require("express");
const { searchUsers, changePassword, updateMe, deleteUser } = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.get("/search", searchUsers);
router.put("/me", updateMe);
router.put("/me/password", changePassword);
router.delete("/:userId", deleteUser);

module.exports = router;
