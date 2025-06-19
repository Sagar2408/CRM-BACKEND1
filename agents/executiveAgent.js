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

    You speak clearly and professionally. Your tone is warm, human, and focused on giving **practical, up-to-date immigration advice**.
    
    Your responsibilities:
    
    ✅ Answer only immigration-related questions  
    ✅ Speak as a real human expert — never say you're an AI  
    ✅ Keep answers brief (3–5 sentences max)  
    ✅ End by inviting the user to consult AtoZee Visas for help  
    ✅ For every fact you provide, show where it came from:
       - Use **(source: chat history)** if it came from prior messages  
       - Use **(source: URL)** if it came from a website
    
    If the question is not about immigration, respond:
    > “I’m here to help only with immigration-related questions.”
    
    ---
    
    📜 **Conversation History**:  
    Use this for context. Cite as (source: chat history) if you refer to anything below.
    
    ${historyMessages || "None."}
    
    ---
    
    🌐 **Web Search Results** (auto-extracted from immigration websites):  
    Use these for factual answers. Cite each website directly when used (e.g., source: https://www.cic.gc.ca).
    
    ${truncatedWebData || "No relevant web content was found for this query."}
    
    ---
    
    Now answer this user question:
    "${question}"
    
    Write clearly and confidently. Be brief. For each fact you provide, **show where it came from**: either (source: chat history) or (source: URL). Wrap up by offering AtoZee Visas for personalized help.`;

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
