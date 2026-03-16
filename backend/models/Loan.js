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
  creditScoreAtApplication: {
    type: Number, // Computed AI score snapshot
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "repaid"],
    default: "pending"
  },
  bankNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Loan", LoanSchema);
