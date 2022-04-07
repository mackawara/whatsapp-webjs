require("dotenv").config();

const keywordAlert = require("./keywordsClass");
const express = require("express");
const app = express();
const port = process.env.PORT || 6000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//CONTACT
const juanita = process.env.JUANITA;
const me = process.env.ME;
const mkadzi = process.env.WIFE;
const lisbon = process.env.LISBON;
//GROUPS
const hwangeClubcricket = process.env.HWANGECLUBCRICKET;
const hwgeCheapGadgets2 = process.env.HWANGECHEAPGADGETS2;
const hwangeBusinessMarketing1 = process.env.HWANGEBUSINESSMARKETINGGROUP1;
const hwangeBusinessMarketing2 = process.env.HWANGEBUSINESSMARKETING2;
const matNorthBusinessGroup = process.env.MATNORTHBUSINESSGROUB;
const hwangeCityTraders = process.env.HWANGECITYTRADERS;
const hwangeBuyingAndSelling = process.env.HWANGEBUYINGANDSELLING;
const hwangeClassifieds = process.env.HWANGECLASSIFIEDS;
const hwangeDealsGrp1 = process.env.HWANGEDEALSGRP1;
const amnestyinternational = process.env.AMNESTYINTERNATIONAL;

//Messages

const adverts = [
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
];

let randomAdvert = () => adverts[Math.floor(Math.random() * adverts.length)];
//

const { Client, LocalAuth, NoAuth } = require("whatsapp-web.js");
const match = `match:`;
const cron = require(`node-cron`);
console.log(me);
//const fs = require("fs");

//const puppeteer = require("puppeteer")
//const fs = require("fs/promises")
const startScrapping = async (matchparameter) => {
  const getCricketScore = await require("./cricketScores");
  const livescore = await getCricketScore(matchparameter);
  return livescore.toString();
};

// Path where the session data will be stored
const SESSION_FILE_PATH = "./session.json";

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "client" }),
  puppeteer: {
    headless: false,
    "--no-sandbox": true,
    "--disable-setuid-sandbox": true,
    /*  executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" */
    //executablePath: "OS/Applications/Chrome",
  },
});
console.log("client initialising");
console.time(`initialising`);
try {
  client.initialize();
} catch {
  console.log(` authentication not approved`);
}
console.timeEnd(`initialising`);
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

const scheduledMessagesList = [
  hwangeBusinessMarketing1,
  hwangeBusinessMarketing2,
  hwgeCheapGadgets2,
  matNorthBusinessGroup,
  hwangeBuyingAndSelling,
  hwangeCityTraders,
  hwangeClassifieds,
  hwangeDealsGrp1,

  /*hwangeBusinessMarketing,
  hwangeBusinessMarketing2,
   */
];

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

client.on("ready", () => {
  console.log("Client is ready!");
  cron.schedule(
    "52 10,15 * * *",
    () => {
      async function sendAdverts() {
        for (let index = 0; index < scheduledMessagesList.length; index++) {
          const contact = scheduledMessagesList[index];
          client.sendMessage(contact, `${randomAdvert()}`);
          await timer(50000);
        }
      }
      sendAdverts();
    },
    { scheduled: true, timezone: "UTC" }
  );
});

/* client.on(`sendMessage`,()=>{
  console.log(message)
}) */
async function sendScores() {
  cron.schedule("00 05  * * *", async () => {
    const scores = await startScrapping(2);
    await console.log(scores);
    await client.sendMessage(
      hwangeClubcricket,
      `Match scores brought to you by *MacBot*  ${scores}`
    );
  });
}
//sendScores()
//client.sendMessage(me,startScrapping(`match:2`))
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
const nodemon = require("nodemon");
const { send } = require("express/lib/response");

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log(qr);
});

client.on(`message`, async (message) => {
  let chat = message.getChat();
  console.log(chat);
  const messageContents = message.body;
  const author = message.from.replace("@c.us", "");
  const receiver = message.to.replace("@c.us", "").replace("263", "0");

  // REQUEST FOR match scores in cricket group

  if (message.from == hwangeClubcricket && messageContents == `${match}3`) {
    console.log(message.from);
    message.reply(
      `Thank you ${message.notifyName} for  using  *MacBot*, please wait while get the scores for you `
    );

    const matchString = message.body.replace(match, ``);
    const reply = await startScrapping(matchString);
    await message.reply(`${reply}`);
  }
  //Automatic detection of group message with keywords
  /* if (message.from == mkadzi) {
    client.sendMessage(mkadzi, "newe");
  } */
  //USD related keywords
  console.log(message);
  const usdKeywords = [
    `for eco`,
    `for ecocash`,
    `USD available`,
    `for zipit`,
    `US for`,
    `for bank transfer`,
    `US for`,
    `usd available`,
  ];
  /*  keywords.filter((keyword) => {
    
    if (message.body.includes(keyword) &&
    !message.body.includes(`message created by chatBot`)
    ) {
      client.sendMessage(
        me,
        `${toTime(message.timestamp)}  at ${message.from
        } group :message from :${message.author.replace("@c.us", "").replace("263", "0")}, ${message.notifyName} ${message.body} *message created by chatBot`
      );
      //console.log(`${message.from} :${messageContents}`);
    }
  }) */

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
    mkadzi
  );
  cartridgeAlert.keywordRun(message.body);
});

//Businness related keyword

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
];

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});
