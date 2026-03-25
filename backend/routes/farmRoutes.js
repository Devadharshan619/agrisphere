const express = require("express");
const router = express.Router();
const { addFarm, getFarms, analyzeFarm } = require("../controllers/farmController");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addFarm);
router.get("/", protect, getFarms);
router.post("/:id/analyze", protect, analyzeFarm);

module.exports = router;