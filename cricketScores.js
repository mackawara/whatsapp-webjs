const nodemon = require("nodemon");
const puppeteer = require("puppeteer");

async function getCricketScore(matchNumber) {
  console.log(matchNumber);
  console.log(" scrap started");
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(300000);
  try {
    console.time(`scrap`);
    await page.goto("https://www.cricbuzz.com/cricket-match/live-scores");
    const matchScore = matchNumber;

    //#header-wrapper > div.container.d-none.d-lg-block > div > div > div > div

    const scores = await page.evaluate((matchScore) => {
      const evalVal = `#page-wrapper > div:nth-child(6) > div.cb-col.cb-col-67.cb-scrd-lft-col > div > div:nth-child(${matchScore}) > div > div:nth-child(2) > a`;
      console.log(matchScore, ` evaluate started `);
      //   const scoresSelector=`#header-wrapper > div.container.d-block.d-lg-none.mobile-leagues-container > div > div > div > div > div > div > div:nth-child(4) > div > a > div > div`
      return Array.from(document.querySelectorAll(evalVal)).map(
        (score) => score.textContent
      );
    }, matchScore);
    console.log(scores.toString());
    console.timeEnd(`scrap`);

    return scores;
  } catch {
    //console.timeEnd(`scrap`)
    return ` sorry scores unavailable at the moment`;
  }
  return scores;
}

//const startTime = performance.now()
module.exports = getCricketScore;
