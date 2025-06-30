// routes/botRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Your Botpress bot config
const BOT_ID = '15c92e13-1777-460f-992e-95a63d7b0749';
const MESSAGING_URL = 'https://messaging.botpress.cloud';

// Route to handle chat messages
router.post('/chat', async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required' });
  }

  try {
    const response = await axios.post(`${MESSAGING_URL}/v1/messages`, {
      botId: BOT_ID,
      conversationId: userId,
      payload: {
        type: 'text',
        text: message
      }
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
