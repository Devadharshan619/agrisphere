const express = require("express");
const router = express.Router();
const { createListing, getAllListings, buyCrop } = require("../controllers/marketplaceController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createListing);
router.get("/all", protect, getAllListings);
router.post("/buy", protect, buyCrop);

module.exports = router;
