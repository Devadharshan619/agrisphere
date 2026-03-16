const express = require("express");
const router = express.Router();
const { addFarm, getFarms } = require("../controllers/farmController");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addFarm);
router.get("/", protect, getFarms);

module.exports = router;