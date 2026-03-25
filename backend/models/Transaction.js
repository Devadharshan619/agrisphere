const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "deposit", 
      "withdrawal", 
      "transfer_in", 
      "transfer_out", 
      "marketplace_payment", 
      "marketplace_revenue", 
      "auction_bid", 
      "loan_disbursement", 
      "loan_repayment"
    ],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  receiverWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    default: null
  },
  referenceId: {
    // Razorpay order ID or transaction ID
    type: String,
  },
  description: {
    type: String,
  }
}, { timestamps: true }).index({ wallet: 1 }).index({ status: 1 }).index({ type: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
