require("dotenv").config();
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

async function askVisaAgent(question) {
  try {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
           text: `You are an immigration expert at AtoZee Visas. Respond briefly and clearly in 3-5 sentences. Avoid unnecessary details. Answer this user question: ${question}`,
            },
          ],
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
