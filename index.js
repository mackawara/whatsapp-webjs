const connectDB = require("./config/database");

const getCommentary = require("./config/helperFunction/getCricComm");

require("dotenv").config();
/* const getCricketHeadlines = require("./config/helperFunction/getCricketHeadlines");
getCricketHeadlines(); */
// connect to mongodb before running anything on the app
connectDB().then(async () => {
  const { Client, LocalAuth } = require("whatsapp-web.js");

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
    client.setDisplayName("Live Sport Scores,news, articles");
    // cron.schedule(`* * * * *`, async () => {

    const liveCricket1 = "120363110873098533@g.us";
    const getMatchIds = require("./config/helperFunction/getMatchIds");
    const getCricketHeadlines = require("./config/helperFunction/getCricketHeadlines");
    //console.log(await getCricketHeadlines());
    // get the latest updates
    let calls = 0;
    const date = new Date();
    yestdate = date.setDate(date.getDate() - 1);
    cron.schedule("15 3,11 * * *", async () => {
      getCricketHeadlines();
      getMatchIds("upcoming", calls);
      getMatchIds("complete", calls);
    });
    cron.schedule("15 3 * * *", async () => {
      await getMatchIds("recent", calls);
      timeDelay(150000);
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
        date: date,
        matchState: /upcoming|preview/gi,
      });
      upcoming.forEach(async (match) => {
        const commentary = await getCommentary(match.matchID, calls);
        client.sendMessage(liveCricket1, commentary);
      });
    });
    const timeDelay = (ms) => new Promise((res) => setTimeout(res, ms));
    //find the day`s cricket matchs and save their match Ids to the DB
    cron.schedule(
      getCricketHeadlines();
      `30
     20,12 * * *`,
      async () => {
        const cricHeadlines = require("./models/cricHeadlines");

        const headlines = await cricHeadlines.find({
          date: new Date().toISOString().slice(0, 10),
        });
        console.log(headlines);
        let news = [`*News Snippets*  \n`];
        await headlines.forEach(async (story) => {
          const hline = story.hline;
          const intro = story.intro;

          news.push(`*{context}*\n*Headline* :${hline}\n${intro}\n\n`);
        });
        if (news.length > 0) {
          client
            .sendMessage(liveCricket1, news.join("\n"))
            .then(() => console.log("message sent"));
        }
      }
    );
    cron.schedule(`35 2 * * *`, async () => {
      //at 215am everyday get the international and Ipl matches for the day and put them in an array
      await matchIDModel
        .find({
          date: new Date().toISOString().slice(0, 10),

          //matchType: /league|ODI|test|T20i/gi,
        })
        .exec()
        .then((matchesToday) => {
          console.log(matchesToday);
          matchesToday.forEach(async (match) => {
            console.log("upcoming matches");

            const hours = new Date(parseInt(match.unixTimeStamp)).getHours(),
              minutes = new Date(parseInt(match.unixTimeStamp)).getMinutes();
            console.log(hours);
            // send live update for each game every 25 minutes
            cron.schedule(`${minutes} ${hours} * * *`, async () => {
              do {
                console.log("DO WHIL LOOP");
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
              );
            });
            //run at least once //if comms test returns true
          });
        });

      // loop through the matches and get commentary every 15 minutes
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
