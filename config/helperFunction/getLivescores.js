const axios = require('axios');
const client = require('../wwebjsConfig');
const { matchStatusFormatter, scoreFormatter } = require('../../utils/index');
const system = require('../../constants/system');

/* only queries fixutres and scores for current */
const leagues = [3, 2, 401, 135, 39, 140];
const ids = leagues.join('-');
console.log(`these are the league ids` + ids);
const getLiveScores = async () => {
  try {
    const options = {
      method: 'GET',
      url: `${system.FOOTBALL_API_URL}/fixtures`,
      params: {
        live: ids,
        //live: 'all',
      },
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
      console.log(winner);
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
    console.log(liveScores.join('\n'));
    return liveScores.join('\n');
  } catch (err) {
    console.log(err);
    return '';
  }
};

module.exports = getLiveScores;