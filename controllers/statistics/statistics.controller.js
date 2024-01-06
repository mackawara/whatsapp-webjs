const axios = require('axios');
const system = require('../../constants/system');
const TopScorersModel = require('../../models/topScorers');
const topScorersModel = require('../../models/topScorers');
const getStatistics = async (league, stat) => {
  const options = {
    method: 'GET',
    url: `${system.FOOTBALL_API_URL}/${stat}`,
    params: {
      league: league,
      season: system.SEASON,
    },
    headers: system.REQUEST_HEADERS,
  };

  try {
    const response = await axios.request(options);
    response.data.response.forEach(async data => {
      const { photo: playerPhoto, id: playerId, age, name } = data.player;
      const {
        goals,
        passes,
        dribbles,
        cards,
        fouls,
        team,
        tackles,
        games,
        league,
        shots,
      } = data.statistics[0];

      const { total: goalsScored, assists } = goals;
      const { name: leagueName, id: leagueId, country, season } = league;
      const {
        appearences: appearences,
        minutes: minutesPlayed,
        position,
        rating,
      } = games;
      const { success: successfulDribbles, attempts: attemptedDribbles } =
        dribbles;
      const {
        accuracy: passAccuracy,
        key: keyPasses,
        total: totalPasses,
      } = passes;
      const { on: shotsOnTarget, total: totalShots } = shots;
      const { blocks, interceptions, total: totalTackles } = tackles;
      const { red, yellow, yellowred } = cards;
      const { id: teamId, name: teamName } = team;
      const { committed: foulsCommited, drawn: foulsDrawn } = fouls;

      //savetoDB Top scorers

      const topScorer = {
        leagueId,
        leagueName,
        country,
        season,
        appearences,
        minutesPlayed,
        goalsScored,
        assists,
        rating,
        shotsOnTarget,
        totalShots,
        teamName,
        totalPasses,
        playerPhoto,
        playerId,
        name,
      };
      console.log(topScorer);
      const player = await TopScorersModel.findOne({ playerId, leagueId });

      if (!player) {
        console.log('player not found');
        const saveNewTopScorer = new TopScorersModel(topScorer);
        await saveNewTopScorer
          .save()
          .then(result =>
            console.log(`successfully saved new topscorer` + result)
          )
          .catch(err =>
            console.log(`there was an error saving new Scorrer to DB ${err}`)
          );
      } else if (player) {
        console.log('player');
        console.log(player);
        await TopScorersModel.findOneAndUpdate(
          { playerId },
          { $set: topScorer },
          { new: true, runValidators: true }
        )
          .then(result => console.log('succesfully updated' + result.playerId))
          .catch(err =>
            console.log(`there was an error updating to DB ${err}`)
          );
      }
    });
  } catch (error) {
    console.error(error);
  }
};
module.exports = getStatistics;
