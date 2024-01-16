const { isAfter, isBefore, min } = require('date-fns');
const getLiveScores = require('../../config/helperFunction/getLivescores');
const utils = require('../../utils/index');
const cron = require('node-cron');
const { client, MessageMedia } = require('../../config/wwebjsConfig');
const system = require('../../constants/system');
const GroupsModel = require('../../models/groups');
const logger = require('../../services/winston');

const scoresUpdate = async fixturesToday => {
  if (!fixturesToday.length > 0) {
    return;
  }
  const gamesRemainingToday = fixturesToday;
  let startingTimes = await fixturesToday.map(fixture => fixture.timestamp);

  let cronString = utils.generateCronScheduleForgames(startingTimes);
  logger.info(cronString);
  if (!cronString) {
    return;
  }
  //const liveUpdateJob = cron.schedule(cronString, async () => {
  let liveScores; // if empty string it means no score
  do {
    liveScores = await getLiveScores({ type: 'live' });
    const now = new Date();
    startingTimes = startingTimes.filter(fixture => isAfter(fixture, now)); // continously filters to see if any games are remaining that day
    logger.info(liveScores);
    if (liveScores === '') {
      const completedMatchIds = gamesRemainingToday
        .filter(fixture => isBefore(fixture.timestamp, now))
        .map(fixture => fixture.fixtureId);

      const fulltimeScores = await getLiveScores({
        fixtures: completedMatchIds,
      });
      logger.info(`these are the completed match ids` + completedMatchIds);
      if (fulltimeScores !== '') {
        sendUpdateToGroup(
          `Full time scores \n\n ${fulltimeScores} \n\n${system.GROUP_INVITE}`
        );
      }

      logger.info('no liv fixtures in progress');
      if (!startingTimes.length > 0) {
        logger.info('now breaking');
        break;
      } else {
        const nextMatchStartsIn = parseInt(min(startingTimes) - parseInt(now));
        await utils.timeDelay(nextMatchStartsIn);
      }
    } else {
      logger.info('not empty');
      sendUpdateToGroup(
        `*SoccerBot Live Updates every 20-30 minutes* \n\n ${liveScores} \n\n` +
          system.GROUP_INVITE
      );
    }

    await utils.timeDelay(system.UPDATE_INTERVAL);
  } while (liveScores !== '' || !startingTimes.length > 0);
  logger.info('while loop broken');
  liveUpdateJob.stop();
  //});
};
const sendUpdateToGroup = async (message, caption) => {
  let groups =
    !system.NODE_ENV == 'local'
      ? await GroupsModel.find()
          .lean()
          .limit(2)
          .catch(err => {
            logger.info(err);
          })
      : await GroupsModel.find({ serialisedNumber: system.AMNESTYGROUP })
          .lean()
          .catch(err => {
            logger.info(err);
          });

  const maxDelayTimeInSecs = 97;
  const minDelayTimeInSecs = 33;
  const delayTime =
    (Math.random() * (maxDelayTimeInSecs - minDelayTimeInSecs) +
      minDelayTimeInSecs) *
    1000;
  await utils.timeDelay(delayTime);
  try {
    groups.forEach(async group => {
      client.sendMessage(group.serialisedNumber, message, caption ?? {});
      await utils.timeDelay(delayTime);
    });
  } catch (err) {
    logger.info(err);
  }
};
module.exports = { sendUpdateToGroup, scoresUpdate };
