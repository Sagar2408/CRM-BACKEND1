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
    // ✅ Combine date and time and parse as IST
    const istDateTime = moment.tz(
      `${date} ${time}`,
      "YYYY-MM-DD HH:mm:ss",
      "Asia/Kolkata"
    );

    // ✅ Subtract 2 minutes in IST
    const reminderTime = istDateTime.clone().subtract(2, "minutes").toDate();

    const message = `Reminder: Follow up with ${clientName} scheduled on ${date} at ${time}.`;

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
