const axios = require("axios");
const fixtureModel = require("../../models/footballFixtures");
const todayDate = new Date().toISOString().slice(0, 10);
const writeFile = require("./writeFile");
/* only queries fixutres and scores for current */

const callFootballApi = async (competition) => {
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

  const options = {
    method: "GET",
    url: `https://api-football-v1.p.rapidapi.com/v3/fixtures`,
    params: {
      // league: league,
      //live: "all",
      // current: true,
      //season: "2022",
      date: todayDate,
      // timezone: "Africa/Harare",
    },
    headers: {
      "X-RapidAPI-Key": process.env.FOOTBALLAPIKEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  };

  const matchStatusFormatter = (matchStatus, penalty, winner) => {
    //check if the match is finished or hasnt started

    if (/FT|NS/.test(matchStatus.short)) {
      return matchStatus.long;
    } else if (/1H|2H|HT|ET/i.test(matchStatus.short)) {
      return `In progress, ${matchStatus.long}, *${matchStatus.elapsed} mins played*`;
    } else if (/AET|PEN/i.test(matchStatus.short)) {
      let winningScore =
        penalty.home > penalty.away ? penalty.home : penalty.away;
      let losingScore =
        penalty.home < penalty.away ? penalty.home : penalty.away;

      return `${matchStatus.long} *${winner} won ${winningScore}-${losingScore}*`;
    } else if (/PST/.test(matchStatus.short)) {
      return `match postponed`;
    } else {
      return "match status not available";
    }
  };
  const scoreFormatter = (score, matchStatus, home, away) => {
    if (matchStatus == "Match Finished") {
      return `Full time ${score}`;
    } else if (matchStatus == "Not Started") {
      return `${home} vs ${away}`;
    } else {
      return score;
    }
  };
  const results = await axios
    .request(options)
    .then((response) => {
      return response.data.response;
    })
    .catch(function (error) {
      console.error(error);
    });
  //writeFile(results, "callFootball.json");

  try {
    results.forEach(async (result) => {
      //  console.log(result.league.name.replaceAll(" ", ""));
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
        const goals = result.goals;
        const winner = result.teams.home.winner ? home : away;
        const round = result.league.round;
        const date = result.fixture.date.slice(0, 10);
        const matchStatus = matchStatusFormatter(
          result.fixture.status,
          result.score.penalty,
          winner
        );

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
          unixTimeStamp: result.fixture.timestamp,
        });

        //Save the api response to DB
        //check if the fixture is all in the DB and update otherwise create new fixture
        const queryAndSave = async function () {
          const result = await fixtureModel
            .find({
              fixtureID: fixtureID,
            })
            .exec();

          if (result.length < 1) {
            fixture.save().then(() => console.log("now saved"));
          } else {
            const fixtureFound = await fixtureModel.find({
              fixtureID: fixtureID,
            });
            fixtureFound[0].overwrite({
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
              unixTimeStamp: result.fixture.timestamp,
            });

            await fixtureFound[0].save().then(() => {
              console.log("fixture updated");
            });
          }
        };

        queryAndSave();
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = callFootballApi;