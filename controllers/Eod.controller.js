const nodemailer = require("nodemailer");
const cron = require("node-cron");

exports.scheduleEodReport = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password (keep secret)
      },
    });

    const mailOptions = {
      from: "mathurchetanya1@gmail.com",
      to: email,
      subject: "EOD Report from AtoZee Visas",
      html: `
        <h3>EOD Report</h3>
        <pre style="font-family: monospace; white-space: pre-wrap;">${content}</pre>
      `,
    };
    console.log("📧 Sending email to:", email);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ Error sending email:", error);
        return res.status(500).json({ status: 500, error: error.message });
      } else {
        console.log("✅ Email sent:", info.response);
        return res.status(201).json({ message: "Email sent successfully" });
      }
    });
    const {
      executiveId,
      executiveName,
      email,
      fields,
      startDate,
      endDate,
      time,
    } = req.body;

    if (
      !executiveId ||
      !executiveName ||
      !email ||
      !Array.isArray(fields) ||
      !startDate ||
      !endDate ||
      !time
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const [hour, minute] = time.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute)) {
      return res.status(400).json({ message: "Invalid time format." });
    }

    const { ExecutiveActivity, Meeting } = req.db;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const cronExpression = `${minute} ${hour} * * *`;

    cron.schedule(cronExpression, async () => {
      try {
        const today = new Date();
        const todayDateOnly = today.toISOString().split("T")[0];
        const current = new Date(todayDateOnly);

        if (current < start || current > end) {
          console.log(
            `Skipped report: ${todayDateOnly} is outside the selected range.`
          );
          return;
        }

        let freshReportData = {};

        // Fetch activity for today
        if (
          fields.includes("leadVisits") ||
          fields.includes("executiveActivity")
        ) {
          const activities = await ExecutiveActivity.findAll({
            where: {
              ExecutiveId: executiveId,
              activityDate: todayDateOnly,
            },
          });

          if (activities.length > 0) {
            let totalLeadVisits = 0;
            let totalWorkTime = 0;
            let totalBreakTime = 0;
            let totalCallTime = 0;

            activities.forEach((activity) => {
              if (fields.includes("leadVisits")) {
                totalLeadVisits += activity.leadSectionVisits || 0;
              }
              if (fields.includes("executiveActivity")) {
                totalWorkTime += activity.workTime || 0;
                totalBreakTime += activity.breakTime || 0;
                totalCallTime += activity.dailyCallTime || 0;
              }
            });

            if (fields.includes("leadVisits")) {
              freshReportData.leadVisits = totalLeadVisits;
            }

            if (fields.includes("executiveActivity")) {
              freshReportData.executiveActivity = {
                workTime: totalWorkTime,
                breakTime: totalBreakTime,
                dailyCallTime: totalCallTime,
              };
            }
          } else {
            freshReportData.activityMessage =
              "No activity data found for today.";
          }
        }

        // Fetch all-time meeting count
        if (fields.includes("meeting")) {
          const meetingCount = await Meeting.count({
            where: { executiveId },
          });
          freshReportData.meetingCount = meetingCount;
        }

        const emailContent = formatReport(freshReportData, executiveName);

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: `Executive Report for ${executiveName} on ${todayDateOnly}`,
          html: emailContent,
        });

        console.log(`Report sent to ${email} for ${todayDateOnly}`);
      } catch (error) {
        console.error("Error sending daily executive report:", error);
      }
    });

    return res.status(200).json({
      message: "Daily report scheduled successfully between given date range.",
    });
  } catch (error) {
    console.error("Error scheduling executive report:", error);
    return res.status(500).json({ message: "Failed to schedule report." });
  }
};

// Format email HTML
function formatReport(data, executiveName) {
  let html = `<h2>Executive Report for ${executiveName}</h2>
         <h3>Executive Activity summary for today</h3><ul>`;

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  if ("leadVisits" in data) {
    html += `<li><strong>Lead Section Visits:</strong> ${data.leadVisits}</li>`;
  }

  if ("executiveActivity" in data) {
    const { workTime, breakTime, dailyCallTime } = data.executiveActivity;
    html += `<li><strong>Work Time:</strong> ${formatDuration(workTime)}</li>`;
    html += `<li><strong>Break Time:</strong> ${formatDuration(
      breakTime
    )}</li>`;
    html += `<li><strong>Daily Call Time:</strong> ${formatDuration(
      dailyCallTime
    )}</li>`;
  }

  if ("meetingCount" in data) {
    html += `<li><strong>Total Meetings Scheduled:</strong> ${data.meetingCount}</li>`;
  }

  if (data.activityMessage) {
    html += `<li><i>${data.activityMessage}</i></li>`;
  }

  html += `</ul>`;
  return html;
}
