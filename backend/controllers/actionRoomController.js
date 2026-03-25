const ActionRoom = require("../models/ActionRoom");
const ActionTask = require("../models/ActionTask");
const ActionDecision = require("../models/ActionDecision");
const { sendNotification } = require("../services/telegramService");

exports.createActionRoom = async (req, res) => {
  try {
    const { title, description, participants, startTime, endTime, priorityLevel } = req.body;
    const actionRoom = new ActionRoom({
      title,
      description,
      createdBy: req.user.id,
      participants: [...(participants || []), req.user.id],
      startTime,
      endTime,
      priorityLevel
    });
    await actionRoom.save();

    // Notify Participants
    for (const pId of participants || []) {
        if (pId.toString() !== req.user.id.toString()) {
            await sendNotification(pId, `🤝 *Action Room Invitation* \nYou have been invited to: *${title}*\nTime: ${new Date(startTime).toLocaleString()}`);
        }
    }

    res.status(201).json({ success: true, data: actionRoom });
  } catch (error) {
    console.error("ActionRoom creation error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getActionRooms = async (req, res) => {
  try {
    const rooms = await ActionRoom.find({
      $or: [{ createdBy: req.user.id }, { participants: req.user.id }]
    }).populate("createdBy", "name email role")
      .sort({ startTime: -1 });
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.assignActionTask = async (req, res) => {
  try {
    const { actionRoomId, assignedTo, title, description, deadline, priority } = req.body;
    const task = new ActionTask({
      actionRoomId,
      assignedTo,
      title,
      description,
      deadline,
      priority
    });
    await task.save();

    // Notify Assignee
    await sendNotification(assignedTo, `📝 *New Action Task* \nRoom ID: ${actionRoomId}\nTask: *${title}*\nPriority: ${priority}`);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.recordDecision = async (req, res) => {
  try {
    const { actionRoomId, decisionText, impactLevel } = req.body;
    const decision = new ActionDecision({
      actionRoomId,
      decisionText,
      impactLevel,
      resolvedBy: req.user.id
    });
    await decision.save();
    res.status(201).json({ success: true, data: decision });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getRoomDetails = async (req, res) => {
  try {
    const room = await ActionRoom.findById(req.params.id).populate("participants", "name email");
    if (!room) return res.status(404).json({ success: false, message: "ActionRoom not found" });

    const tasks = await ActionTask.find({ actionRoomId: room._id }).populate("assignedTo", "name");
    const decisions = await ActionDecision.find({ actionRoomId: room._id }).populate("resolvedBy", "name");

    res.json({
      success: true,
      data: {
        room,
        tasks,
        decisions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
