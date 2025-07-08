const moment = require("moment-timezone");
const { Company } = require("../config/masterSequelize");
const { getTenantDB } = require("../config/sequelizeManager");
const { sendNotificationToUser } = require("../utils/notificationHelper");

async function scheduledNotifier() {
  const nowUTC = moment.utc();
  const windowStart = nowUTC.clone().subtract(30, "seconds").toDate();
  const windowEnd = nowUTC.clone().add(30, "seconds").toDate();

  const companies = await Company.findAll();

  for (const company of companies) {
    try {
      const db = await getTenantDB(company.id);
      const { ScheduledNotification, Notification } = db;

      const scheduledList = await ScheduledNotification.findAll({
        where: {
          remindAt: {
            [db.Sequelize.Op.between]: [windowStart, windowEnd],
          },
          is_sent: false,
        },
      });

      for (const item of scheduledList) {
        const notification = await Notification.create({
          userId: item.userId,
          message: item.message,
          targetRole: item.targetRole,
        });

        await sendNotificationToUser(
          item.userId,
          company.id,
          notification.toJSON()
        );

        item.is_sent = true;
        await item.save();

        console.log(`🔔 Notification sent to user ${item.userId}`);
      }
    } catch (err) {
      console.error(`❌ Error in ${company.name} notifier:`, err);
    }
  }
}

module.exports = scheduledNotifier;
