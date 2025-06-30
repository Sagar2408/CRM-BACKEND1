const express = require('express');
const axios = require('axios');
const router = express.Router();

const BOT_ID = '15c92e13-1777-460f-992e-95a63d7b0749';
const CONVERSE_URL = `https://api.botpress.cloud/v1/bots/${BOT_ID}/converse`;

router.post('/chat', async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required' });
  }

  try {
    const response = await axios.post(`${CONVERSE_URL}/${userId}`, {
      type: 'text',
      text: message
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
