const axios = require('axios');
const { client } = require('../wwebjsConfig');
const { matchStatusFormatter, scoreFormatter } = require('../../utils/index');
const system = require('../../constants/system');
const logger = require('../../services/winston');

const getLiveScores = async ({ type, fixtures, date }) => {
  const ids = system.LEAGUES_FOLLOWED.join('-');
  let params;
  if (type === 'live') {
    logger.info(ids);
    params = {
      live: ids,
    };
  } else if (fixtures) {
    params = {
      ids: fixtures.join('-'),
    };
  } else if (date) {
    params = {
      from: date,
    };
  }
  logger.info(params);
  try {
    const options = {
      method: 'GET',
      url: `${system.FOOTBALL_API_URL}/fixtures`,
      params: params,
      headers: system.REQUEST_HEADERS,
    };

    const response = await axios.request(options);
    const results = response.data.response;

    const liveScores = results.map(result => {
      const home = result.teams.home.name;
      const away = result.teams.away.name;
      const competition = `${result.league.name} ${result.league.season}`;
      // const goals = result.goals;

      const goalsHome = result.goals.home ?? '';
      const winner = result.teams.home.winner
        ? result.teams.home
        : result.teams.away.winner
        ? result.teams.away
        : false;
      const matchStatus = matchStatusFormatter(
        result.fixture.status,
        result.score.penalty,
        winner
      );
      const goalsAway = result.goals.away ?? '';
      const scores = `${home} ${goalsHome} vs ${goalsAway} ${away}`;
      const formattedScoreline = scoreFormatter(
        scores,
        matchStatus,
        home,
        away
      );
      return `${competition} *${scores}*  ${matchStatus} \n`;
    });
    return liveScores.join('\n');
  } catch (err) {
    logger.info(err);
    return '';
  }
};

module.exports = getLiveScores;
