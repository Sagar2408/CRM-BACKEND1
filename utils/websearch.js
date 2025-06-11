const axios = require("axios");
const SERPAPI_KEY = process.env.SERPAPI_KEY;

async function searchWeb(query) {
  try {
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        q: query,
        api_key: SERPAPI_KEY,
        engine: "google",
      },
    });

    const organicResults = response.data.organic_results;
    const snippets = organicResults.slice(0, 3).map((r) => `- ${r.snippet}`).join("\n");

    return `Top results:\n${snippets}`;
  } catch (error) {
    console.error("Web search error:", error.response?.data || error.message);
    return "No live data available right now.";
  }
}

module.exports = searchWeb;
