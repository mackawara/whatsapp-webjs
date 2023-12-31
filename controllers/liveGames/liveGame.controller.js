const { isAfter, isBefore } = require('date-fns');
const getLiveScores = require('../../config/helperFunction/getLivescores');
const utils = require('../../utils/index');
const cron = require('node-cron');
const client = require('../../config/wwebjsConfig');
const system = require('../../constants/system');

const scoresUpdate = async fixturesToday => {
  let gamesRemainingToday = await fixturesToday.map(
    fixture => fixture.timestamp
  );
  console.log('rr');
  let cronString = utils.generateCronScheduleForgames(gamesRemainingToday);
  cron.schedule(cronString, async () => {
    const liveScores = await getLiveScores('live'); // if empty string it means no score
    console.log(gamesRemainingToday.length);
    do {
      console.log('in looop');
      if (liveScores === '') {
        /*  const completedMatchIds = gamesRemainingToday
        .filter(fixture => isBefore(fixture.timestamp, new Date()))
        .map(fixture => fixture.fixtureId); */

        const fulltimeScores = await getLiveScores(
          'completed',
          gamesRemainingToday
        );
        console.log(`these are the completed match ids` + completedMatchIds);
        sendUpdateToGroup(
          system.AMNESTYGROUP,
          `Live Updates every 10 minutes \n\n ${fulltimeScores}`
        );
        const now = new Date().toTimeString();
        console.log(now);
        gamesRemainingToday = gamesRemainingToday.filter(
          fixture => parseInt(now) < parseInt(fixture.timestamp)
        ); // continously filters to see if any games are remaining that day
        await utils.timeDelay(system.UPDATE_INTERVAL);
        console.log('no liv fixtures in progress');
        if (!gamesRemainingToday.length > 0) {
          console.log('now breaking');
          break;
        }
      } else {
        sendUpdateToGroup(
          system.AMNESTYGROUP,
          `Live Updates every 10 minutes \n\n ${liveScores}`
        );
      }
      await utils.timeDelay(system.UPDATE_INTERVAL);

      console.log('games now left' + gamesRemainingToday);
    } while (!liveScores == '');
    //liveUpdateJob.stop();
  });
};
const sendUpdateToGroup = async (recipient, message) => {
  const maxDelayTimeInSecs = 97;
  const minDelayTimeInSecs = 33;
  const delayTime =
    (Math.random() * (maxDelayTimeInSecs - minDelayTimeInSecs) +
      minDelayTimeInSecs) *
    1000;
  await utils.timeDelay(delayTime);
  client.sendMessage(recipient, message);
};
module.exports = { sendUpdateToGroup, scoresUpdate };
