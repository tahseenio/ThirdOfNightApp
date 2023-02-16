const puppeteer = require('puppeteer');
const fs = require('fs');
const express = require('express');
const path = require('path');
const open = require('open');

const startExpressServer = () => {
  const app = express();
  app.use(express.static('public'));

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
  });

  app.listen(8080);
  open('http://localhost:8080');
};

const writeToFile = (fajr, magrib) => {
  let data = {
    fajr: fajr,
    magrib: magrib,
  };
  fs.writeFileSync('public/scrapedData.json', JSON.stringify(data));
};

(async () => {
  const url = 'https://themasjidapp.net/hpmosque';

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36 Agency/97.8.6287.88',
  });

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const [fajr, magrib] = await page.evaluate(() => {
    let fajrResult = document
      .querySelector('.table')
      .getElementsByTagName('tr')[1]
      .getElementsByTagName('td')[0].innerHTML;
    let magribResult = document
      .querySelector('.table')
      .getElementsByTagName('tr')[1]
      .getElementsByTagName('td')[4].innerHTML;
    return [fajrResult, magribResult];
  });

  await browser.close();

  writeToFile(fajr, magrib);

  startExpressServer();
})();
