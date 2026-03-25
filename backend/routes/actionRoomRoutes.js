const express = require("express");
const router = express.Router();
const { 
  createActionRoom, 
  getActionRooms, 
  assignActionTask, 
  recordDecision,
  getRoomDetails 
} = require("../controllers/actionRoomController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createActionRoom);
router.get("/all", protect, getActionRooms);
router.get("/:id", protect, getRoomDetails);
router.post("/task", protect, assignActionTask);
router.post("/decision", protect, recordDecision);

module.exports = router;
