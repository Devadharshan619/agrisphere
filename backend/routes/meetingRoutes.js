const express = require("express");
const router = express.Router();
const { createMeeting, getMeetings, assignTask } = require("../controllers/meetingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createMeeting);
router.get("/all", protect, getMeetings);
router.post("/task", protect, assignTask);

module.exports = router;
