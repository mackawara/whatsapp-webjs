require("dotenv").config();

const keywordAlert = require("./keywordsAlert");

//Helper Functions
const cronScheduler = require("./config/helperFunction/dailyCronScheduler");
const readFile = require("./config/helperFunction/readFile");
const timeDelay = (ms) => new Promise((res) => setTimeout(res, ms));

const uploadImage = require("./middleware/uploadImage");
const cloudinary = require("./middleware/cloudinary");

const todayDate = new Date().toISOString().slice(0, 10);
//Db models
const matchIDModel = require("./models/cricketMatchIds");
const contactModel = require("./models/contactsModel");

// APi calls
//football API
const callFootballApi = require("./config/helperFunction/callFootballApi");
// crikcet Api calls
//CIRCKET SCORES
const getMatchIds = require("./config/getMatchIds");
getMatchIds("upcoming", "League");

const getIds = require("./config/helperFunction/cricbuzz");
const getCommentary = require("./config/getCommentary");
//getCommentary("66197");

//update DB every morning on fixturs
const getFixtures = require("./config/helperFunction/getFixtures");
//cron jobs
//get day`s fixtures
//callFootballApi(2);

// connect to mongodb before running anything on the app

const connectDB = require("./config/database");
const { Client, LocalAuth, MessageMedia, id } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const path = require("path");

//contacts
const tate = process.env.TATENDA;
//groups
const hwangeClubCricket = process.env.HWANGECLUBDELACRICKET;
const liveSoccer1 = process.env.LIVESOCCER1;
const liveCricket1 = process.env.LIVECRICKET1;
const hwangeDealsgrp1 = process.env.HWANGEDEALSGRP1;

