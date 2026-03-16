const express = require("express");
const { createDepositOrder, verifyPayment, getWalletInfo } = require("../controllers/walletController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/deposit/order", protect, createDepositOrder);
router.post("/deposit/verify", protect, verifyPayment);
router.get("/info", protect, getWalletInfo);

module.exports = router;
