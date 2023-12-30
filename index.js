const connectDB = require('./config/database');
const client = require('./config/wwebjsConfig');
const getLiveScores = require('./config/helperFunction/getLivescores');
const utils = require('./utils/index');
const footballFixturesModel = require('./models/footballFixtures');
const updateFootballDb = require('./config/helperFunction/updateFootballDb');
const cron = require('node-cron');
const { scoresUpdate } = require('./controllers/liveGames/liveGame.controller');
const { isAfter } = require('date-fns');
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
    clientOn(client, `message`);
    clientOn(client, 'group-join');
    clientOn(client, 'group-leave');
    //get the first match of the day

    const matchesToday = await footballFixturesModel.find({
      date: new Date().toISOString().slice(0, 10),
    });
    const fixturesToUpdate = matchesToday.map(match => {
      return {
        timestamp: match.unixTimeStamp * 1000,
        fixtureId: match.fixtureID,
      };
    });

    scoresUpdate(fixturesToUpdate);
  });

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
