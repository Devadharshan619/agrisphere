const express = require("express");
const { simulatedDeposit, withdrawFunds, p2pTransfer, getWalletInfo } = require("../controllers/walletController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/deposit", protect, simulatedDeposit);
router.post("/withdraw", protect, withdrawFunds);
router.post("/transfer", protect, p2pTransfer);
router.get("/info", protect, getWalletInfo);

// Phase 8: Mock Payment Success Webhook
router.post("/mock/payment-success", protect, async (req, res) => {
  const { amount } = req.body;
  // This simulates an external payment gateway hook that was manually triggered
  res.status(200).json({ success: true, message: `Mock payment of ₹${amount} detected and verified.` });
});

module.exports = router;
