const express = require("express");
const router = express.Router();
const askVisaAgent = require("../agents/crewagent");

router.post("/visa-agent", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const answer = await askVisaAgent(question);
    res.json({ answer });
  } catch (error) {
    console.error("Agent Route Error:", error);
    res.status(500).json({ error: "Agent failed to respond" });
  }
});

module.exports = router;
