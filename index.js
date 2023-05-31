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

    //Db models
    const matchIDModel = require("./models/matchIdModel");
    //decalre variables that work with client here
    client.setDisplayName("Live Sport Scores,news, articles");
    // cron.schedule(`* * * * *`, async () => {

    //});
    const hwangeClubCricket = process.env.HWANGECLUBDELACRICKET;
    const liveSoccer1 = process.env.LIVESOCCER1;
    const me = `263775231426@c.us`;
    const liveCricket1 = "120363110873098533@g.us";
    const getMatchIds = require("./config/helperFunction/getMatchIds");
    const getCommentary = require("./config/helperFunction/getCricComm");
    const getCricketHeadlines = require("./config/helperFunction/getCricketHeadlines");
    //console.log(await getCricketHeadlines());
    // get the latest updates

    const nowToday = new Date();
    const tomorrow = new Date(nowToday.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const yesterday = new Date(nowToday.getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

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

    //getMatchIds("recent");
    let fixturesToday, fixturesTommorow;
    cron.schedule(`30 5,11,18 * * *`, async () => {
      getCricketHeadlines();
    });
    cron.schedule(`33 6,11,18 * * *`, async () => {
      const cricHeadlines = require("./models/cricHeadlines");
      console.log("headlines");

      let headlines = await cricHeadlines.find({});

      const compareTimestamps = (a, b) => {
        return b.unixTimeStamp - a.unixTimeStamp;
      };
      headlines = headlines.sort(compareTimestamps).slice(0, 8);

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
    //  getMatchIds("upcoming");
    cron.schedule(`0 2 * * *`, async () => {
      getMatchIds("recent");
    });

    cron.schedule(`32 6 * * *`, async () => {
      // getMatchIds("recent", calls);
      console.log(today);
      const fixtures = [`*Featured Fixtures today*\n\n`];
      await matchIDModel
        .find({
          date: today,
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
            fixtures.push(
              `*${match.seriesName}*\n${match.fixture}\n${match.startingTime}\n\n`
            );

            cron.schedule(
              ` ${minutes} ${hours} ${startDate}-${endDate} ${month} *`,
              async () => {
                console.log("secondary running");
                const complete = /Match state Complete/gi;
                const stumps = /Match state stumps/gi;
                const continueCondition = /Match state.(lunch|tea|dinner)/gi;
                let commentary = "";

                do {
                  //send message prefixed with group invite
                  console.log(commentary);
                  const cricketGroupInvite = `https://chat.whatsapp.com/EW1w0nBNXNOBV9RXoize12`;
                  const update = await getCommentary(match.matchID);
                  commentary = update;
                  const message = [cricketGroupInvite, update];
                  if (continueCondition.test(update)) {
                    console.log("continue condition");
                    await timeDelay(900000);
                    continue;
                  } else if (complete.test(update) || stumps.test(update)) {
                    console.log("break condition");
                    // client.sendMessage(liveCricket1, message.join("\n"));
                    break;
                  } else {
                    console.log("update in progress");
                    client.sendMessage(liveCricket1, message.join("\n"));
                    await timeDelay(1800000);
                  }
                  //updates at 25 minutes intervals
                } while (true);
                client.sendMessage(
                  liveCricket1,
                  await getCommentary(match.matchID)
                );
              }
            );

            //run at least once //if comms test returns true
          });
        });

      client.sendMessage(liveCricket1, fixtures.join(","));
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
    const sendAdMedia = (group) => {
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

    cron.schedule(`32 9,14,19 * * *`, async () => {
      console.log("cron running");
      let advertMessages = require("./adverts");
      let randomAdvert =
        advertMessages[Math.floor(Math.random() * advertMessages.length)];

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
          console.log("test " + i);
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
