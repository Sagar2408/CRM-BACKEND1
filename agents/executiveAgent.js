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

    const historyMessages = history
      .map((msg) => `${msg.role === "user" ? "User" : "Agent"}: ${msg.message}`)
      .join("\n");

    const webData = await searchWeb(question);
    const truncatedWebData = webData.slice(0, 3000); // Limit content length
    console.log("🔍 Web Search Data:\n", truncatedWebData);

    const prompt = `You are an experienced senior immigration advisor at AtoZee Visas — a trusted firm known for helping clients successfully navigate immigration pathways to Canada, the UK, Australia, and more.

You speak with clarity, confidence, and professionalism. Your tone is warm, helpful, and focused on **actionable immigration advice**.

Your job is to:

✅ Answer only immigration-related questions  
✅ Speak as a **human expert**, not an AI  
✅ Keep answers **brief** (max 3–5 sentences)  
✅ Gently **guide users to work with AtoZee Visas** for personalized help

If the question is unrelated to immigration (e.g., tech, politics), respond:
> “I’m here to help only with immigration-related questions.”

Use the following to guide your answer:

📜 **Conversation History**:
${historyMessages}

🌐 **Recent Immigration Info from Web** (auto-extracted from public websites — may not be 100% verified):
${truncatedWebData}

---

Now respond to this user query:
"${question}"

Be clear, professional, and sound like a real AtoZee advisor who genuinely wants to help.
`;

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
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const reply =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    // Save history
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
    console.error("Gemini AI Error:", err.response?.data || err.message);
    return "Sorry, the executive AI agent couldn't respond.";
  }
}

module.exports = askExecutiveAgent;
