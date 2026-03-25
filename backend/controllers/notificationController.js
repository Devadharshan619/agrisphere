const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createInternalNotification = async (recipientId, type, title, message, link) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      link
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Internal notification error:", error);
  }
};
