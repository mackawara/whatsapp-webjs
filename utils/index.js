const { max, getHours, min, getMinutes } = require('date-fns');

const matchStatusFormatter = (status, penalty, winner) => {
  //check if the match is finished or hasnt started

  if (/FT|NS/.test(status.short)) {
    return status.long;
  } else if (/1H|2H|HT|ET/i.test(status.short)) {
    return `In progress, ${status.long}, *${status.elapsed} mins played*`;
  } else if (/AET|PEN/i.test(status.short)) {
    let winningScore =
      penalty.home > penalty.away ? penalty.home : penalty.away;
    let losingScore = penalty.home < penalty.away ? penalty.home : penalty.away;

    return `${status.long} *${winner} won ${winningScore}-${losingScore}*`;
  } else if (/PST/.test(status.short)) {
    return `match postponed`;
  } else {
    return 'match status not available';
  }
};
const scoreFormatter = (score, matchStatus, home, away) => {
  if (matchStatus == 'Match Finished') {
    return `Full time ${score}`;
  } else if (matchStatus == 'Not Started') {
    return `${home} vs ${away}`;
  } else {
    return `${score}`;
  }
};
const timeDelay = ms => new Promise(res => setTimeout(res, ms));

const generateCronScheduleForgames = startingTimesUnix => {
  try {
    if (startingTimesUnix.length == 0) {
      return false;
    }
    // add fix for NaN
    const firstGame = min(startingTimesUnix);
    const mins = getMinutes(firstGame) ?? 0;
    const firstGameHours = getHours(firstGame) ?? 0;
    const cronString = `${mins} ${firstGameHours} * * *`;
    return cronString;
  } catch (err) {
    return false;
  }
};

module.exports = {
  scoreFormatter,
  matchStatusFormatter,
  timeDelay,
  generateCronScheduleForgames,
};
