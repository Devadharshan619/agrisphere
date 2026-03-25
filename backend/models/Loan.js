const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true
  },
  amountRequested: {
    type: Number,
    required: true
  },
  purpose: {
    type: String
  },
  aiCreditScore: {
    type: Number,
  },
  riskCategory: {
    type: String, // Low, Medium, High
  },
  recommendedMax: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "repaid", "Pre-Approved", "Pending Manual Review"],
    default: "pending"
  },
  bankNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}).index({ farmerId: 1 }).index({ status: 1 });

module.exports = mongoose.model("Loan", LoanSchema);
