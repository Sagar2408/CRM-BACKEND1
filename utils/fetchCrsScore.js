// utils/fetchCrsScore.js
const axios = require("axios");

async function fetchLatestCrsFromWeb() {
  try {
    const response = await axios.get(
      "https://www.cic.gc.ca/english/express-entry/rounds.asp"
    );
    const html = response.data;

    const links = [
      ...html.matchAll(/<a href="(\/english\/express-entry\/rounds\/[^"]+)"/g),
    ];
    if (!links.length) return null;

    const latestUrl = `https://www.cic.gc.ca${links[0][1]}`;
    const page = await axios.get(latestUrl);
    const body = page.data;

    const dateMatch = body.match(/(\w+ \d{1,2}, \d{4})/);
    const crsMatch = body.match(
      /lowest\s+(?:CRS\s+)?score\s+(?:to\s+receive\s+an\s+invitation\s+was\s+)?(\d{3})/i
    );

    if (dateMatch && crsMatch) {
      return {
        drawDate: dateMatch[1],
        crs: parseInt(crsMatch[1]),
        url: latestUrl,
      };
    }

    return null;
  } catch (err) {
    console.error("❌ Error fetching CRS:", err.message);
    return null;
  }
}

module.exports = fetchLatestCrsFromWeb;
