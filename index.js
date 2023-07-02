require("dotenv").config();
const connectDB = require("./config/database");
const getScoreCard = require("./config/helperFunction/getScoreCard");

// connect to mongodb before running anything on the app
connectDB().then(async () => {
  const timeDelay = (ms) => new Promise((res) => setTimeout(res, ms));

  // const score = await getScoreCard(66414);
  //console.log(score);
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
    client.setDisplayName("We are cricket");
    // cron.schedule(`* * * *s *`, async () => {

    const liveCricket1 = "120363110873098533@g.us";
    const getMatchIds = require("./config/helperFunction/getMatchIds");
    const getCommentary = require("./config/helperFunction/getCricComm");
    const getCricketHeadlines = require("./config/helperFunction/getCricketHeadlines");
    const me = `263775231426@c.us`;
    //console.log(await getCricketHeadlines());
    // get the latest updates

    let calls = 0;

    const matchCommentary = async (matchID, interval) => {
      console.log("secondary running");
      const complete = /Match state Complete/gi;
      const stumps = /Match state stumps/gi;
      const continueCondition = /Match state.(lunch|tea|dinner)/gi;
      let commentary = "";

      do {
        //send message prefixed with group invite
        console.log(commentary);
        const cricketGroupInvite = `Cricket world cup qualifiers, Ashes and other live updates, cricket news \n https://chat.whatsapp.com/EW1w0nBNXNOBV9RXoize12`;
        const update = await getCommentary(matchID);
        commentary = update;
        const scorecard = getScoreCard(matchID);
        const message = [cricketGroupInvite, update];
        if (continueCondition.test(update)) {
          console.log("continue condition");
          await timeDelay(900000);
          continue;
        } else if (complete.test(update) || stumps.test(update)) {
          console.log("break condition");
          client.sendMessage(liveCricket1, message.join("\n"));
          break;
        } else {
          console.log("update in progress");
          client.sendMessage(liveCricket1, message.join("\n"));
          await timeDelay(interval);
        }
        //updates at 25 minutes intervals
      } while (true);
      client.sendMessage(liveCricket1, commentary);
    };

    //scorecards from yesterday
    cron.schedule(`5 9 * * *`, async () => {
      let date = new Date();
      let yestdate = date.setDate(date.getDate() - 1);
      let yesterday = new Date(yestdate).toISOString().slice(0, 10);
      const matchesYesterday = await matchIDModel
        .find({ date: yesterday })
        .exec();
      if (matchesYesterday.length > 0) {
        client.sendMessage(
          liveCricket1,
          `*Selected scorecards from yesterday\`s matches....*`
        );
        matchesYesterday.forEach(async (match) => {
          const message = [`*${match.seriesName}*\n*${match.fixture}*\n`];
          const scorecard = await getScoreCard(match.matchID);
          message.push(scorecard);
          client.sendMessage(liveCricket1, message.join(","));
          timeDelay(5000);
        });
      }
    });
    //cricket headlines
    cron.schedule(`30 9,15,18 * * *`, async () => {
      getCricketHeadlines();
      await timeDelay(60000);
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
    cron.schedule(`2 6 * * *`, async () => {
      getMatchIds("upcoming", calls);
      getMatchIds("recent", calls);
    });
    // Live updates
    cron.schedule(`31 10 * * *`, () => {
      matchCommentary(53352, 1800000);
    });
    matchCommentary(71761, 1200000);
    cron.schedule(`52 8 * * *`, async () => {
      // getMatchIds("recent", calls);
      let today = new Date().toISOString().slice(0, 10);
      const fixtures = [`*Selected Upcoming Fixtures *\n\n`];
      const matchesToday = await matchIDModel
        .find({
          date: new Date().toISOString().slice(0, 10),
        })
        .exec();
      console.log(matchesToday);
      if (matchesToday.length > 0) {
        matchesToday.forEach(async (match) => {
          const hours = new Date(parseInt(match.unixTimeStamp)).getHours(),
            minutes = new Date(parseInt(match.unixTimeStamp)).getMinutes(),
            startDate = new Date(parseInt(match.unixTimeStamp)).getDate(),
            month = new Date(parseInt(match.unixTimeStamp)).getMonth() + 1,
            endDate = new Date(parseInt(match.endDateUnix)).getDate();

          console.log(minutes, hours, startDate, endDate, month);
          // send live update for each game every 25 minutes
          fixtures.push(
            `*${match.date}*\n*${match.seriesName}*\n${match.fixture}\n${match.startingTime}\n\n`
          );

          if (match.matchType == "TEST") {
            cron.schedule(
              ` ${minutes} ${hours} ${startDate}-${endDate} ${month} *`,
              () => {
                matchCommentary(match.matchID, 2700000);
              }
            );
          } else {
            cron.schedule(
              ` ${minutes} ${hours} ${startDate} ${month} *`,
              () => {
                matchCommentary(match.matchID, 1800000);
              }
            );
          }
        });
        //if there are any fixtures
        if (fixtures.length > 0) {
          client.sendMessage(liveCricket1, fixtures.join(","));
        }
      } else {
        console.log("no matches today");
      }
    });
  });

  client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
  });
});
