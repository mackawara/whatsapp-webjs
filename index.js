const connectDB = require('./config/database');
const client = require('./config/wwebjsConfig');
const getLiveScores = require('./config/helperFunction/getLivescores');
const utils = require('./utils/index');
const footballFixturesModel = require('./models/footballFixtures');
const updateFootballDb = require('./config/helperFunction/updateFootballDb');
const cron = require('node-cron');
const {
  scoresUpdate,
  sendUpdateToGroup,
} = require('./controllers/liveGames/liveGame.controller');
const { isAfter, startOfYesterday, addDays } = require('date-fns');
const system = require('./constants/system');
require('dotenv').config();
// connect to mongodb before running anything on the app
connectDB().then(async () => {
  // client.initialize();

  const clientOn = require('./config/helperFunction/clientOn');
  //client
  clientOn(client, 'authenticated');
  clientOn(client, 'auth_failure');
  clientOn(client, 'qr');
  //clientOn(client2, "qr");
  //client.on('ready', async () => {
  clientOn(client, `message`);
  clientOn(client, 'group-join');
  clientOn(client, 'group-leave');
  //get the first match of the day
  let fixturesToUpdate, matchesToday, matchesTommorow;
  const yesterday = startOfYesterday();
  cron.schedule(`0 2 * * *`, async () => {
    try {
      matchesToday = await footballFixturesModel.find({
        date: new Date().toISOString().slice(0, 10),
      });
      matchesTommorow = await footballFixturesModel.find({
        date: new Date().toISOString().slice(0, 10),
      });
      fixturesToUpdate = matchesToday.map(match => {
        return {
          timestamp: parseInt(match.unixTimeStamp) * 1000,
          fixtureId: match.fixtureID,
        };
      });
    } catch (err) {
      console.log(err);
    }
  });

  cron.schedule(`47 6,14 * * *`, async () => {
    try {
      const matchesYestday = await footballFixturesModel.find({
        date: new Date(yesterday).toISOString().slice(0, 10),
      });
      const yesterdayScores = await getLiveScores(
        'completed',
        matchesYestday.map(match => match.fixtureID)
      );
      yesterdayScores == ''
        ? console.log('no matches from yesterday')
        : sendUpdateToGroup(system.AMNESTYGROUP, yesterdayScores);
      !matchesToday.length > 0
        ? console.log('no matches today')
        : sendUpdateToGroup(
            system.AMNESTYGROUP,
            `*Fixtures for today* \n\n` +
              matchesToday
                .map(
                  match => `${match.competition} ${match.fixture} ${match.time}`
                )
                .join('\n\n')
          );
    } catch (err) {
      console.log(err);
    }
  });
  // await updateFootballDb();
  cron.schedule(`30 11 * * *`, () => {
    scoresUpdate(fixturesToUpdate);
  });

  // update fixtures ever sun mon fri
  cron.schedule(`22 4 * * 0,1,5`, () => {
    console.log('cron');
    system.LEAGUES_FOLLOWED.forEach(league => {
      updateFootballDb(league);
    });
  });

  // });

  //Send day`s fixtures evry 4 hours
  /* cron.schedule('3 18 * * *', async () => {
  console.log('runing');
  // run every six minutes from 13horus to 23hrs
  await updateFootballDb(); // update the db first
  const groupLink = ``;
  let update = [groupLink];
  const epl = await getFixtures('epl', 'upcoming');
  const laliga = await getFixtures('la liga, upcoming');
  const zpsl = await getFixtures('zpsl, upcoming');
  const ucl = await getFixtures('uefa, upcoming');
  const europa = await getFixtures('europa, upcoming');
  console.log(epl, laliga, zosl, europa);
  if (!epl == '') {
    update.push(epl);
  }
  if (!laliga == '') {
    update.push(laliga);
  }
  if (!zpsl == '') {
    update.push(zpsl);
  }
  if (!ucl == '') {
    update.push(ucl);
  }
  if (!europa == '') {
    update.push(europa);
  }
  //  let message = update.filter((result) => !result == "");

  if (update.length > 0) {
    await client.sendMessage(liveSoccer1, update.join('\n'));
  } else {
    console.log('no upcoming matsche today');
  }
}); */

  client.on('disconnected', reason => {
    console.log('Client was logged out', reason);
  });
});
