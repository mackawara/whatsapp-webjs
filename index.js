const connectDB = require("./config/database");
const getCommentary = require("./config/helperFunction/getCricComm");

require("dotenv").config();
// connect to mongodb before running anything on the app
connectDB().then(async () => {
  const { Client, LocalAuth } = require("whatsapp-web.js");

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      //  executablePath: "/usr/bin/chromium-browser",
      handleSIGINT: true,
      headless: true,
      args: [
        "--log-level=3", // fatal only
        "--start-maximized",
        "--no-default-browser-check",
        "--disable-infobars",
        "--disable-web-security",
        "--disable-site-isolation-trials",
        "--no-experiments",
        "--ignore-gpu-blacklist",
        "--ignore-certificate-errors",
        "--ignore-certificate-errors-spki-list",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-default-apps",
        "--enable-features=NetworkService",
        "--disable-setuid-sandbox",
        "--no-sandbox",
      ],
    },
  });

  client.initialize();

  //messaging client resources
  const clientOn = require("./config/helperFunction/clientOn");

  //client
  clientOn(client, "authenticated");
  clientOn(client, "auth_failure");
  clientOn(client, "qr");
  client.on("ready", async () => {
    //functions abd resources
    //Helper Functions

    const cron = require("node-cron");

    //Db models

    clientOn(client, `message`);
    clientOn(client, "group-join");
    clientOn(client, "group-leave");

    //decalre variables that work with client here

    client.setDisplayName("Live Sport Scores,news, articles");
    // cron.schedule(`* * * * *`, async () => {
    // const getCricketHeadlines = require("./config/helperFunction/getCricComm");
    //getCricketHeadlines();
    //});
    const hwangeClubCricket = process.env.HWANGECLUBDELACRICKET;
    const liveSoccer1 = process.env.LIVESOCCER1;
    const liveCricket1 = process.env.LIVECRICKET1;
    //database collections
    const matchIDModel = require("./models/matchIdModel");

    //helper Functions
    const getMatchIds = require("./config/helperFunction/getMatchIds");
    const updateFootballDb = require("./config/helperFunction/updateFootballDb");
    //get the first match of the day

    await cron.schedule("0 2 * * *", async () => {
      await updateFootballDB();
      const allFootballMatchesToday = await matchIDModel.find({
        date: new Date().toISOString().slice(0, 10),
      });
      const startTimes = [];
      allFootballMatchesToday.forEach(async (match) => {
        startingTimes.push(match.unixTimeStamp);
      });
      const firstKickOff = new Date(parseInt(Math.min(...startTimes))),
        hours = firstKickOff.getHours(),
        mins = firstKickOff.getMinutes();
      // run Live updates form such a time as the first game kickoffs
      await cron.schedule(`${mins} ${hours}-23 Mon-Fri * *`, async () => {
        await cron.schedule("*/5 * * * *", async () => {
          // run every six minutes from 13horus to 23hrs
          await callFootballApi(); // update the db first
          const groupLink = ``;
          let update = [groupLink];
          const epl = await getFixtures("epl", "In Progress");
          const laliga = await getFixtures("la liga", "In Progress");
          const zpsl = await getFixtures("zpsl", "In Progress");
          const ucl = await getFixtures("uefa", "In Progress");
          const europa = await getFixtures("europa", "In Progress");
          if (!epl == "") {
            update.push(epl);
          }
          if (!laliga == "") {
            update.push(laliga);
          }
          if (!zpsl == "") {
            update.push(zpsl);
          }
          if (!ucl == "") {
            update.push(ucl);
          }
          if (!europa == "") {
            update.push(europa);
          }
          //  let message = update.filter((result) => !result == "");

          if (update.length > 0) {
            await client.sendMessage(liveSoccer1, update.join("\n"));
          } else {
            console.log("no updates");
          }
        });
      });
    });

  //  await cron.schedule("29 2,8,14 * * *", async () => {
  //    await getMatchIds("upcoming");
  //    await getMatchIds("recent");
  //    const completedMatches = await matchIDModel.find({
  //      date: new Date().toISOString().slice(0, 10),
  //      matchState: /complete/gi,
  //    });
  //    completedMatches.forEach(async (match) => {
  //      const commentary = await getCommentary(match.matchID);
  //      client.sendMessage(liveSoccer1, commentary);
  //    });
  //    const upcoming = await matchIDModel({
  //      date: new Date().toISOString().slice(0, 10),
  //      matchState: /upcoming|preview/gi,
  //    });
   //   upcoming.forEach(async (match) => {
    //    const commentary = await getCommentary(match.matchID);
    //    client.sendMessage(liveSoccer1, commentary);
    //    const startHour = new Date(parseInt(match.unixTimeStamp)).getHours();
   //     cron.schedule(`0 ${startHour} * * *`, async () => {
    //      do {} while (match); // as long as match s on progress
    //    });
    //  });
    //});
    const timeDelay = (ms) => new Promise((res) => setTimeout(res, ms));
    //find the day`s cricket matchs and save their match Ids to the DB

    //  cron.schedule("*/6", "16-21", async () => {
    //  const ipl = await getCommentary(); //gets live commentary of games
    //client.sendMessage(liveCricket1, ipl);
    //});

    console.log("Client is ready!");
  });

  client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
  });
});
