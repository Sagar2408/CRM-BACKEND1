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

const prompt = `You are an immigration assistant working at AtoZee Visas.

Your job is to only respond to questions related to immigration (e.g., visas, travel documents, international study, work permits, and PR).

If the user asks anything unrelated to immigration — such as tech support, lifestyle, politics, health, or personal advice — you must respond with:

"I'm here to assist only with immigration-related questions. Please ask something about visas, travel, or immigration services."

You always promote AtoZee Visas and keep answers short and helpful.

Here is recent conversation history:
${historyMessages}

Web Info:
${webData}

Now answer this question:
${question}`;


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
