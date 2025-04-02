const ExecutiveActivity = require("../models/ExecutiveActivity.model");

// ✅ Start Work Session
exports.startWork = async (req, res) => {
  try {
    const { ExecutiveId } = req.body;

    const [activity, created] = await ExecutiveActivity.findOrCreate({
      where: { ExecutiveId },
      defaults: {
        workTime: 0,
        breakTime: 0,
        dailyCallTime: 0,
        leadSectionVisits: 0,
      },
    });

    activity.workStartTime = new Date(); // Store start time
    await activity.save();

    res.json({ message: "Work session started", activity });
  } catch (error) {
    res.status(500).json({ message: "Error starting work session", error });
  }
};

// ✅ Stop Work Session (Calculate Work Time)
exports.stopWork = async (req, res) => {
  try {
    const { ExecutiveId } = req.body;

    const activity = await ExecutiveActivity.findOne({
      where: { ExecutiveId },
    });

    if (!activity || !activity.workStartTime) {
      return res.status(400).json({ message: "Work session not started" });
    }

    const workDuration = Math.floor(
      (new Date() - activity.workStartTime) / 60000
    ); // Convert to minutes
    activity.workTime += workDuration;
    activity.workStartTime = null; // Reset start time
    await activity.save();

    res.json({ message: "Work session stopped", workDuration, activity });
  } catch (error) {
    res.status(500).json({ message: "Error stopping work session", error });
  }
};

// ✅ Start Break Session
exports.startBreak = async (req, res) => {
  try {
    const { ExecutiveId } = req.body;

    const activity = await ExecutiveActivity.findOne({
      where: { ExecutiveId },
    });

    if (!activity) return res.status(404).json({ message: "User not found" });

    activity.breakStartTime = new Date();
    await activity.save();

    res.json({ message: "Break started" });
  } catch (error) {
    res.status(500).json({ message: "Error starting break", error });
  }
};

// ✅ Stop Break Session (Calculate Break Time)
exports.stopBreak = async (req, res) => {
  try {
    const { ExecutiveId } = req.body;

    const activity = await ExecutiveActivity.findOne({
      where: { ExecutiveId },
    });

    if (!activity || !activity.breakStartTime) {
      return res.status(400).json({ message: "Break session not started" });
    }

    const breakDuration = Math.floor(
      (new Date() - activity.breakStartTime) / 60000
    ); // Convert to minutes
    activity.breakTime += breakDuration;
    activity.breakStartTime = null;
    await activity.save();

    res.json({ message: "Break stopped", breakDuration, activity });
  } catch (error) {
    res.status(500).json({ message: "Error stopping break", error });
  }
};

// ✅ Update Daily Call Time
exports.updateCallTime = async (req, res) => {
  try {
    const { ExecutiveId, callDuration } = req.body; // callDuration in minutes

    const activity = await ExecutiveActivity.findOne({
      where: { ExecutiveId },
    });

    if (!activity) return res.status(404).json({ message: "User not found" });

    activity.dailyCallTime += callDuration;
    await activity.save();

    res.json({ message: "Call time updated", activity });
  } catch (error) {
    res.status(500).json({ message: "Error updating call time", error });
  }
};

// ✅ Track Lead Section Visit
exports.trackLeadVisit = async (req, res) => {
  try {
    const { ExecutiveId } = req.body;

    const activity = await ExecutiveActivity.findOne({
      where: { ExecutiveId },
    });

    if (!activity) return res.status(404).json({ message: "User not found" });

    activity.leadSectionVisits += 1;
    await activity.save();

    res.json({ message: "Lead section visit tracked", activity });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error tracking lead section visit", error });
  }
};

// ✅ Get All Executive Activity (Admin Dashboard)
exports.getAdminDashboard = async (req, res) => {
  try {
    const executives = await ExecutiveActivity.findAll();

    res.json({ executives });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admin dashboard data", error });
  }
};
