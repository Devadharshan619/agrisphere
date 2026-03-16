const express = require("express");
const router = express.Router();
const { createListing, getAllListings, buyCrop } = require("../controllers/marketplaceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/listings", protect, authorize("farmer"), createListing);
router.get("/listings", protect, getAllListings);
router.post("/buy", protect, authorize("trader", "admin"), buyCrop);

module.exports = router;
