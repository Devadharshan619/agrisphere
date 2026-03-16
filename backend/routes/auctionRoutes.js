const express = require("express");
const router = express.Router();
const { createAuction, getAllAuctions, placeBid } = require("../controllers/auctionController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("farmer"), createAuction);
router.get("/", protect, getAllAuctions);
router.post("/:id/bid", protect, authorize("trader", "admin"), placeBid);

module.exports = router;
