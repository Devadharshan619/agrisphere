const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: { type: String },
  status: { type: String, enum: ["scheduled", "ongoing", "completed", "cancelled"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now }
}).index({ organizer: 1 }).index({ startTime: 1 });

module.exports = mongoose.model("Meeting", MeetingSchema);
