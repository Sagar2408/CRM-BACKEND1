const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://www.cic.gc.ca";
const MAIN_PAGE = `${BASE_URL}/english/express-entry/rounds.asp`;

async function fetchDrawLinks() {
  const res = await axios.get(MAIN_PAGE);
  const $ = cheerio.load(res.data);
  const links = [];

  $("ul.list-unstyled li a").each((i, el) => {
    const href = $(el).attr("href");
    if (href && href.startsWith("/english/express-entry/rounds/")) {
      links.push(BASE_URL + href);
    }
  });

  return links;
}

async function parseDrawPage(url) {
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const title = $("h1").first().text().trim();

    const dateMatch = title.match(/([A-Za-z]+ \d{1,2}, \d{4})/);
    const drawDate = dateMatch ? new Date(dateMatch[1]) : null;

    const text = $("body").text();
    const crsMatch = text.match(/lowest score.*?(\d{3})/i);
    const crs = crsMatch ? parseInt(crsMatch[1]) : null;

    if (drawDate && crs) {
      return {
        drawDate: drawDate.toISOString().split("T")[0],
        crs,
        url,
      };
    }

    return null;
  } catch (err) {
    console.error(`Error scraping ${url}`, err.message);
    return null;
  }
}

async function scrapeAll() {
  console.log("🔍 Scraping Express Entry Draw Links...");
  const links = await fetchDrawLinks();

  const results = [];
  for (const link of links) {
    const data = await parseDrawPage(link);
    if (data) {
      results.push(data);
    }
  }

  results.sort((a, b) => new Date(a.drawDate) - new Date(b.drawDate));

  const csv = ["Draw Date,CRS Cutoff,Source URL"]
    .concat(results.map((r) => `${r.drawDate},${r.crs},"${r.url}"`))
    .join("\n");

  const filePath = path.join(__dirname, "../data/express_entry_crs.csv");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csv);

  console.log(`✅ Saved CRS data to ${filePath}`);
}

scrapeAll();
