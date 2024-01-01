const { isAfter, isBefore } = require('date-fns');
const getLiveScores = require('../../config/helperFunction/getLivescores');
const utils = require('../../utils/index');
const cron = require('node-cron');
const client = require('../../config/wwebjsConfig');
const system = require('../../constants/system');

const scoresUpdate = async fixturesToday => {
  if (!fixturesToday.length > 0) {
    return;
  }
  let startingTimes = await fixturesToday.map(fixture => fixture.timestamp);
  const now = new Date();

  let cronString = utils.generateCronScheduleForgames(startingTimes);
  console.log(cronString);
  const liveUpdateJob = cron.schedule(cronString, async () => {
    const liveScores = await getLiveScores('live'); // if empty string it means no score
    do {
      console.log('in looop');
      if (liveScores === '') {
        const completedMatchIds = gamesRemainingToday
          .filter(fixture => isBefore(fixture.timestamp, new Date()))
          .map(fixture => fixture.fixtureId);

        const fulltimeScores = await getLiveScores('completed', startingTimes);
        console.log(`these are the completed match ids` + completedMatchIds);
        sendUpdateToGroup(
          system.AMNESTYGROUP,
          `Live Updates every 10 minutes \n\n ${fulltimeScores}`
        );
        const now = new Date().toTimeString();
        console.log(now);
        startingTimes = startingTimes.filter(
          fixture => parseInt(now) < parseInt(fixture.timestamp)
        ); // continously filters to see if any games are remaining that day
        await utils.timeDelay(system.UPDATE_INTERVAL);

        console.log('no liv fixtures in progress');
        if (!startingTimes.length > 0) {
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
      console.log('games now left' + startingTimes);
    } while (!liveScores == '');

    liveUpdateJob.stop();
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
  try {
    client.sendMessage(recipient, message);
  } catch (err) {
    console.log(err);
  }
};
module.exports = { sendUpdateToGroup, scoresUpdate };
