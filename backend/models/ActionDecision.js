const mongoose = require("mongoose");

const ActionDecisionSchema = new mongoose.Schema({
  actionRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "ActionRoom", required: true },
  decisionText: { type: String, required: true },
  impactLevel: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolvedAt: { type: Date, default: Date.now }
}).index({ actionRoomId: 1 });

module.exports = mongoose.model("ActionDecision", ActionDecisionSchema);
