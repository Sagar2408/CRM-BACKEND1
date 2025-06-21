const getTodayDate = () => new Date().toISOString().split("T")[0];

exports.startWork = async (req, res) => {
  try {
    const { manager_id } = req.body;
    const { ManagerActivity } = req.db;
    const today = getTodayDate();

    if (!manager_id) {
      return res.status(400).json({ message: "manager_id is required" });
    }

    let activity = await ManagerActivity.findOne({
      where: { manager_id, activityDate: today },
    });

    if (!activity) {
      activity = await ManagerActivity.create({
        manager_id,
        activityDate: today,
        workStartTime: new Date(),
      });
    } else if (!activity.workStartTime) {
      activity.workStartTime = new Date();
      await activity.save();
    }

    res.status(200).json({ message: "Work started", activity });
  } catch (err) {
    console.error("Start Work Error:", err);
    res.status(500).json({ message: "Error starting work session" });
  }
};

exports.stopWork = async (req, res) => {
  try {
    const { manager_id } = req.body;
    const { ManagerActivity } = req.db;
    const today = getTodayDate();

    if (!manager_id) {
      return res.status(400).json({ message: "manager_id is required" });
    }

    const activity = await ManagerActivity.findOne({
      where: { manager_id, activityDate: today },
    });

    if (!activity || !activity.workStartTime) {
      return res.status(400).json({ message: "Work session not started" });
    }

    const duration = Math.floor(
      (new Date() - new Date(activity.workStartTime)) / 1000
    );

    activity.workTime += duration;
    activity.workStartTime = null;
    await activity.save();

    res
      .status(200)
      .json({ message: "Work session stopped", duration, activity });
  } catch (err) {
    console.error("Stop Work Error:", err);
    res.status(500).json({ message: "Error stopping work session" });
  }
};

exports.startBreak = async (req, res) => {
  try {
    const { manager_id } = req.body;
    const { ManagerActivity } = req.db;
    const today = getTodayDate();

    if (!manager_id) {
      return res.status(400).json({ message: "manager_id is required" });
    }

    const activity = await ManagerActivity.findOne({
      where: { manager_id, activityDate: today },
    });

    if (!activity) {
      return res.status(404).json({ message: "No activity found for today" });
    }

    activity.breakStartTime = new Date();
    await activity.save();

    res.status(200).json({ message: "Break started", activity });
  } catch (err) {
    console.error("Start Break Error:", err);
    res.status(500).json({ message: "Error starting break" });
  }
};

exports.stopBreak = async (req, res) => {
  try {
    const { manager_id } = req.body;
    const { ManagerActivity } = req.db;
    const today = getTodayDate();

    if (!manager_id) {
      return res.status(400).json({ message: "manager_id is required" });
    }

    const activity = await ManagerActivity.findOne({
      where: { manager_id, activityDate: today },
    });

    if (!activity || !activity.breakStartTime) {
      return res.status(400).json({ message: "Break not started" });
    }

    const duration = Math.floor(
      (new Date() - new Date(activity.breakStartTime)) / 1000
    );

    activity.breakTime += duration;
    activity.breakStartTime = null;
    await activity.save();

    res.status(200).json({ message: "Break stopped", duration, activity });
  } catch (err) {
    console.error("Stop Break Error:", err);
    res.status(500).json({ message: "Error stopping break" });
  }
};
