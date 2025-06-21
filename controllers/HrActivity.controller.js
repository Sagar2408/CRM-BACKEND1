const getTodayDate = () => new Date().toISOString().split("T")[0];

exports.startWork = async (req, res) => {
  try {
    const { hr_id } = req.body;
    const { HrActivity } = req.db;
    const today = getTodayDate();

    if (!hr_id) {
      return res.status(400).json({ message: "hr_id is required" });
    }

    let activity = await HrActivity.findOne({
      where: { hr_id, activityDate: today },
    });

    if (!activity) {
      activity = await HrActivity.create({
        hr_id,
        activityDate: today,
        workStartTime: new Date(),
      });
    } else if (!activity.workStartTime) {
      activity.workStartTime = new Date();
      await activity.save();
    }

    res.status(200).json({ message: "Work started", activity });
  } catch (error) {
    console.error("Start Work Error:", error);
    res.status(500).json({ message: "Error starting work session" });
  }
};

exports.stopWork = async (req, res) => {
  try {
    const { hr_id } = req.body;
    const { HrActivity } = req.db;
    const today = getTodayDate();

    if (!hr_id) {
      return res.status(400).json({ message: "hr_id is required" });
    }

    const activity = await HrActivity.findOne({
      where: { hr_id, activityDate: today },
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

    res.status(200).json({ message: "Work stopped", duration, activity });
  } catch (error) {
    console.error("Stop Work Error:", error);
    res.status(500).json({ message: "Error stopping work session" });
  }
};

exports.startBreak = async (req, res) => {
  try {
    const { hr_id } = req.body;
    const { HrActivity } = req.db;
    const today = getTodayDate();

    if (!hr_id) {
      return res.status(400).json({ message: "hr_id is required" });
    }

    const activity = await HrActivity.findOne({
      where: { hr_id, activityDate: today },
    });

    if (!activity) {
      return res.status(404).json({ message: "No activity found for today" });
    }

    activity.breakStartTime = new Date();
    await activity.save();

    res.status(200).json({ message: "Break started", activity });
  } catch (error) {
    console.error("Start Break Error:", error);
    res.status(500).json({ message: "Error starting break" });
  }
};

exports.stopBreak = async (req, res) => {
  try {
    const { hr_id } = req.body;
    const { HrActivity } = req.db;
    const today = getTodayDate();

    if (!hr_id) {
      return res.status(400).json({ message: "hr_id is required" });
    }

    const activity = await HrActivity.findOne({
      where: { hr_id, activityDate: today },
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
  } catch (error) {
    console.error("Stop Break Error:", error);
    res.status(500).json({ message: "Error stopping break" });
  }
};
