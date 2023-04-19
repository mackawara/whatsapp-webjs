require("dotenv").config();

const keywordAlert = require("./keywordsAlert");

//Helper Functions

const readFile = require("./config/helperFunction/readFile");
const timeDelay = (ms) => new Promise((res) => setTimeout(res, ms));
const cron = require("node-cron");
const uploadImage = require("./middleware/uploadImage");
const cloudinary = require("./middleware/cloudinary");

const todayDate = new Date().toISOString().slice(0, 10);
//Db models
const matchIDModel = require("./models/cricketMatchIds");
const contactModel = require("./models/contactsModel");

// APi calls functions
//football API
const callFootballApi = require("./config/helperFunction/callFootballApi");
const getCommentary = require("./config/getCommentary");

//CIRCKET SCORES
const getMatchIds = require("./config/getMatchIds");

//database quieries
const getFixtures = require("./config/helperFunction/getFixtures");
// connect to mongodb before running anything on the app

const connectDB = require("./config/database");
const { Client, LocalAuth, MessageMedia, id } = require("whatsapp-web.js");
const mongoose = require("mongoose");
const { schedule } = require("node-cron");
const { exit } = require("process");

//contacts
const tate = process.env.TATENDA;
const me = process.env.ME;
//groups
const hwangeClubCricket = process.env.HWANGECLUBDELACRICKET;
const liveSoccer1 = process.env.LIVESOCCER1;
const liveCricket1 = process.env.LIVECRICKET1;
const hwangeDealsgrp1 = "263775932942-1555492418@g.us";
const sellItHge4 = "263773389927-1588234038@g.us";
const sellIthge = "263717766191-1583426999@g.us";
const sellIthge2 = "263717766191-1583474819@g.us";
const hwangeclassifieds = "263714496540-1579592614@g.us";
const hwangeCitytraders = "263774750143-1590396559@g.us";

connectDB().then(async () => {
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
  clientOn(client, `message`);
  clientOn(client, "group-join");
  clientOn(client, "group-leave");
  clientOn(client, "authenticated");
  clientOn(client, "auth_failure");
  clientOn(client, "qr");

  let randomAdvert = () =>
    advertMessages[Math.floor(Math.random() * advertMessages.length)];

  let advertMessages = require("./adverts");
  //client

  const contactListForAds = [
    hwangeDealsgrp1,
    sellIthge,
    sellIthge2,
    sellItHge4,
    hwangeCitytraders,
    hwangeclassifieds,
  ];
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
    client.setDisplayName("Live Scores,news, articles");
    let daysMatchIDs = [];
    let matchIdMessage = [];
    //Call cricbuzz api and save stating times andnmatchids to the Db
    let firstkickOff;

    await cron.schedule(
      "30 2,17,23 * * *",
      async () => {
        console.log("cricket running");
        await getMatchIds("upcoming", "League");
        await getMatchIds("upcoming", "International");
        // await getMatchIds("upcoming", "Domestic");
        let startTimes = [];
        //find the day`s cricket matchs and save their match Ids to the DB
        const cricketMatchesToday = await matchIDModel
          .find({
            date: new Date().toISOString().slice(0, 10),
          })
          .exec();
        // loop through the matches and get commentary every 15 minutes
        cricketMatchesToday.forEach(async (match) => {
          // client.sendMessage(liveCricket1, getCommentary(match.matchID));
          const getHrsMins = require("./config/helperFunction/getHrsMins");
          let minutes = getHrsMins(match.unixTimeStamp)[0];
          let hours = getHrsMins(match.unixTimeStamp)[1];
          await cron.schedule(`${minutes} ${hours} * * *`, () => {
            // if match is finished , only send
            if (!/match finished/gi.test(match.matchID)) {
              cron.schedule(`0 */2 * * *`, () => {
                //("*", `${hours + 4}-23`, () => {
                client.sendMessage(liveCricket1, getCommentary(match.matchID));
              });
            } else {
              // send live update for each game every 15minutes
              cron.schedule(`*/15 * * * * `, () => {
                client.sendMessage(liveCricket1, getCommentary(match.matchID));
              });
            }
          });
        });
      },
      { scheduled: true, timezone: `Africa/Harare` }
    );

    // get days matches at 0800
    cron.schedule(
      `5 8,12,16,20 * * *`,
      async () => {
        //await callFootballApi();
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
      },
      { scheduled: true, timezone: `Africa/Harare` }
    );
    cron.schedule(
      `10 14-23/2 * * *`,
      async () => {
        // run every hour after 1400hrs
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
      },
      { scheduled: true, timezone: `Africa/Harare` }
    );
    //every six minutes
    cron.schedule(
      "*/6 13-23 * * *",
      async () => {
        // run every six minutes from 13horus to 23hrs
        await callFootballApi(); // update the db first
        let update = [];
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
        let message = update.filter((result) => !result == "");

        if (update.length > 0) {
          await client.sendMessage(liveSoccer1, update.join("\n"));
          await client.sendMessage(
            liveSoccer1,
            `Join our facebook group for more exciting soccer new pics etc https://www.facebook.com/groups/623021429278159/`
          );
        } else {
          console.log("no updates");
        }
      },
      { scheduled: true, timezone: `Africa/Harare` }
    );
    cron.schedule(`15 9,11,13,14,16,18 * * *`, () => sendAdverts(), {
      scheduled: true,
      timezone: `Africa/Harare`,
    });
    //  cron.schedule("*/6", "16-21", async () => {
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
