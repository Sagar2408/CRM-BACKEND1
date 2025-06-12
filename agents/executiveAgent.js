// agents/executiveAgent.js
require("dotenv").config();
const axios = require("axios");
const searchWeb = require("../utils/websearch");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

async function askExecutiveAgent(question, userId, db) {
  try {
    const ChatHistory = db.ChatHistory;

    // Fetch previous messages
    const history = await ChatHistory.findAll({
      where: { userId, agentType: "executive" },
      order: [["createdAt", "ASC"]],
      limit: 10,
    });

    const historyMessages = history.map((msg) =>
      `${msg.role === "user" ? "User" : "Agent"}: ${msg.message}`
    ).join("\n");

    const webData = await searchWeb(question);
    console.log("🔍 Web Search Data:\n", webData);

const prompt = `You are an elite immigration advisor at AtoZee Visas, with years of experience helping clients navigate complex immigration pathways for Canada, Australia, the UK, and more.

You're now helping a user. You must always:

- 🕰️ Analyze their query in three parts: **past context**, **present status**, and **future guidance**
- 🌐 Use web search results to enhance the present/future part with updated insights
- 🤝 Emphasize how AtoZee Visas can personally help at each stage
- ⛔️ Reject non-immigration questions

If a question is not about immigration (e.g., tech, politics), say:
> "I can only help with immigration matters. Please ask about visas, permits, or travel-related legalities."

---

📜 Conversation History:
${historyMessages}

🌍 Web Knowledge:
${webData}

---

✳️ Now respond to this query:
"${question}"

Structure your answer as:
1. **What has been happening (Past context)**
2. **What is happening now (Current situation)**
3. **What should happen next (Future steps)**

Always keep the tone **experienced, helpful, and AtoZee-focused**.
`;



    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const res = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const reply =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";

    // Save history
    await ChatHistory.create({ userId, role: "user", message: question, agentType: "executive" });
    await ChatHistory.create({ userId, role: "assistant", message: reply, agentType: "executive" });

    return reply;
  } catch (err) {
    console.error("Gemini AI Error:", err.response?.data || err.message);
    return "Sorry, the executive AI agent couldn't respond.";
  }
}

module.exports = askExecutiveAgent;
