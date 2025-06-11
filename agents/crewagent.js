require("dotenv").config();
const axios = require("axios");
const searchWeb = require("../utils/websearch");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

async function askVisaAgent(question) {
  try {
    const webData = await searchWeb(question);
    console.log("🔍 Web Search Data:\n", webData);
    const prompt = `You are an immigration expert from AtoZee Visas.
You answer user queries briefly and clearly. You also have the following web data to help:

${webData}

Now answer this question in under 100 words:
"${question}"`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const res = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const reply =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    return reply;
  } catch (err) {
    console.error("Gemini AI Error:", err.response?.data || err.message);
    return "Sorry, the AI agent couldn't respond at the moment.";
  }
}

module.exports = askVisaAgent;
