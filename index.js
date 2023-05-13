const connectDB = require("./config/database");

require("dotenv").config();

// connect to mongodb before running anything on the app
connectDB().then(async () => {
  const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      executablePath: "/usr/bin/chromium-browser",
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

  //client2.initialize();
  client.initialize();

  //messaging client resources
  const clientOn = require("./config/helperFunction/clientOn");
  clientOn(client, "authenticated");
  clientOn(client, "auth_failure");
  clientOn(client, "qr");

  client.on("ready", async () => {
    console.log("Client is ready!");
    //functions abd resources
    //Helper Functions
    const timeDelay = (ms) => new Promise((res) => setTimeout(res, ms));
    const cron = require("node-cron");

    //client events and functions
    //decalre variables that work with client here
    clientOn(client, "message");
    clientOn(client, "group-join");
    clientOn(client, "group-leave"); //client
    client.setDisplayName("Your plug for live sport updates");

    //Db models
    const matchIDModel = require("./models/matchIdModel");
    //decalre variables that work with client here
    client.setDisplayName("Live Sport Scores,news, articles");
    // cron.schedule(`* * * * *`, async () => {

    const liveCricket1 = "120363110873098533@g.us";
    const getMatchIds = require("./config/helperFunction/getMatchIds");
    const getCommentary = require("./config/helperFunction/getCricComm");
    const getCricketHeadlines = require("./config/helperFunction/getCricketHeadlines");
    const me = `263775231426@c.us`;
    //console.log(await getCricketHeadlines());
    // get the latest updates
    let calls = 0;
    const date = new Date();
    const yestdate = date.setDate(date.getDate() - 1);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(yestdate).toISOString().slice(0, 10);

    /* 
    cron.schedule("40 10,23 * * *", async () => {
      const results = [];
      const getScorecard = require("./config/helperFunction/getScorecard");
      const completedMatches = await matchIDModel.find({
        date: new Date(yestdate).toISOString().slice(0, 10),
        matchState: /complete/gi,
      });
      await completedMatches.forEach(async (match) => {
        console.log(match);
        const date = new Date(
          parseInt(match.unixTimeStamp) * 1000
        ).toLocaleDateString();
        // const matchDetails = `${match.seriesName}\n${match.matchType} ${match.fixture}\nMatch Status: *${match.matchState}*`;
        //  results.push(matchDetails);
        const scorecard = await getScorecard(match.matchID);
        console.log(scorecard);
      }); 

      //GET UPCOMING MATCHES AND SHARE THEM
      const upcoming = await matchIDModel({
        date: date,
        matchState: /upcoming|preview/gi,
      });
      upcoming.forEach(async (match) => {
        const commentary = await getCommentary(match.matchID, calls);
        client.sendMessage(liveCricket1, commentary);
      });
    });
*/
    //find the day`s cricket matchs and save their match Ids to the DB

    cron.schedule(`30 6,11,18 * * *`, async () => {
      getCricketHeadlines();
    });
    cron.schedule(`33 6,11,18 * * *`, async () => {
      const cricHeadlines = require("./models/cricHeadlines");
      console.log("headlines");

      let headlines = await cricHeadlines.find({});

      const compareTimestamps = (a, b) => {
        return b.unixTimeStamp - a.unixTimeStamp;
      };
      headlines = headlines.sort(compareTimestamps).slice(0, 6);

      let news = [`*News Snippets*  \n`];
      await headlines.forEach(async (story) => {
        const hline = story.hline;
        const intro = story.intro;
        const context = story.context;

        news.push(`*${context}*\n*Headline* :${hline}\n${intro}\n\n`);
      });
      if (news.length > 2) {
        client
          .sendMessage(liveCricket1, news.join("\n"))
          .then(() => console.log("message sent"));
      } else {
        client.sendMessage(`263775231426@c.us`, "news is blank");
      }
    });
    //update the database
    cron.schedule(`0 2 * * *`, async () => {
      getMatchIds("upcoming", calls);
      getMatchIds("recent", calls);
    });
    // Live updates
    cron.schedule(`32 2, * * * `, async () => {
      console.log("cron running");
      await matchIDModel
        .find({
          date: new Date().toISOString().slice(0, 10),
        })
        .exec()
        .then((matchesToday) => {
          console.log(matchesToday);
          matchesToday.forEach(async (match) => {
            const hours = new Date(parseInt(match.unixTimeStamp)).getHours(),
              minutes = new Date(parseInt(match.unixTimeStamp)).getMinutes(),
              startDate = new Date(parseInt(match.unixTimeStamp)).getDate(),
              month = new Date(parseInt(match.unixTimeStamp)).getMonth() + 1,
              endDate = new Date(parseInt(match.endDateUnix)).getDate();

            console.log(minutes, hours, startDate - endDate, month);
            // send live update for each game every 25 minutes
            client.sendMessage(
              `263775231426@c.us`,
              `match ${match.fixture} scheduled to run at ${hours + 2}:${
                minutes + 2
              } everyday between ${startDate} and ${endDate}`
            );
            cron.schedule(
              `${minutes} ${hours} ${startDate}-${endDate} ${month} *`,
              async () => {
                console.log("secondary running");
                let commentary = await getCommentary(match.matchID, calls);
                if (/not available/gi.test(commentary)) {
                  console.log(commentary);
                  client.sendMessage(
                    `263775231426@c.us`,
                    `${match.fixture} not available`
                  );
                } else {
                  do {
                    console.log("do while loop");
                    //send message prefixed with group invite
                    const cricketGroupInvite = `https://chat.whatsapp.com/EW1w0nBNXNOBV9RXoize12`;

                    /*  if (/scorecard only/gi.test(commentary)) {
                      const index = await commentary.indexOf(/scorecard/gi);
                      commentary = commentary.slice(0, index);
                      client.sendMessage(liveCricket1, commentary);
                      await timeDelay(2400000);
                    } else { */
                    const update = await getCommentary(match.matchID, calls);
                    const message = [cricketGroupInvite, update];
                    client.sendMessage(liveCricket1, message.join("\n"));
                    //updates at 25 minutes intervals
                    await timeDelay(1500000);
                  } while (
                    !/Complete|No result|scorecard only/gi.test(
                      await getCommentary(match.matchID, calls)
                    )
                  );
                  client.sendMessage(
                    liveCricket1,
                    await getCommentary(match.matchID, calls)
                  );
                }
              }
            );

            //run at least once //if comms test returns true
          });
        });
    });

    //collect media adverts and send
    //const mediaModel = require("./models/media");
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
      }
    });

    const path = require("path");
    const fs = require("fs");
    //joining path of directory
    const directoryPath = path.join(__dirname, "assets");
    //passsing directoryPath and callback function
    //read fromm assets folder and send
    const sendAdMedia = async (group) => {
      //creates anarray from the files in assets folder
      fs.readdir(directoryPath, function (err, mediaAdverts) {
        console.log(mediaAdverts);
        //handling error
        if (err) {
          return console.log("Unable to scan directory: " + err);
        }
        let randomMediaAdvert =
          mediaAdverts[Math.floor(Math.random() * mediaAdverts.length)];
        //listing all files using forEach
        console.log(randomMediaAdvert);

        client.sendMessage(
          group,
          MessageMedia.fromFilePath(`./assets/${randomMediaAdvert}`)
        );
      });
    };
    // runs scheduled updates
    cron.schedule(`30 9,14,17 * * *`, async () => {
      console.log("adnow running");
      let advertMessages = require("./adverts");
      let randomAdvert =
        advertMessages[Math.floor(Math.random() * advertMessages.length)];
      console.log(randomAdvert);
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

      for (let i = 0; i < contactListForAds.length; i++) {
        try {
          sendAdMedia(contactListForAds[i]);
          client
            .sendMessage(contactListForAds[i], `${randomAdvert}`)
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
  });

  client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
  });
});
