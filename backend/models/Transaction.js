const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "payment", "received"],
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
  referenceId: {
    // Razorpay order ID or transaction ID
    type: String,
  },
  description: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
