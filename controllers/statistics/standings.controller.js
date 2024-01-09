const axios = require('axios');
const system = require('../../constants/system');

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

    const { id, name, season, standings, logo, type } = await response.data
      .response[0].league;
    // console.log(id, name, season, standings);
    const lengthOfStandings = standings.length;
    const lastIndex = lengthOfStandings - 1;
    if (/cup/gi.test(type) || !standings[lastIndex].current) {
      return '';
    }
    const standingsMapped = standings[0]
      .map(ranking => {
        return `${ranking.rank}. *${ranking.team.name}*\n*M* ${ranking.all.played}  *W* ${ranking.all.win} *D* ${ranking.all.draw} *L* ${ranking.all.lose} *GD* ${ranking.goalsDiff}  Pts ${ranking.points}`;
      })
      .join('\n\n');
    console.log(standingsMapped);
    return {
      standings: `*${name} ${season} Standings*\n\n${standingsMapped}`,
      media: logo,
    };
    //  const { id, name, standings } = league;
    /*  const leagueStandings = standings.map(async rank => {
      return;
    }); */
    // console.log(rank, id, team, season);
  } catch (error) {
    console.error(error);
    return '';
  }
};
module.exports = getStandings;
