const mongoose = require("mongoose");

const ActionRoomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  priorityLevel: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  status: { type: String, enum: ["open", "closed", "cancelled"], default: "open" },
  createdAt: { type: Date, default: Date.now }
}).index({ createdBy: 1 }).index({ startTime: 1 });

module.exports = mongoose.model("ActionRoom", ActionRoomSchema);
