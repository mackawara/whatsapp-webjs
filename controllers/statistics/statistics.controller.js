const axios = require('axios');
const system = require('../../constants/system');
const TopScorersModel = require('../../models/topScorers');
const logger = require('../../services/winston');
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
      logger.info(topScorer);
      const player = await TopScorersModel.findOne({ playerId, leagueId });

      if (!player) {
        logger.info('player not found');
        const saveNewTopScorer = new TopScorersModel(topScorer);
        await saveNewTopScorer
          .save()
          .then(result =>
            logger.info(`successfully saved new topscorer` + result)
          )
          .catch(err =>
            logger.info(`there was an error saving new Scorrer to DB ${err}`)
          );
      } else if (player) {
        logger.info('player');
        logger.info(player);
        await TopScorersModel.findOneAndUpdate(
          { playerId },
          { $set: topScorer },
          { new: true, runValidators: true }
        )
          .then(result => logger.info('succesfully updated' + result.playerId))
          .catch(err =>
            logger.info(`there was an error updating to DB ${err}`)
          );
      }
    });
  } catch (error) {
    logger.error(error);
  }
};
module.exports = getStatistics;
