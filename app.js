// this is the starting point for the application.
const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const port = 3000;

async function getWikiPage(pageName) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://en.wikipedia.org/wiki/" + pageName, {
    waitUntil: "networkidle0",
  });
  const data = await page.evaluate(() => {
    return document.querySelector("*").outerHTML;
  });
  return data;
}

async function getPage(pageName) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setRequestInterception(true);

  page.on("request", (req) => {
    if (req.resourceType() == "stylesheet" || req.resourceType() == "font") {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(pageName, { waitUntil: "networkidle0" });
  const data = await page.evaluate(() => {
    return document.querySelector("body").innerHTML;
  });
  return data;
}

app.use(express.static("public"));

app.get("/formData", (req, res) => {
  getWikiPage(req.query.searchTerm).then((val) => {
    res.type("text/plain");
    res.send(val);
  });
});

app.get("/rawPage", (req, res) => {
  getPage(req.query.searchTerm).then((val) => {
    res.send(val);
  });
});

app.listen(port, () => {
  console.log(`App is listening on http://localhost:${port}`);
});
