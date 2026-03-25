const mongoose = require("mongoose");

const ActionTaskSchema = new mongoose.Schema({
  actionRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "ActionRoom", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  createdAt: { type: Date, default: Date.now }
}).index({ actionRoomId: 1 }).index({ assignedTo: 1 });

module.exports = mongoose.model("ActionTask", ActionTaskSchema);
