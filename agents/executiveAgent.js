// 📁 File: agents/executiveAgent.js
require("dotenv").config();
const axios = require("axios");
const searchWeb = require("../utils/websearch");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

// Dynamically fetch latest CRS score from IRCC draw page
async function fetchLatestCrsFromWeb() {
  try {
    const response = await axios.get(
      "https://www.cic.gc.ca/english/express-entry/rounds.asp"
    );
    const html = response.data;

    const links = [
      ...html.matchAll(
        /<a href=\"(\/english\/express-entry\/rounds\/[^"]+)\"/g
      ),
    ];
    if (!links.length) return null;

    const latestUrl = `https://www.cic.gc.ca${links[0][1]}`;
    const page = await axios.get(latestUrl);
    const body = page.data;

    const dateMatch = body.match(/(\w+ \d{1,2}, \d{4})/);
    const crsMatch = body.match(/lowest score.*?(\d{3})/i);

    if (dateMatch && crsMatch) {
      return {
        drawDate: dateMatch[1],
        crs: parseInt(crsMatch[1]),
        url: latestUrl,
      };
    }
    return null;
  } catch (err) {
    console.error("❌ CRS web fetch failed:", err.message);
    return null;
  }
}

async function askExecutiveAgent(question, userId, db) {
  try {
    const ChatHistory = db.ChatHistory;

    const history = await ChatHistory.findAll({
      where: { userId, agentType: "executive" },
      order: [["createdAt", "ASC"]],
      limit: 10,
    });

    const historyMessages = history
      .map((msg) => `${msg.role === "user" ? "User" : "Agent"}: ${msg.message}`)
      .join("\n");

    const webData = await searchWeb(question);
    const truncatedWebData = webData.slice(0, 2000);

    const crsData = await fetchLatestCrsFromWeb();
    const crsSummary = crsData
      ? `As of ${crsData.drawDate}, the minimum CRS cutoff was ${crsData.crs}. (source: ${crsData.url})`
      : "No recent CRS data available.";

    const prompt = `You are an experienced immigration advisor at AtoZee Visas. 
Only answer questions related to immigration, briefly and professionally.

📜 Previous Chat:
${historyMessages}

📊 CRS Score Update:
${crsSummary}

🌐 Web Info:
${truncatedWebData}

---

Answer this question:
"${question}"

Format: Brief human-style immigration advice. Add a source note if info is from CRS data or web.`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const res = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    const reply =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    await ChatHistory.create({
      userId,
      role: "user",
      message: question,
      agentType: "executive",
    });
    await ChatHistory.create({
      userId,
      role: "assistant",
      message: reply,
      agentType: "executive",
    });

    return reply;
  } catch (err) {
    console.error("Executive Agent Error:", err.response?.data || err.message);
    return "Sorry, I couldn’t fetch an answer right now.";
  }
}

module.exports = askExecutiveAgent;
