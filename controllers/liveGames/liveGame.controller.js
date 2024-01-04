const { isAfter, isBefore, min } = require('date-fns');
const getLiveScores = require('../../config/helperFunction/getLivescores');
const utils = require('../../utils/index');
const cron = require('node-cron');
const client = require('../../config/wwebjsConfig');
const system = require('../../constants/system');

const scoresUpdate = async fixturesToday => {
  if (!fixturesToday.length > 0) {
    return;
  }
  const gamesRemainingToday = fixturesToday;
  let startingTimes = await fixturesToday.map(fixture => fixture.timestamp);

  let cronString = utils.generateCronScheduleForgames(startingTimes);
  console.log(cronString);
  if (!cronString) {
    return;
  }
  const liveUpdateJob = cron.schedule(cronString, async () => {
    let liveScores; // if empty string it means no score
    do {
      liveScores = await getLiveScores({ type: 'live' });
      console.log('in looop');
      if (liveScores === '') {
        const now = new Date();
        const completedMatchIds = gamesRemainingToday
          .filter(fixture => isBefore(fixture.timestamp, now))
          .map(fixture => fixture.fixtureId);

        const fulltimeScores = await getLiveScores({
          fixtures: completedMatchIds,
        });
        console.log(`these are the completed match ids` + completedMatchIds);
        sendUpdateToGroup(
          system.AMNESTYGROUP,
          `Full time scores \n\n ${fulltimeScores}`
        );
        console.log(now);
        startingTimes = startingTimes.filter(fixture => isAfter(fixture, now)); // continously filters to see if any games are remaining that day

        console.log('no liv fixtures in progress');
        if (!startingTimes.length > 0) {
          console.log('now breaking');
          break;
        } else {
          const nextMatchStartsIn = parseInt(
            min(startingTimes) - parseInt(now)
          );
          await utils.timeDelay(nextMatchStartsIn);
        }
      } else {
        sendUpdateToGroup(
          system.AMNESTYGROUP,
          `Live Updates every 10 minutes \n\n ${liveScores}`
        );
      }
      console.log('games now left' + startingTimes);
      await utils.timeDelay(system.UPDATE_INTERVAL);
    } while (!liveScores === '' && !startingTimes.length > 0);

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