connectDB().then(async () => {
  const store = new MongoStore({ mongoose: mongoose });
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
  const me = process.env.ME;

  //const contactListForAds = require("./assets/contacts");
  //Messages
  const clientOn = require("./config/helperFunction/clientOn");

  let randomAdvert = () =>
    advertMessages[Math.floor(Math.random() * advertMessages.length)];

  const cron = require(`node-cron`);
  //client.setDisplayName("Live Soccer Score")
  let advertMessages = require("./adverts");
  clientOn(client, `message`);
  clientOn(client, "group-join");
  clientOn(client, "group-leave");

  client.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
  });

  client.on("authenticated", async (session) => {
    console.log(`client authenticated`);
  });
  //const europa = await getFixtures("europa");
  const contactListForAds = [hwangeDealsgrp1];
  async function sendAdverts() {
    const contact = "263775231426@c.us"; //contactListForAds[index];
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

  client.on("ready", async () => {
    let daysMatchIDs = [];
    let matchIdMessage = [];

    // getMatch Ids for the days then

    cronScheduler("*", "2,4,6,8", async () => {
      await getMatchIds("upcoming", "League");
      let startTimes = [];
      //  await getMatchIds("upcoming", "International");
      //await getMatchIds("upcoming", "Domestic");
      const cricketMatchesToday = await matchIDModel
        .find({
          date: new Date().toISOString().slice(0, 10),
        })
        .exec();
      await cricketMatchesToday.forEach((match) => {
        startTimes.push(
          match.unixTimeStamp
        )`${match.fixture}:${match.matchID} Starts at:${match.startingTime}\n`;
        daysMatchIDs.push(match.matchID);
      });
      firstkickOff = Math.min(startTimes.values());
    });

    const getHrsMins = require("./config/helperFunction/getHrsMins");
    let minutes = getHrsMins(firstkickOff - 1800000)[0];
    let hours = getHrsMins(firstkickOff - 180000)[1];
    cronScheduler(minutes, hours, () => {
      cronScheduler("*/6", "*", () => {
        client.sendMessage(liveCricket1, getCommentary(firstkickOff));
      });
    });
    // send Finished match updates
    let firstkickOff;
    cronScheduler("*", "8", async () => {
      await callFootballApi();
      let update = [];
      const epl = await getFixtures("epl", "Not Started");
      const laliga = await getFixtures("la liga", "Not Started");
      const zpsl = await getFixtures("zpsl", "Not Started");
      const ucl = await getFixtures("uefa", "Not Started");
      const europa = await getFixtures("europa", "Not Started");
      // get fixtures retuns an empty string if it does nt find fixturs that meet the criteria
      await update.push(epl, laliga, zpsl, ucl, europa);

      const upcoming = update.filter((league) => !league == "").join("\n");
      upcoming.length > 0
        ? client.sendMessage(liveSoccer1, upcoming)
        : console.log("Upcoming not started =" + upcoming);
    });
    cronScheduler("*", "14-23", async () => {
      await callFootballApi();
      let results = [];
      const epl = await getFixtures("epl", "Match Finished");
      const laliga = await getFixtures("la liga", "Match Finished");
      const zpsl = await getFixtures("zpsl", "Match Finished");
      const ucl = await getFixtures("uefa", "Match Finished");
      const europa = await getFixtures("europa", "Match Finished");
      // get fixtures retuns an empty string if it does nt find fixturs that meet the criteria
      results.push(epl, laliga, zpsl, ucl, europa);

      const finishedMatches = results
        .filter((league) => !league == "")
        .join("\n");
      finishedMatches.length > 0
        ? client.sendMessage(liveSoccer1, finishedMatches)
        : console.log("Finished matches =" + finishedMatches);
    });
    cronScheduler("*", "14-23", async () => {
      await callFootballApi();
      let update = [];
      const epl = await getFixtures("epl", "In Progress");
      const laliga = await getFixtures("la liga", "In Progress");
      const zpsl = await getFixtures("zpsl", "In Progress");
      const ucl = await getFixtures("uefa", "In Progress");
      const europa = await getFixtures("europa", "In Progress");
      if (!epl == "") {
        update.push(epl);
        console.log("No epl matches in progress");
      }
      if (!laliga == "") {
        update.push(laliga);
        console.log("No laliga matches in progress");
      }
      if (!zpsl == "") {
        update.push(zpsl);
        console.log("No zpsl matches in progress");
      }
      if (!ucl == "") {
        update.push(ucl);
        console.log("No ucl matches in progress");
      }
      if (!europa == "") {
        update.push(europa);
        console.log("No europ matches in progress");
      }
      let message = update.filter((result) => !result == "");

      if (update.length > 0) {
        await client.sendMessage(
          me,
          `*Live Soccer updates from EPL, ZPSL, Seire A,La Liga,UEFA champions League*`
        );
        await client.sendMessage(liveSoccer1, update.join("\n"));
        await client.sendMessage(
          me,
          `Join our facebook group for more exciting soccer new pics etc https://www.facebook.com/groups/623021429278159/`
        );
      } else {
        console.log("no updates");
      }
    });
    cronScheduler("5", "5,7,9,11,13,16", async () => {
      sendAdverts();
    });
    //  cronScheduler("*/6", "16-21", async () => {
    //  const ipl = await getCommentary(); //gets live commentary of games
    //client.sendMessage(liveCricket1, ipl);
    //});

    console.log("Client is ready!");
  });

  // client.sendMessage(me,uclFixtures)
  function toTime(UNIX_timestamp) {
    const a = new Date(UNIX_timestamp * 1000);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    const time =
      date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
    return time;
  }

  const qrcode = require("qrcode-terminal");

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log(qr);
  });
  const messages = require("./messages");
  //const getmatch = await getCommentary("66173");

  client.on(`message`, async (message) => {
    const messageContents = message.body;
    const author = message.from.replace("@c.us", "");
    const receiver = message.to.replace("@c.us", "").replace("263", "0");
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
          `${toTime(message.timestamp)}  at ${
            message.from
          } group :message from :${message.author
            .replace("@c.us", "")
            .replace("263", "0")}, ${message.notifyName} ${
            message.body
          } *message created by chatBot*`
        );
      }
    });

    let businessAlert = new keywordAlert(businessKeywords, client, message, me);
    businessAlert.keywordRun(message.body);
  });

  client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
  });
});
