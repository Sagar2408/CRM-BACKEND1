const scheduleFollowUpNotification = async (req, res) => {
  try {
    const {
      userId,
      clientName,
      date,
      time,
      targetRole = "executive",
    } = req.body;
    const FollowupNotification = req.db.FollowupNotification;

    if (!userId || !clientName || !date || !time) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const scheduledTime = new Date(`${date}T${time}`);
    const reminderTime = new Date(scheduledTime.getTime() - 2 * 60 * 1000); // minus 2 minutes

    const message = `Reminder: Follow up with ${clientName} for the scheduled follow up on ${date} at ${time}.`;

    const scheduled = await FollowupNotification.create({
      userId,
      message,
      remindAt: reminderTime,
      targetRole,
    });

    return res.status(201).json({
      message: "Follow-up notification scheduled.",
      scheduled,
    });
  } catch (error) {
    console.error("❌ Error scheduling notification:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { scheduleFollowUpNotification };
