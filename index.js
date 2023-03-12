require("dotenv").config();

const keywordAlert = require("./keywordsAlert");
const express = require("express");
const app = express();
const port = process.env.PORT || 6000;
const chatBot = require("./middleware/chatbot");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const uploadImage = require("./middleware/uploadImage");
const cloudinary = require("./middleware/cloudinary");
//cron
const cronScheduler = require("./config/helperFunction/cronScheduler");

// APi calls
//football API
const callFootballApi = require("./config/helperFunction/callFootballApi");
//update DB every morning on fixturs
const getFixtures = require("./config/helperFunction/getFixtures");
cronScheduler(43, 9, getFixtures("la liga"));
cronScheduler(44, 9, getFixtures("Serie a"));
cronScheduler(45, 9, getFixtures("epl"));
//callFootballApi(2);

// connect to mongodb
const connectDB = require("./config/database");
const { Client, LocalAuth, MessageMedia, id } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const path = require("path");
// Require database
const DB_STRING = process.env.DB_STRING;
//connect to db then execute all functions
connectDB().then(async () => {
  const store = new MongoStore({ mongoose: mongoose });
  const client = new Client({
    authStrategy: new LocalAuth(),
    /* store: store,
      backupSyncIntervalMs: 60000, */
    // clientId:id,
    // dataPath:"./session.json"

    puppeteer: {
      handleSIGINT: true,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disabled-setupid-sandbox",
      ],
    },
  });

  client.initialize();
  const me = process.env.ME;
  //GROUPS

  //const contactListForAds = require("./assets/contacts");
  //Messages
  const clientOnMessage = require("./config/helperFunction/clientOnmessage");

  const uclFixtures = await getFixtures("ucl");

  console.log(uclFixtures);
  let randomAdvert = () =>
    advertMessages[Math.floor(Math.random() * advertMessages.length)];
  //CIRCKET SCORES
  const getLiveMatches = require("./config/getLiveMatches");
  //getLiveMatches()

  const cron = require(`node-cron`);

  // Path where the session data will be stored
  //const SESSION_FILE_PATH = store;

  //messages
  const cloudinary = require("./middleware/cloudinary");
  const wifiHotSpot = MessageMedia.fromUrl(
    "https://res.cloudinary.com/df94bonis/image/upload/v1677776762/pigc81xnml3acqaj7zv9.png"
  );
  const compRepairs = MessageMedia.fromUrl(
    "https://res.cloudinary.com/df94bonis/image/upload/v1677776283/myowemkgypift0lldq5z.png"
  );
  const cctvImage = await MessageMedia.fromUrl(
    "https://res.cloudinary.com/df94bonis/image/upload/v1677774235/zwyntyrmx0xvz796ygim.jpg"
  );
  let advertMessages = require("./adverts");
  const images = [wifiHotSpot, compRepairs, cctvImage];
  advertMessages = advertMessages.concat(images);
  //mongoose

  // Require database

  // Load the session data
  clientOnMessage(client, `message`);

  client.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
  });

  client.on("remote_session_saved", () => {
    console.log("session saved to remoted db");
  });
  client.on("remote_session_saved", () => {
    console.log("session saved");
  });
  //const sessionName = id ? `RemoteAuth-${id}` : "RemoteAuth";
  const timer = (ms) => new Promise((res) => setTimeout(res, ms));

  client.on("authenticated", async (session) => {
    console.log(`client authenticated`);
    //await store.save({ session: sessionName });
    //const remoteSessionExists=await store.sessionExists({session: 'yourSessionName'});

    // Save the session object however you prefer.
    // await store.save({session: session}).then(()=>{ console.log("session saved")});

    // Convert it to json, save it to a file, store it in a database...
  });

  async function sendAdverts() {
    const contact = "263775231426@c.us"; //contactListForAds[index];
    for (let i = 0; i < contactListForAds.length; i++) {
      try {
        client
          .sendMessage(contactListForAds[i], `${randomAdvert()}`)
          .catch((error) => {
            console.log(error);
          });
        await timer(5000);
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
    console.log("Client is ready!");
    cron.schedule(
      "29 7,13 * * *",
      () => {
        console.log("cron running");
        // client.sendMessage(tate, "test message");
        sendAdverts();
      },
      { scheduled: true, timezone: "UTC" }
    );
    cron.schedule(
      "29 7,13 * * *",
      () => {
        console.log("cron running");
        // client.sendMessage(tate, "test message");
      },
      { scheduled: true, timezone: "UTC" }
    );
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

  //const sendAdvert= client.sendMessage()

  const qrcode = require("qrcode-terminal");

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log(qr);
  });
  const messages = require("./messages");

  client.on("message_revoke_everyone", async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log(after); // message after it was deleted.
    if (before) {
      console.log(before); // message before it was deleted.
    } else {
      client.sendMessage(me, `this message was deleted${before.body}`);
    }
  });

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

    /*   let usdAlert = new keywordAlert(
          usdKeywords,
          client,
          message,
          amnestyinternational
        ); */
    //usdAlert.keywordRun(message.body);

    let businessAlert = new keywordAlert(businessKeywords, client, message, me);
    businessAlert.keywordRun(message.body);
  });

  const businessKeywords = [
    `cartridges`,
    `catridges`,
    `printer cartridges`,
    `HP ink`,
    `toner`,
    ` Ink cartridges`,
    `kyocera`,
    `lexmark`,
    `Samsung cartridges`,
    `Samsung Printer`,
    `Ricoh`,
    ` master and ink`,
    `computer repairs`,
    `computer networking`,
    `WIFI`,
    `telone modem`,
    `mifi`,
  ];

  client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
  });
});

//CONTACT
