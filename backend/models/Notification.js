const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true }, // e.g., 'AUCTION_BID', 'LOAN_UPDATE', 'MARKET_SALE'
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // Optional path to related resource
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}).index({ recipient: 1 }).index({ createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
