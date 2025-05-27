const moment = require("moment-timezone");
const { Company } = require("../config/masterSequelize");
const { getTenantDB } = require("../config/sequelizeManager");
const { sendNotificationToUser } = require("../utils/notificationHelper");

async function notifyUpcomingMeetings() {
  const nowUTC = moment.utc(); // always use UTC
  const targetTimeUTC = nowUTC.clone().add(2, "minutes");

  const windowStart = targetTimeUTC.clone().subtract(30, "seconds").toDate();
  const windowEnd = targetTimeUTC.clone().add(30, "seconds").toDate();

  console.log(`\n🔔 [NOTIFIER] UTC Time: ${nowUTC.format("HH:mm:ss")} | IST: ${nowUTC.tz("Asia/Kolkata").format("hh:mm:ss A")}`);
  console.log(`📆 Target window UTC: ${moment(windowStart).format("HH:mm:ss")} - ${moment(windowEnd).format("HH:mm:ss")}`);
  console.log(`📆 Target window IST: ${moment(windowStart).tz("Asia/Kolkata").format("hh:mm:ss A")} - ${moment(windowEnd).tz("Asia/Kolkata").format("hh:mm:ss A")}`);

  const companies = await Company.findAll();

  for (const company of companies) {
    try {
      const db = await getTenantDB(company.id);
      const { Meeting, Notification } = db;

      const meetings = await Meeting.findAll({
        where: {
          startTime: {
            [db.Sequelize.Op.between]: [windowStart, windowEnd],
          },
          notified: false,
        },
      });

      console.log(`📁 [${company.name}] Found ${meetings.length} meeting(s)`);

      for (const meeting of meetings) {
        const timeIST = moment(meeting.startTime).tz("Asia/Kolkata").format("hh:mm A");
        const message = `⏰ Reminder: Meeting with ${meeting.clientName} at ${timeIST}`;

        // Save to DB
        const notification = await Notification.create({
          userId: meeting.executiveId,
          message,
          targetRole: "executive",
        });

        // Send real-time if connected
        await sendNotificationToUser(meeting.executiveId, company.id, {
          ...notification.toJSON(),
        });

        meeting.notified = true;
        await meeting.save();

        console.log(`✅ Notified executive ${meeting.executiveId} for ${timeIST}`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${company.name}: ${err.message}`);
    }
  }
}

module.exports = notifyUpcomingMeetings;
