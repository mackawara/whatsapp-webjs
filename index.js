require("dotenv").config();

const keywordAlert = require("./keywordsClass");
const express = require("express");
const app = express();
const port = process.env.PORT || 6000;
const chatBot = require("./middleware/chatbot");

//CONTACT
const juanita = process.env.JUANITA;
const me = process.env.ME;
const mkadzi = process.env.WIFE;
const lisbon = process.env.LISBON;
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

const messages = require("./messages");
const keywords = require("./keywords");
const advertMessages = messages.advertMessages;

let randomAdvert = () =>
  advertMessages[Math.floor(Math.random() * advertMessages.length)];
//

const { Client, LocalAuth, NoAuth } = require("whatsapp-web.js");
const cron = require(`node-cron`);

// Path where the session data will be stored
const SESSION_FILE_PATH = "./session.json";

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    "--no-sandbox": true,
    "--disable-setuid-sandbox": true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    //executablePath: "OS/Applications/Chrome",
  },
});
console.log("client initialising");
try {
  client.initialize();
} catch {
  console.log(` authentication not approved`);
}
const client1 = new Client({
  authStrategy: new LocalAuth({ clientId: "client-one" }),
});

const client2 = new Client({
  authStrategy: new LocalAuth({ clientId: "client-two" }),
});
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
      client.sendMessage(contactListForAds[i], `${randomAdvert()}`);
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
    "47 11,14 * * *",
    () => {
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
client.on(`message`, async (message) => {
  const messageContents = message.body;
  const author = message.from.replace("@c.us", "");
  const receiver = message.to.replace("@c.us", "").replace("263", "0");

  const usdKeywords = keywords.usdAlerts;
  console.log(usdKeywords);

  if (messageContents == "inBert") {
    const customerNumber = message.from;
    chatBot(client, message, customerNumber);
  }
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

  let usdAlert = new keywordAlert(
    usdKeywords,
    client,
    message,
    amnestyinternational
  );
  usdAlert.keywordRun(message.body);

  let cartridgeAlert = new keywordAlert(
    businessKeywords,
    client,
    message,
    amnestyinternational
  );
  cartridgeAlert.keywordRun(message.body);
});

const businessKeywords = keywords.cartridgeAlert;

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});
