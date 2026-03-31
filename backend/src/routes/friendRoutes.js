const express = require("express");
const {
  sendRequest,
  accept,
  rejectRequest,
  removeFriendship,
  listFriends,
  activeStudying,
} = require("../controllers/friendController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.post("/request", sendRequest);
router.get("/active-studying", activeStudying);
router.get("/", listFriends);
router.post("/:id/reject", rejectRequest);
router.post("/:id/accept", accept);
router.delete("/:id", removeFriendship);

module.exports = router;
