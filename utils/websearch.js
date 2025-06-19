// utils/websearch.js
const axios = require("axios");
const cheerio = require("cheerio");

async function searchWeb(query) {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      query
    )}&hl=en`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
    });

    const $ = cheerio.load(data);
    const links = [];

    $("a").each((i, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith("/url?q=")) {
        const url = href.split("/url?q=")[1].split("&")[0];
        if (
          !url.includes("google") &&
          !url.includes("youtube") &&
          !url.includes("facebook")
        ) {
          links.push(url);
        }
      }
    });

    const topLinks = links.slice(0, 2); // Only top 2
    let fullText = "";

    for (const url of topLinks) {
      try {
        const page = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
          },
        });

        const $page = cheerio.load(page.data);
        const text = $page("body").text().replace(/\s+/g, " ").slice(0, 2000); // clean & trim
        fullText += `🔗 Source: ${url}\n${text}\n\n---\n`;
      } catch (err) {
        console.warn(`❌ Failed to extract from ${url}: ${err.message}`);
      }
    }

    return fullText || "No usable immigration information found.";
  } catch (err) {
    console.error("Web scraping error:", err.message);
    return "Web data could not be fetched.";
  }
}

module.exports = searchWeb;
