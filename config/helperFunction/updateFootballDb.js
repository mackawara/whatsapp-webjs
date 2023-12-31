const axios = require('axios');
const { max, min, getHours, getMinutes, addDays, add } = require('date-fns');
const fixtureModel = require('../../models/footballFixtures');
const system = require('../../constants/system');

const { scoreFormatter, matchStatusFormatter } = require('../../utils/index');

/* only queries fixutres and scores for current */

const callFootballApi = async competition => {
  let league;
  if (/english premier|premiership|epl/i.test(competition)) {
    league = 39;
  } else if (/serie a|italy league/i.test(competition)) {
    league = 135;
  } else if (/liga|la liga/i.test(competition)) {
    league = 140;
  } else if (/zpsl|zimbabwe/i.test(competition)) {
    league = 401;
  } else if (/ucl|uefa|champions league/i.test(competition)) {
    league = 2;
  } else if (/europa/i.test(competition)) {
    league = 3;
  } else {
    league = competition;
  }

  const yday = new Date(system.YESTERDAY).toISOString().slice(0, 10);

  const sevenDaysFromNow = new Date(system.SEVEN_DAYS_FROM_NOW)
    .toISOString()
    .slice(0, 10);

  const options = {
    method: 'GET',
    url: `https://api-football-v1.p.rapidapi.com/v3/fixtures`,
    params: {
      from: yday,
      to: sevenDaysFromNow,
      season: 2023,
      league: competition,
    },
    headers: {
      'X-RapidAPI-Key': process.env.FOOTBALLAPIKEY,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
    },
  };

  const results = await axios
    .request(options)
    .then(response => {
      return response.data.response;
    })
    .catch(function (error) {
      console.error(error);
    });

  //writeFile(results, "callFootball.json");

  try {
    results.forEach(async result => {
      const leagues = [3, 2, 401, 135, 39, 140];

      if (leagues.includes(result.league.id)) {
        const time = new Date(
          result.fixture.timestamp * 1000
        ).toLocaleTimeString();

        const fixtureID = result.fixture.id;
        const leagueId = result.league.id;
        const venue = result.fixture.venue.name;
        const home = result.teams.home.name;
        const away = result.teams.away.name;
        const competition = `${result.league.name} ${result.league.season}`;
        const winner = result.teams.home.winner ? home : away;
        const round = result.league.round;
        const date = new Date(result.fixture.date).toISOString().slice(0, 10);
        const matchStatus = matchStatusFormatter(
          result.fixture.status,
          result.score.penalty,
          winner
        );
        const unixTimeStamp = result.fixture.timestamp;
        const penalties = result.score.penalty;
        const scoresHome = result.goals.home; //? result.goals.home : "";
        const scoresAway = result.goals.away; //? result.goals.home : "";
        const scores = ` ${home} ${scoresHome} vs ${scoresAway} ${away}`;
        const score = scoreFormatter(scores, matchStatus, home, away);

        const fixture = new fixtureModel({
          matchStatus: matchStatus,
          fixture: `${home} vs ${away}`,
          venue: venue,
          round: round,
          date: date,
          home: home,
          away: away,
          time: time,
          leagueId: leagueId,
          score: scores,
          fixtureID: fixtureID,
          competition: competition,
          unixTimeStamp: result.fixture.date,
        });

        //Save the api response to DB
        //check if the fixture is all in the DB and update otherwise create new fixture
        const queryAndSave = async function () {
          const result = await fixtureModel
            .findOne({
              fixtureID: fixtureID,
            })
            .exec();

          if (!result) {
            await fixture.save();
            console.log('now saved');
          } else {
            result.overwrite({
              matchStatus: matchStatus,
              fixture: `${home} vs ${away}`,
              venue: venue,
              round: round,
              date: date,
              home: home,
              away: away,
              time: time,
              leagueId: leagueId,
              score: score,
              fixtureID: fixtureID,
              competition: competition,
              unixTimeStamp: unixTimeStamp,
            });

            await result.save().then(() => {
              console.log('fixture updated');
            });
          }
        };

        queryAndSave();
        return unixTimeStamp;
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = callFootballApi;
