const moment = require("moment");
const { Company } = require("../config/masterSequelize");
const { getTenantDB } = require("../config/sequelizeManager");
const { sendNotificationToUser } = require("../server"); // adjust path if needed

async function notifyUpcomingMeetings() {
  const now = moment();
  const notifyWindow = now.clone().add(2, "minutes");

  const companies = await Company.findAll(); // get all companies

  for (const company of companies) {
    try {
      const db = await getTenantDB(company.id);
      const { Meeting } = db;

      const meetings = await Meeting.findAll({
        where: {
          startTime: {
            [db.Sequelize.Op.between]: [
              notifyWindow.clone().startOf("minute").toDate(),
              notifyWindow.clone().endOf("minute").toDate(),
            ],
          },
          notified: false,
        },
      });

      for (const meeting of meetings) {
        // Store DB notification
        await db.Notification.create({
          userId: meeting.executiveId,
          message: `⏰ Reminder: Meeting with ${meeting.clientName} at ${moment(meeting.startTime).format("HH:mm")}`,
          targetRole: "executive",
        });

        // Real-time notification
        await sendNotificationToUser(meeting.executiveId, company.id, {
          userId: meeting.executiveId,
          targetRole: "executive",
          message: `⏰ Reminder: Meeting with ${meeting.clientName} at ${moment(meeting.startTime).format("HH:mm")}`,
        });

        // Mark as notified
        meeting.notified = true;
        await meeting.save();
      }
    } catch (err) {
      console.error(`❌ Error processing company ${company.name}:`, err.message);
    }
  }
}

module.exports = notifyUpcomingMeetings;
