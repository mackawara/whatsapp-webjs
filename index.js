require("dotenv").config();

const keywordAlert = require("./keywordsAlert");
const express = require("express");
const app = express();
const port = process.env.PORT || 6000;
const chatBot = require("./middleware/chatbot");

const connectDB = require("./config/database");
const mongoose=require("mongoose")
try {
  // getLeague()
  connectDB()
    .then(async () => {
      console.log("db conected")
      const me = process.env.ME;
//GROUPS

const hwgeCheapGadgets2 = process.env.HWANGECHEAPGADGETS2;
const hwangeBusinessMarketing1 = process.env.HWANGEBUSINESSMARKETINGGROUP1;
const hwangeBusinessMarketing2 = process.env.HWANGEBUSINESSMARKETINGGROUP2;
const matNorthBusinessGroup = process.env.MATNORTHBUSINESSGROUP;
const hwangeCityTraders = process.env.HWANGECITYTRADERS;
const hwangeBuyingAndSelling = process.env.HWANGEBUYINGANDSELLING;
const hwangeClassifieds = process.env.HWANGECLASSIFIEDS;
const hwangeDealsGrp1 = process.env.HWANGEDEALSGRP1;
const amnestyinternational = process.env.AMNESTYINTERNATIONAL;
const tate = process.env.TATENDA;

const contactListForAds = [
  hwangeBusinessMarketing1,
  hwangeBusinessMarketing2,
  matNorthBusinessGroup,
  hwangeBuyingAndSelling,
  hwangeCityTraders,
  hwangeClassifieds,
  hwangeDealsGrp1,
];
//Messages

const advertMessages = require("./adverts");


let randomAdvert = () =>
  advertMessages[Math.floor(Math.random() * advertMessages.length)];
//CIRCKET SCORES
const getLiveMatches=require("./config/getLiveMatches")
//getLiveMatches()

const { Client, RemoteAuth,id } = require("whatsapp-web.js");
const cron = require(`node-cron`);
const { MongoStore } = require('wwebjs-mongo');
const store = new MongoStore({ mongoose: mongoose });

// Path where the session data will be stored
const SESSION_FILE_PATH = "./session.json";

const client = new Client({
  authStrategy: new RemoteAuth({
    clientId: id,
    store: store,
    backupSyncIntervalMs: 60000,
    
  }),
  puppeteer: {
    headless: false,
    //"--no-sandbox": true,
    "--disable-setuid-sandbox": true,
    //executablePath: "OS/Applications/Chrome",
  },
});
console.log("client initialising");
try {
 client.initialize();
} catch {
  console.log(` authentication not approved`);
}

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

client.on("authenticated", (session) => {
  console.log(session);
  console.log(`client authenticated`);
  // Save the session object however you prefer.
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
client.on("ready", () => {
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
});

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

client.on('message_revoke_everyone', async (after, before) => {
  // Fired whenever a message is deleted by anyone (including you)
  console.log(after); // message after it was deleted.
  if (before) {
    console.log(before); // message before it was deleted.
  }
  else{
    client.sendMessage(me,`this message was deleted${before.body}`)

  }
});

client.on(`message`, async (message) => {
  const messageContents = message.body;
  const author = message.from.replace("@c.us", "");
  const receiver = message.to.replace("@c.us", "").replace("263", "0");
const keywords=require("./keywords")
  const usdKeywords = keywords.usdKeyword
  const businessKeywords=keywords.businessKeywords
  

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
      //console.log(`${message.from} :${messageContents}`);
    }
  });

  let usdAlert = new keywordAlert(
    usdKeywords,
    client,
    message,
    amnestyinternational
  );
  usdAlert.keywordRun(message.body);

  let businessAlert = new keywordAlert(
    businessKeywords,
    client,
    message,
    amnestyinternational
  );
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

    })}catch{

    }
//CONTACT
