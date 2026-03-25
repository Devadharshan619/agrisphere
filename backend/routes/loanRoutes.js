const express = require("express");
const router = express.Router();
const { applyForLoan, getLoans, getLoanById } = require("../controllers/loanController");
const { protect } = require("../middleware/authMiddleware");

router.post("/apply", protect, applyForLoan);
router.get("/my-loans", protect, getLoans);
router.get("/:id", protect, getLoanById);

module.exports = router;
