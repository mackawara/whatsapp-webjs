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
//GROUPS
const hwangeClubcricket = process.env.HWANGECLUBCRICKET;
const hwgeCheapGadgets = process.env.HWANGECHEAPGADGETS;
const hwangeBusinessMarketing1 = process.env.HWANGEBUSINESSMARKETING1;
const hwangeBusinessMarketing2 = process.env.HWANGEBUSINESSMARKETING2;
const matNorthBusinessGroup = process.env.MATNORTHBUSINESSGROUB;

//Messages

const adverts = [
  " Contact *Millennium Printers* for all major brands of printer cartridges, HP , Kyocera, Nashua, Lexmark, Canon , Samsung i.e. All Toner,ink cartridges, master & ink for copiers are available. Call or whatsapp *0775231426* ",
  " Genuine printer consumables available at great prices. Visit Millennium Printers, Shop 1 Baobab Service Station. In stock Hp ,Kyocera,Nashua, Ricoh,Samsung and all other major brands, Call us or whatsapp on 0775 231 426 for enquiries",
  "*Millennium Printers*.The premier suppliers of all IT products . Computers,printers, IT accessories and spare parts, toner powder, toner cartridge replacement parts etc.  Call or whatsapp *0775231426*",
];

let randomAdvert = adverts[Math.floor(Math.random() * adverts.length)];
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
  //me,
 // mkadzi,
  hwangeBusinessMarketing1,
  hwangeBusinessMarketing2,
  hwgeCheapGadgets,

  /*  hwangeBusinessMarketing,
  hwangeBusinessMarketing2,
  matNorthBusinessGroup */
];
client.on("ready", () => {
  console.log("Client is ready!");
  cron.schedule("30 09 * * *", () => {
    console.log(`testing`);
    
    scheduledMessagesList.forEach(
      (contact) => {
        client.sendMessage(contact, `${randomAdvert}`);
        console.log(`message sent to ${contact}`);
      },
      {
        scheduled: true,
        timezone: "SAST",
      }
    );
  });
});

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

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log(qr);
});

client.on(`message`, async (message) => {
  const messageContents = message.body;
  const author = message.from.replace("@c.us", "");
  const receiver = message.to.replace("@c.us", "").replace("263", "0");

  console.log(author, receiver, messageContents);
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

  //USD related keywords

  const keywords = [
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

  let getscores = new keywordAlert(keywords, client, message, me);
  getscores.keywordRun();
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
