require("dotenv").config();
const axios = require("axios");
const searchWeb = require("../utils/websearch");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

async function askExecutiveAgent(question, userId, db) {
  try {
    const ChatHistory = db.ChatHistory;

    // 1️⃣ Load Chat History
    const history = await ChatHistory.findAll({
      where: { userId, agentType: "executive" },
      order: [["createdAt", "ASC"]],
      limit: 10,
    });

    const historyMessages = history
      .map((msg) => `${msg.role === "user" ? "User" : "Agent"}: ${msg.message}`)
      .join("\n");

    // 2️⃣ Search Web (with fallback)
    let webData = await searchWeb(question);

    // fallback if nothing was found
    if (!webData || webData.trim().toLowerCase().startsWith("no relevant")) {
      webData = `From https://www.cic.gc.ca:
You can find the most accurate and up-to-date immigration rules, CRS cutoff scores, visa updates, and draw details directly at https://www.cic.gc.ca/english/express-entry/rounds.asp

---`;
    }

    const truncatedWebData = webData.slice(0, 3000);
    console.log("✅ Truncated Web Data for Gemini:\n", truncatedWebData);

    // 3️⃣ Create Prompt
    const prompt = `You are an experienced senior immigration advisor at AtoZee Visas — a trusted firm known for helping clients successfully navigate immigration pathways to Canada, the UK, Australia, and more.

You speak clearly and professionally. Your tone is warm, human, and focused on giving **practical, up-to-date immigration advice**.

Your responsibilities:

✅ Answer only immigration-related questions  
✅ Speak as a real human expert — never say you're an AI  
✅ Keep answers brief (3–5 sentences max)  
✅ End by inviting the user to consult AtoZee Visas for help  
✅ For every fact you provide, show where it came from:
   - Use (source: chat history) for old conversation info  
   - Use (source: URL) for any data from websites

If the question is unrelated to immigration, respond:
> “I’m here to help only with immigration-related questions.”

---

📜 **Conversation History**:  
Use this for context. Cite as (source: chat history).

${historyMessages || "None."}

---

🌐 **Web Search Results** (grouped by source):  
Use these for up-to-date facts. Always cite like (source: URL).

${truncatedWebData}

---

Now respond to the user query:
"${question}"

Be confident, brief, and always cite the source of your information — either (source: chat history) or (source: URL). Offer to help via AtoZee Visas if appropriate.`;

    // 4️⃣ Gemini API Payload
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

    console.log("🤖 Gemini Raw Reply:\n", reply);

    // 5️⃣ Save Messages
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
    console.error("❌ Gemini AI Error:", err.response?.data || err.message);
    return "Sorry, the executive AI agent couldn't respond.";
  }
}

module.exports = askExecutiveAgent;
