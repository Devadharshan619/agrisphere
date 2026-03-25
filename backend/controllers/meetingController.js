const Meeting = require("../models/Meeting");
const MeetingTask = require("../models/MeetingTask");

exports.createMeeting = async (req, res) => {
  try {
    const { title, description, participants, startTime, endTime, location } = req.body;
    const meeting = new Meeting({
      title,
      description,
      organizer: req.user.id,
      participants: [...(participants || []), req.user.id],
      startTime,
      endTime,
      location
    });
    await meeting.save();
    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ organizer: req.user.id }, { participants: req.user.id }]
    }).sort({ startTime: 1 });
    res.json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.assignTask = async (req, res) => {
  try {
    const { meetingId, assignedTo, title, description, dueDate, priority } = req.body;
    const task = new MeetingTask({
      meetingId,
      assignedTo,
      title,
      description,
      dueDate,
      priority
    });
    await task.save();
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
