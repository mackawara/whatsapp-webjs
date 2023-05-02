const connectDB = require("./config/database");


require("dotenv").config();
// connect to mongodb before running anything on the app
connectDB().then(async () => {
  const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      //executablePath: "/usr/bin/chromium-browser",
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

    const matchIDModel = require("./models/matchIdModel");
    //decalre variables that work with client here

    client.setDisplayName("Live Scores,news, articles");

    const liveCricket1 = "120363110873098533@g.us";
    const getMatchIds = require("./config/helperFunction/getMatchIds");
    const getCommentary = require("./config/helperFunction/getCricComm");

    // get the latest updates

    let calls = 0;
    const date = new Date(),
      yestdate = date.setDate(date.getDate() - 1);
    cron.schedule("15 3 * * *", async () => {
      //await getMatchIds("upcoming");
      await getMatchIds("recent", calls);
      const completedMatches = await matchIDModel.find({
        date: new Date(yestdate).toISOString().slice(0, 10),
        matchState: /complete/gi,
      });
      console.log(completedMatches);
      completedMatches.forEach(async (match) => {
        const commentary = await getCommentary(match.matchID, calls);
        client.sendMessage(liveCricket1, commentary);
      });
      console.log(upcoming);
      const upcoming = await matchIDModel({
        date: new Date().toISOString().slice(0, 10),
        matchState: /upcoming|preview/gi,
      });
      upcoming.forEach(async (match) => {
        const commentary = await getCommentary(match.matchID, calls);
        client.sendMessage(liveCricket1, commentary);
      });
    });
    const timeDelay = (ms) => new Promise((res) => setTimeout(res, ms));
    //find the day`s cricket matchs and save their match Ids to the DB
    console.log(new Date().toISOString().slice(0, 10));
    cron.schedule(`30 3 * * *`, async () => {
      await getMatchIds("upcoming", calls);

      //at 215am everyday get the international and Ipl matches for the day and put them in an array
      await matchIDModel
        .find({
          date: new Date().toISOString().slice(0, 10),
          matchState: /upcoming/gi,
          //matchType: /league|ODI|test|T20i/gi,
        })
        .exec()
        .then((matchesToday) => {
          console.log(matchesToday);
          matchesToday.forEach(async (match) => {
            console.log("upcoming matches");
            // const commentary = await getCommentary(match.matchID);
            //   client.sendMessage(`263775231426@c.us`, commentary);
            // console.log(/upcoming/gi.test(match.matchState));
            const hours = new Date(parseInt(match.unixTimeStamp)).getHours(),
              minutes = new Date(parseInt(match.unixTimeStamp)).getMinutes();
            console.log(hours);
            // send live update for each game every 25 minutes
            cron.schedule(`${minutes} ${hours} * * *`, async () => {});
            //run at least once
            do {
             
              //send message prefixed with group invite
              const cricketGroupInvite = `https://chat.whatsapp.com/EW1w0nBNXNOBV9RXoize12`;
              const commentary = await getCommentary(match.matchID, calls);
              const message = [cricketGroupInvite, commentary];
              client.sendMessage(liveCricket1, message.join("\n"));
              calls > 85
                ? client.sendMessage("263775231426", "calls going hig")
                : console.log("waiting");
              await timeDelay(1500000);
            } while (
              !/Complete/gi.test(await getCommentary(match.matchID, calls))
            ); //if comms test returns true
          });
        });

      // loop through the matches and get commentary every 15 minutes
    });

    let mediaAdverts = [];
    const mediaModel = require("./models/media");
    client.on("message", async (msg) => {
      if (msg.hasMedia && msg.from == "263775231426@c.us") {
        const fs = require("fs/promises");
        const media = await msg.downloadMedia();
        const uniqueName = new Date().valueOf().toString().slice("5");
        await fs.writeFile(
          `assets/image${uniqueName}.jpeg`,
          media.data,
          "base64",
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );
        /* 
        const mediaAdvert = new mediaModel({
          mimetype: media.mimetype,
          filename: media.filename,
          filesize: media.filesize,
          data: media.data,
        });
        mediaAdvert.save();
        let randomMediaAdvert = () =>
        mediaAdverts[Math.floor(Math.random() * mediaAdverts.length)];
        
     msg.reply( randomMediaAdvert); */

        // console.log(media);
        // media.data

        // const media = await MessageMedia.fromFilePath("./assets/tadiewashe.jpeg");
        //   client.sendMessage(msg.from, media); //const media = await msg.downloadMedia();
        //console.log(media)
        // fs.writeFile(`./assets/`, media.data);
      }
    });

    const path = require("path");
    const fs = require("fs");
    //joining path of directory
    const directoryPath = path.join(__dirname, "assets");
    //passsing directoryPath and callback function
    const sendAdMedia = (group) => {
      //creates anarray from the files in assets folder
      fs.readdir(directoryPath, function (err, mediaAdverts) {
        //handling error
        if (err) {
          return console.log("Unable to scan directory: " + err);
        }
        let randomMediaAdvert = () =>
          mediaAdverts[Math.floor(Math.random() * mediaAdverts.length)];
        //listing all files using forEach

        client.sendMessage(
          group,
          MessageMedia.fromFilePath(`assets/${randomMediaAdvert}`)
        );
      });
    };
    cron.schedule(`02 9,11,15,17,19 * * *`, async () => {
      let randomAdvert = () =>
        advertMessages[Math.floor(Math.random() * advertMessages.length)];

      let advertMessages = require("./adverts");
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

    /*  */
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
