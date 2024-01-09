const axios = require('axios');
const system = require('../../constants/system');
const { sub, isBefore } = require('date-fns');

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
    console.log(name, season, logo, id);
    // console.log(id, name, season, standings);
    /*  const lengthOfStandings = standings.length;
    const lastIndex = lengthOfStandings - 1; */
    const fourDaysAgo = sub(new Date(), { days: 4 });
    console.log(standings[0]['update']);
    const isOlderThan4Days = isBefore(standings[0][0]['update'], fourDaysAgo);
    console.log(isOlderThan4Days);
    /*  if (staans) {
      console.log('returning');
      return '';
    } */
    if (isOlderThan4Days) {
      console.log('no recent update');
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
