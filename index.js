const connectDB = require("./config/database");
const getCommentary = require("./config/helperFunction/getCricComm");

require("dotenv").config();
// connect to mongodb before running anything on the app
connectDB().then(async () => {
  const { Client, LocalAuth } = require("whatsapp-web.js");

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      // executablePath: "/usr/bin/chromium-browser",
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

    client.setDisplayName("Live Scores,news, articles");
    // cron.schedule(`* * * * *`, async () => {
    // const getCricketHeadlines = require("./config/helperFunction/getCricComm");
    //getCricketHeadlines();
    //});
    const hwangeClubCricket = process.env.HWANGECLUBDELACRICKET;
    const liveSoccer1 = process.env.LIVESOCCER1;
    const liveCricket1 = process.env.LIVECRICKET1;
    const getMatchIds = require("./config/helperFunction/getMatchIds");
    await cron.schedule("29 2,6,8,9,12,15,18,21 * * *", async () => {
      await getMatchIds("upcoming", "League");
      await getMatchIds("upcoming", "International");
      await getMatchIds("recent", "International");
    });

    const matchIDModel = require("./models/matchIdModel");

    //find the day`s cricket matchs and save their match Ids to the DB
    const iplMatchesToday = await matchIDModel
      .find({
        date: new Date().toISOString().slice(0, 10),
        matchState: "live",
        seriesName: "Indian Premier League 2023",
      })
      .exec();
    //console.log(cricketMatchesToday);
    // loop through the matches and get commentary every 15 minutes
    iplMatchesToday.forEach(async (match) => {
      console.log("match in");
      // send live update for each game every 25 minutes
      cron.schedule(`*/2 * * * * `, async () => {
        client.sendMessage(liveSoccer1, await getCommentary(match.matchID));
      });
    });
    const intlMatchesToday = await matchIDModel
      .find({
        date: new Date().toISOString().slice(0, 10),
        matchState: "live",
        matchType: /ODI|Test|T20I/gi,
      })
      .exec();
    //console.log(cricketMatchesToday);
    // loop through the matches and get commentary every 15 minutes
    intlMatchesToday.forEach(async (match) => {
      console.log("match in");
      cron.schedule(`*/25 * * * * `, async () => {
        client.sendMessage(liveSoccer1, await getCommentary(match.matchID));
      });
    });

    await cron.schedule(`15 9,11,13,15,17,19 * * *`, async () => {
      let randomAdvert = () =>
        advertMessages[Math.floor(Math.random() * advertMessages.length)];

      let advertMessages = require("./adverts");
      //contacts
      const me = process.env.ME;
      //groups

      const hwangeDealsgrp1 = "263775932942-1555492418@g.us";
      const sellItHge4 = "263773389927-1588234038@g.us";
      const sellIthge = "263717766191-1583426999@g.us";
      const sellIthge2 = "263717766191-1583474819@g.us";
      const sellIthge5 = "263717766191-1611592932@g.us";
      const sellIthge3 = "263717766191-1584895535@g.us";
      const sellIthge6 = "263717766191-1616870613@g.us";
      const hwangeclassifieds = "263714496540-1579592614@g.us";
      const hwangeCitytraders = "263774750143-1590396559@g.us";
      const noCaptBusIdeas = "263783046858-1621225929@g.us";

      const contactListForAds = [
        hwangeDealsgrp1,
        sellIthge,
        sellIthge2,
        sellItHge4,
        hwangeCitytraders,
        hwangeclassifieds,
        sellIthge5,
        sellIthge6,
        sellIthge3,
        noCaptBusIdeas,
      ];

      const timeDelay = (ms) => new Promise((res) => setTimeout(res, ms));

      for (let i = 0; i < contactListForAds.length; i++) {
        try {
          client
            .sendMessage(contactListForAds[i], `${randomAdvert()}`)
            .catch((error) => {
              console.log(error);
            });
          await timeDelay(Math.floor(Math.random() * 10) * 1000); //causes a delay of anything between 1-10 secs between each message
        } catch (error) {
          console.log(error);
          client.sendMessage(
            me,
            `failed to send automatic message to ${contactListForAds[i]}`
          );
        }
      }
    });
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
