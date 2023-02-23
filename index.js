require("dotenv").config();

const keywordAlert = require("./keywordsClass");
const express = require("express");
const app = express();
const port = process.env.PORT || 6000;
const chatBot = require("./middleware/chatbot");

//CONTACT
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

const advertMessages = [
  " Contact *Millennium Printers* for all major brands of printer cartridges, HP , Kyocera, Nashua, Lexmark, Canon , Samsung i.e. All Toner,ink cartridges, master & ink for copiers are available. Call or whatsapp *0775231426* or visit our shop at Total Baobab Service Station",
  " Genuine printer consumables available at great prices. Visit Millennium Printers, Shop 1 Baobab Service Station. In stock Hp ,Kyocera,Nashua, Ricoh,Samsung and all other major brands, Call us or whatsapp on 0775 231 426 for enquiries,or visit our shop at Total Baobab Service Station",
  "*Millennium Printers*.The premier suppliers of all IT products . Computers,printers, IT accessories and spare parts, toner powder, toner cartridge replacement parts etc.  Call or whatsapp *0775231426* or visit our shop at Total Baobab Service Station",
  `*CCTV Installation* \n Secure your home or business premises with High quality IP Surveillance Cameras \n
   *Remote Monitoring* \n monitor live feed from all your cameras from your phone/computer from anywhere in the world \n
   *Facial Recognition* \n  Our HD surveillance cameras make it easy to identify intruders from more than 10m away \n 
   *Infra red Light* \n Infrared (IR) cameras provide clear HD pictures in low light or night time \n
   *Motion Detection* \n get alerts when intruder is detected on the property during non-waking (night time) hours \n
   Get in touch with Industry legends Millennium printer on whatsapp/call 0775 231 426 `,
  `*Home or Business Network Engineering* \n
   2022 Offices/Homes need built-in network wiring. Network wiring is now just as essential as electrical cabling so that all rooms/offices have wired internet(ethernet ports) . \n
    Millennium Printers, your IT legends, provide custom built home/office network solutions \n 
    We also offer *WiFI* solutions \n
    - Wifi range extension\n
    - Covering WIfi blindspots \n
    - PtP wireless links \n
    Contact us on *0775231426* or visit our shop at Total Baobab Service Station`,
  ` Reliable,Proffessional Computer hardware and Software Repairs by industry experts. \n Please inbox for enquiries`,
  `HP 415 Ink tank Wireless \n Ships with 15000 pages worth of ink, You wont have to buy ink for almost 2 years`,
];

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
    headless: true,
    //"--no-sandbox": true,
    "--disable-setuid-sandbox": true,
    //executablePath:
     // "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
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
    "43 6,16 * * *",
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
const messages = require("./messages");
client.on(`message`, async (message) => {
  const messageContents = message.body;
  const author = message.from.replace("@c.us", "");
  const receiver = message.to.replace("@c.us", "").replace("263", "0");

  const usdKeywords = [
    `for eco`,
    `for ecocash`,
    `USD available`,
    `for zipit`,
    `US for`,
    `for bank transfer`,
    `US for`,
    `usd available`,
    `ìnternal transfer`,
  ];

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

  let cartridgeAlert = new keywordAlert(
    businessKeywords,
    client,
    message,
    amnestyinternational
  );
  cartridgeAlert.keywordRun(message.body);
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
