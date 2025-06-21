const getTodayDate = () => new Date().toISOString().split("T")[0];

exports.startWork = async (req, res) => {
  try {
    const { process_person_id } = req.body;
    const { ProcessPersonActivity } = req.db;
    const today = getTodayDate();

    if (!process_person_id)
      return res.status(400).json({ message: "process_person_id is required" });

    let activity = await ProcessPersonActivity.findOne({
      where: { process_person_id, activityDate: today },
    });

    if (!activity) {
      activity = await ProcessPersonActivity.create({
        process_person_id,
        activityDate: today,
        workStartTime: new Date(),
        workTime: 0,
        breakTime: 0,
      });
    } else if (!activity.workStartTime) {
      activity.workStartTime = new Date();
      await activity.save();
    }

    res.json({ message: "Work session started", activity });
  } catch (error) {
    console.error("Start work error:", error);
    res.status(500).json({ message: "Error starting work session", error });
  }
};

exports.stopWork = async (req, res) => {
  try {
    const { process_person_id } = req.body;
    const { ProcessPersonActivity } = req.db;
    const today = getTodayDate();

    if (!process_person_id)
      return res.status(400).json({ message: "process_person_id is required" });

    const activity = await ProcessPersonActivity.findOne({
      where: { process_person_id, activityDate: today },
    });

    if (!activity || !activity.workStartTime)
      return res.status(400).json({ message: "Work session not started" });

    const workDuration = Math.floor(
      (new Date() - new Date(activity.workStartTime)) / 1000
    );

    activity.workTime += workDuration;
    activity.workStartTime = null;
    await activity.save();

    res.json({ message: "Work session stopped", workDuration, activity });
  } catch (error) {
    console.error("Stop work error:", error);
    res.status(500).json({ message: "Error stopping work session", error });
  }
};

exports.startBreak = async (req, res) => {
  try {
    const { process_person_id } = req.body;
    const { ProcessPersonActivity } = req.db;
    const today = getTodayDate();

    if (!process_person_id)
      return res.status(400).json({ message: "process_person_id is required" });

    const activity = await ProcessPersonActivity.findOne({
      where: { process_person_id, activityDate: today },
    });

    if (!activity)
      return res.status(400).json({ message: "No activity found for today" });

    activity.breakStartTime = new Date();
    await activity.save();

    res.json({ message: "Break started", activity });
  } catch (error) {
    console.error("Start break error:", error);
    res.status(500).json({ message: "Error starting break", error });
  }
};

exports.stopBreak = async (req, res) => {
  try {
    const { process_person_id } = req.body;
    const { ProcessPersonActivity } = req.db;
    const today = getTodayDate();

    if (!process_person_id)
      return res.status(400).json({ message: "process_person_id is required" });

    const activity = await ProcessPersonActivity.findOne({
      where: { process_person_id, activityDate: today },
    });

    if (!activity || !activity.breakStartTime)
      return res.status(400).json({ message: "Break not started" });

    const breakDuration = Math.floor(
      (new Date() - new Date(activity.breakStartTime)) / 1000
    );

    activity.breakTime += breakDuration;
    activity.breakStartTime = null;
    await activity.save();

    res.json({ message: "Break stopped", breakDuration, activity });
  } catch (error) {
    console.error("Stop break error:", error);
    res.status(500).json({ message: "Error stopping break", error });
  }
};
