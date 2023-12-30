const { isAfter, isBefore } = require('date-fns');
const getLiveScores = require('../../config/helperFunction/getLivescores');
const utils = require('../../utils/index');
const cron = require('node-cron');
const client = require('../../config/wwebjsConfig');
const system = require('../../constants/system');

const scoresUpdate = async fixturesToday => {
  let gamesRemainingToday = fixturesToday.map(fixture => fixture.timestamp);
  console.log(gamesRemainingToday);
  let cronString = utils.generateCronScheduleForgames(gamesRemainingToday);
  console.log(cronString);
  // const liveUpdateJob = cron.schedule(cronString, async () => {
  const liveScores = await getLiveScores(live); // if empty string it means no score
  while (!liveScores == '' && !gamesRemainingToday.length == 0) {
    console.log('cron triggerd');
    if (liveScores === '') {
      const completedMatchIds = gamesRemainingToday
        .filter(fixture => isBefore(fixture.timestamp, new Date()))
        .map(fixture => fixture.fixtureId);
      const fulltimeScores = await getLiveScores(completed, completedMatchIds);
      sendUpdateToGroup(
        system.AMNESTYGROUP,
        `Live Updates every 10 minutes \n\n ${fulltimeScores}`
      );
      console.log('no liv fixtures in progress');
    } else {
      sendUpdateToGroup(
        system.AMNESTYGROUP,
        `Live Updates every 10 minutes \n\n ${liveScores}`
      );
      utils.timeDelay(system.UPDATE_INTERVAL);
    }
    gamesRemainingToday = gamesRemainingToday.filter(fixture =>
      isAfter(fixture.timestamp, new Date())
    ); // continously filters to see if any games are remaining that day
    console.log(gamesRemainingToday);
  }
  liveUpdateJob.stop();
  // });
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
