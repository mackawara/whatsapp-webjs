const connectDB = require('./config/database');
const { client, MessageMedia } = require('./config/wwebjsConfig');
const getLiveScores = require('./config/helperFunction/getLivescores');
const getLeagues = require('./config/helperFunction/getLeagues');
const TopScorers = require('./models/topScorers');
const getStatistics = require('./controllers/statistics/statistics.controller');
const utils = require('./utils/index');
const GroupsModel = require('./models/groups');
const LeaguesModel = require('./models/leagues');
const footballFixturesModel = require('./models/footballFixtures');
const updateFootballDb = require('./config/helperFunction/updateFootballDb');
const cron = require('node-cron');
const {
  scoresUpdate,
  sendUpdateToGroup,
} = require('./controllers/liveGames/liveGame.controller');
const { isAfter, startOfYesterday, addDays, add, sub } = require('date-fns');
const system = require('./constants/system');
const getStandings = require('./controllers/statistics/standings.controller');
require('dotenv').config();
// connect to mongodb before running anything on the app

connectDB().then(async () => {
  client.initialize();
  const clientOn = require('./config/helperFunction/clientOn');
  //client
  clientOn(client, 'authenticated');
  clientOn(client, 'auth_failure');
  clientOn(client, 'qr');
  //clientOn(client2, "qr");
  client.on('ready', async () => {
    console.log('client is ready');
    clientOn(client, `message`);
    clientOn(client, 'group-join');
    clientOn(client, 'group-leave');
    client.sendMessage(process.env.ME, 'deploy successfully');
    //get the first match of the day
    let fixturesToUpdate;
    //update Top Scorers
    cron.schedule(`58 23 * * 1,3,5`, async () => {
      console.log('updating top scorers');
      system.LEAGUES_FOLLOWED.forEach(async league => {
        getStatistics(league, 'players/topscorers');
      });
    });

    sendUpdateToGroup('testing');
    // top scorers charts
    cron.schedule(`10 10 * * 1,4`, async () => {
      system.LEAGUES_FOLLOWED.forEach(async league => {
        const leagueFollowed = await LeaguesModel.findOne({ id: league });
        const media = await MessageMedia.fromUrl(leagueFollowed.logo);
        const topScorers = await TopScorers.find({ leagueId: league })
          .sort({
            goalsScored: -1,
          })
          .limit(5);
        const leagueTopScorers = topScorers
          .map((stats, index) => {
            const rank = index + 1;
            return `${rank}. *${stats.name}* (${stats.teamName})\n ${
              stats.goalsScored
            } Goals , ${stats.assists ?? '?'} Assists  in ${
              stats.appearences
            } Matches `;
          })
          .slice(0, 5);
        const caption = {
          caption:
            `*${leagueFollowed.name} ${system.SEASON}-${
              parseInt(system.SEASON) + 1
            } Top Scorers*\n\n` + leagueTopScorers.join('\n\n'),
        };
        sendUpdateToGroup(media, caption);
        await utils.timeDelay(Math.random(10) * 10000);
      });
    });
    // send standing update
    cron.schedule(`3 16 * * 1,2,4`, async () => {
      system.LEAGUES_FOLLOWED.forEach(async league => {
        try {
          const standings = await getStandings(league);
          console.log(standings);
          if (standings == '') return;

          const standingsMedia = await MessageMedia.fromUrl(standings.media);

          const standingsCaption = {
            caption: standings.standings + `\n\n${system.GROUP_INVITE}`,
          };
          sendUpdateToGroup(standingsMedia, standingsCaption);
          await utils.timeDelay(Math.random(10) * 10000);
        } catch (err) {
          console.log(err);
        }
      });
    });
    //schedule todays fixtures
    cron.schedule(`51 11 * * *`, async () => {
      try {
        const matchesToday = await footballFixturesModel.find({
          date: new Date().toISOString().slice(0, 10),
        });

        fixturesToUpdate = matchesToday.map(match => {
          return {
            timestamp: parseInt(match.unixTimeStamp) * 1000,
            fixtureId: match.fixtureID,
          };
        });
        scoresUpdate(fixturesToUpdate);
      } catch (err) {
        console.log(err);
      }
    });
    //send yesterdays scores
    cron.schedule(`30 9,16 * * *`, async () => {
      try {
        const tommorow = add(new Date(), { days: 1 });
        const matchesTommorow = await footballFixturesModel.find({
          date: tommorow.toISOString().slice(0, 10),
        });
        const matchesToday = await footballFixturesModel.find({
          date: new Date().toISOString().slice(0, 10),
        });
        const yesterday = sub(new Date(), { days: 1 });
        console.log(yesterday.toISOString().slice(0, 10));
        const matchesYestday = await footballFixturesModel.find({
          date: yesterday.toISOString().slice(0, 10),
        });

        const yesterdayScores = await getLiveScores({
          fixtures: matchesYestday.map(fixture => fixture.fixtureID),
        });
        yesterdayScores == ''
          ? console.log('no matches from yesterday')
          : sendUpdateToGroup(
              `Results from yesterday\`s matches\n\n` + yesterdayScores
            );
        !matchesToday.length > 0
          ? console.log('no matches today')
          : sendUpdateToGroup(
              `*Selected Fixtures for today* \n\n` +
                matchesToday
                  .map(
                    match =>
                      `${match.competition} \n${match.fixture} \n${match.time}`
                  )
                  .join('\n\n')
            );

        !matchesTommorow.length > 0
          ? console.log('no matches tommorow')
          : sendUpdateToGroup(
              `*Selected Fixtures for tommorow* \n\n` +
                matchesTommorow
                  .map(
                    match =>
                      `${match.competition} \n${match.fixture} \n${match.time}`
                  )
                  .join('\n\n')
            );
      } catch (err) {
        console.log(err);
      }
    });

    // update fixtures ever sun mon fri for the next 7 days
    // if no fixtures on that day send top scorers charts , standings etc
    cron.schedule(`22 4 * * 0,1,5`, () => {
      console.log('cron');
      system.LEAGUES_FOLLOWED.forEach(league => {
        updateFootballDb(league);
      });
    });
  });

  client.on('disconnected', reason => {
    console.log('Client was logged out', reason);
  });
});
