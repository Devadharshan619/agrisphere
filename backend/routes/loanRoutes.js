const express = require("express");
const router = express.Router();
const { applyForLoan, getAllLoans, getMyLoans, updateLoanStatus } = require("../controllers/loanController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Farmer endpoints
router.post("/apply", protect, authorize("farmer"), applyForLoan);
router.get("/my-loans", protect, authorize("farmer"), getMyLoans);

// Bank endpoints
router.get("/", protect, authorize("bank", "admin"), getAllLoans);
router.put("/:id/status", protect, authorize("bank", "admin"), updateLoanStatus);

module.exports = router;
