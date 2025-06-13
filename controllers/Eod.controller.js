

const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const cron = require('node-cron');

const scheduledReports = [];

const sendEmailNowDirect = async (email, content) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Scheduled EOD Report from AtoZee Visas',
      html: `<h3>EOD Report</h3><pre style="font-family: monospace; white-space: pre-wrap;">${content}</pre>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📤 Successfully sent report to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send to ${email}:`, error.message);
    throw error;
  }
};

const scheduleEodReport = async (req, res) => {
  const { email, content, startDate, endDate, time } = req.body;

  if (!email || !content || !startDate || !endDate || !time) {
    console.error("❌ Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  const now = moment().tz('Asia/Kolkata');
  const scheduledTime = moment.tz(`${endDate} ${time}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');

  const diffInMinutes = scheduledTime.diff(now, 'minutes');

  console.log("🕒 Current Time:", now.format('YYYY-MM-DD HH:mm'));
  console.log("📅 Scheduled Time:", scheduledTime.format('YYYY-MM-DD HH:mm'));
  console.log("🧮 Minute Diff:", diffInMinutes);

  if (diffInMinutes >= -1 && diffInMinutes <= 1) {
    // Send immediately
    try {
      await sendEmailNowDirect(email, content);
      return res.status(200).json({ message: "Report sent immediately (current time window)." });
    } catch (err) {
      return res.status(500).json({ error: "Failed to send email immediately." });
    }
  } else if (scheduledTime.isAfter(now)) {
    // Schedule for future
    scheduledReports.push({ email, content, startDate, endDate, time });
    console.log("✅ Report scheduled for later delivery.");
    return res.status(201).json({ message: "Report scheduled for future." });
  } else {
    // Time is too far in the past
    return res.status(400).json({ error: "Scheduled time is in the past." });
  }
};

cron.schedule('* * * * *', async () => {
  const now = moment().tz('Asia/Kolkata');
  const today = now.format('YYYY-MM-DD');
  const currentTime = now.format('HH:mm');

  for (const report of scheduledReports) {
    if (
      today >= report.startDate &&
      today <= report.endDate &&
      currentTime === report.time
    ) {
      try {
        await sendEmailNowDirect(report.email, report.content);
      } catch (error) {
        console.error(`❌ Failed to send to ${report.email}:`, error.message);
      }
    }
  }
});

module.exports = { scheduleEodReport };







// const nodemailer = require('nodemailer');

// const sendEodEmail = async (req, res) => {
//   const { email, content } = req.body;

//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS, // App password (keep secret)
//       },
//     });

//     const mailOptions = {
//       from: 'mathurchetanya1@gmail.com',
//       to: email,
//       subject: 'EOD Report from AtoZee Visas',
//       html: `
//         <h3>EOD Report</h3>
//         <pre style="font-family: monospace; white-space: pre-wrap;">${content}</pre>
//       `,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log("❌ Error sending email:", error);
//         return res.status(500).json({ status: 500, error: error.message });
//       } else {
//         console.log("✅ Email sent:", info.response);
//         return res.status(201).json({ message: "Email sent successfully" });
//       }
//     });

//   } catch (error) {
//     console.error("❌ Server error:", error);
//     res.status(500).json({ status: 500, error: error.message });
//   }
// };

// module.exports = { sendEodEmail };
