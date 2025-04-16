const { Op } = require("sequelize");
const { Notification } = require("../config/sequelize"); // Adjust path if needed

// Mark a specific notification as read
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.is_read = true;
    await notification.save();

    return res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a specific notification
const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Notification.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete notifications older than 3 months
const deleteOldNotifications = async (req, res) => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  try {
    const deleted = await Notification.destroy({
      where: {
        createdAt: {
          [Op.lt]: threeMonthsAgo,
        },
      },
    });

    return res.status(200).json({
      message: `${deleted} old notification(s) deleted`,
    });
  } catch (error) {
    console.error("Error deleting old notifications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getAllNotificationsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]], // Optional: latest first
    });

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  markAsRead,
  deleteNotification,
  deleteOldNotifications,
  getAllNotificationsByUser,
};
