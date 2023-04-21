const connectDB = require("./config/database");

require("dotenv").config();
// connect to mongodb before running anything on the app
connectDB().then(async () => {
  const { Client, LocalAuth } = require("whatsapp-web.js");

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      executablePath: "/usr/bin/chromium-browser",
      handleSIGINT: true,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disabled-setupid-sandbox",
        "--use-gl=egl",
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
    const getHrsMins = require("./config/helperFunction/getHrsMins");
    const timeConverter = require("./config/helperFunction/timeConverter");
    const cron = require("node-cron");

    //Db models
    const matchIDModel = require("./models/cricketMatchIds");

    // APi calls functions
    //football API
    const callFootballApi = require("./config/helperFunction/callFootballApi");
    const getCommentary = require("./config/getCommentary");

    //CIRCKET SCORES
    const getMatchIds = require("./config/getMatchIds");

    //database quieries
    const getFixtures = require("./config/helperFunction/getFixtures");

    clientOn(client, `message`);
    clientOn(client, "group-join");
    clientOn(client, "group-leave");

    //decalre variables that work with client here

    //contacts
    const me = process.env.ME;
    //groups
    const hwangeClubCricket = process.env.HWANGECLUBDELACRICKET;
    const liveSoccer1 = process.env.LIVESOCCER1;
    const liveCricket1 = process.env.LIVECRICKET1;
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

    client.on(`message`, async (message) => {
      const keywords = require("./keywords");
      const usdKeywords = keywords.usdKeyword;
      const businessKeywords = keywords.businessKeywords;

      usdKeywords.filter((keyword) => {
        if (
          message.body.includes(keyword) &&
          !message.body.includes(`message created by chatBot`)
        ) {
          client.sendMessage(
            me,
            `${timeConverter(message.timestamp)[0]}  at ${
              message.from
            } group :message from :${message.author
              .replace("@c.us", "")
              .replace("263", "0")}, ${message.notifyName} ${
              message.body
            } *message created by chatBot*`
          );
        }
      });

      const KeywordAlert = require("./keywordsAlert");
      let businessAlert = new KeywordAlert(
        businessKeywords,
        client,
        message,
        me
      );
      businessAlert.keywordRun(message.body);
    });
    client.setDisplayName("Live Scores,news, articles");
   
   
    let randomAdvert = () =>
      advertMessages[Math.floor(Math.random() * advertMessages.length)];

    let advertMessages = require("./adverts");
    async function sendAdverts() {
      for (let i = 0; i < contactListForAds.length; i++) {
        try {
          client
            .sendMessage(contactListForAds[i], `${randomAdvert()}`)
            .catch((error) => {
              console.log(error);
            });
          await timeDelay(5000);
        } catch (error) {
          console.log(error);
          client.sendMessage(
            me,
            `failed to send automatic message to ${contactListForAds[i]}`
          );
        }
      }
    }
    cron.schedule(`15 9,11,13,14,16,18 * * *`, () => sendAdverts());
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
