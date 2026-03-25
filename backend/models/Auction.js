const mongoose = require("mongoose");

const AuctionSchema = new mongoose.Schema({
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
  cropName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  startingBid: {
    type: Number,
    required: true
  },
  currentHighestBid: {
    type: Number,
    default: 0
  },
  highestBidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  status: {
    type: String,
    enum: ["upcoming", "active", "completed", "cancelled"],
    default: "upcoming"
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}).index({ status: 1 }).index({ farmerId: 1 });

module.exports = mongoose.model("Auction", AuctionSchema);
