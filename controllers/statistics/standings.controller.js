const axios = require('axios');
const system = require('../../constants/system');
const { sub, isBefore } = require('date-fns');
const logger = require('../../services/winston');

const getStandings = async league => {
  const options = {
    method: 'GET',
    url: `${system.FOOTBALL_API_URL}/standings`,
    params: {
      season: system.SEASON,
      league: league,
    },
    headers: system.REQUEST_HEADERS,
  };

  try {
    const response = await axios.request(options);
    if (response.data.response.length == 0) {
      return '';
    }
    const { id, name, season, standings, logo } = await response.data
      .response[0].league;
    const fourDaysAgo = sub(new Date(), { days: 4 });
    const isOlderThan4Days = isBefore(standings[0][0]['update'], fourDaysAgo);

    if (isOlderThan4Days) {
      logger.info('no recent update from' + name);
      return '';
    }
    const standingsMapped = standings
      .forEach(standing => {
        standing
          .map(ranking => {
            return `${ranking.rank}. *${ranking.team.name}*\n*M* ${ranking.all.played}  *W* ${ranking.all.win} *D* ${ranking.all.draw} *L* ${ranking.all.lose} *GD* ${ranking.goalsDiff}  Pts ${ranking.points}`;
          })
          .join('\n\n');
      })
      .join('\n\n\n\n');
    logger.info(standingsMapped);
    return {
      standings: `*${name} ${season} Standings*\n\n${standingsMapped}`,
      media: logo,
    };
  } catch (error) {
    logger.error(error);
    return '';
  }
};
module.exports = getStandings;
