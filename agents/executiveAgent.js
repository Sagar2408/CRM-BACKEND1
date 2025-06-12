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
const prompt = `You are a highly experienced immigration advisor at AtoZee Visas.

Your job is to give **brief, to-the-point** answers that summarize:
- 🕰️ Past context
- 📌 Current situation
- 🔮 Future guidance

You ONLY answer **immigration-related** queries.

⛔️ If the question is not about immigration, reply with:
"I'm here to help only with immigration-related queries."

Use this structure:

1. **Past:** (1 short sentence)
2. **Present:** (1 short sentence)
3. **Future:** (1 short sentence)

Mention AtoZee Visas when relevant to help the user proceed confidently.

---

📜 Chat history:
${historyMessages}

🌍 Web info:
${webData}

---

Now answer:
"${question}"
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
