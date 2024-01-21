const axios = require('axios');
const system = require('../../constants/system');
const LeaguesModel = require('../../models/leagues');
const logger = require('../../services/winston');
const getLeagues = async () => {
  const options = {
    method: 'GET',
    url: `${system.FOOTBALL_API_URL}/leagues`,
    // params: { id: '39' },
    headers: system.REQUEST_HEADERS,
  };

  try {
    const response = await axios.request(options);
    logger.info(response.data.response);
    response.data.response.forEach(async result => {
      const { country, seasons, league } = result;
      const { id, name, type, logo } = league;
      const lengthOfSeasons = seasons.length - 1;
      const coverage = seasons[lengthOfSeasons].coverage;
      const leagueCountry = country.name;
      const leaguedetails = {
        name,
        id,
        type,
        logo,
        coverage,
        leagueCountry,
      };
      const leagueNew = await LeaguesModel.findOne({ id });
      if (!leagueNew) {
        const saveNewLeague = new LeaguesModel(leaguedetails);
        await saveNewLeague
          .save()
          .then(result =>
            logger.info(`successfully saved new league` + result.name)
          )
          .catch(err =>
            logger.info(`there was an error saving new league to DB ${err}`)
          );
      } else if (leagueNew) {
        logger.info('league');

        await LeaguesModel.findOneAndUpdate(
          { id },
          { $set: leaguedetails },
          { new: true, runValidators: true }
        )
          .then(result => logger.info('succesfully updated' + result))
          .catch(err =>
            logger.info(`there was an error updating to DB ${err}`)
          );
      }
    });
  } catch (error) {
    logger.error(error);
  }
};
module.exports = getLeagues;
