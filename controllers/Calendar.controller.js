require("dotenv").config();
const axios = require("axios");

const getCalendar = async (req, res) => {
  let { year, month } = req.query;

  const now = new Date();
  year = parseInt(year) || now.getFullYear();
  month = parseInt(month) || now.getMonth() + 1;

  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const calendarId = "en.indian%23holiday%40group.v.calendar.google.com";
  const apiKey = "AIzaSyB1AlxnO028EZAmZzNrhGT6Mje1XhJkhak"; // Safe to use public Google Calendar key

  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${startDate}&timeMax=${endDate}&singleEvents=true&orderBy=startTime`;

  try {
    const response = await axios.get(url);

    const holidays = response.data.items.map((item) => ({
      name: item.summary,
      date: item.start.date,
    }));

    const sundays = getAllSundays(year, month);

    const allEvents = [...holidays, ...sundays].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    res.json(allEvents);
  } catch (error) {
    console.error(
      "Error fetching holidays:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
};

module.exports = { getCalendar };
