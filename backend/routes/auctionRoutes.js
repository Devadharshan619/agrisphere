const express = require("express");
const router = express.Router();
const { createAuction, getAllAuctions, placeBid } = require("../controllers/auctionController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createAuction);
router.get("/all", protect, getAllAuctions);
router.post("/:id/bid", protect, placeBid);

module.exports = router;
