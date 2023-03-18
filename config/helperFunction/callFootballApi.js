const axios = require("axios");
const fixtureModel = require("../../models/footballFixtures");
const todayDate = new Date().toISOString().slice(0, 10);

/* only queries fixutres and scores for current */
const englishPremier = new RegExp("epl", "i");
const laLiga = new RegExp("La liga", "i");
const serieA = new RegExp("Serie A", "i");
const zpsl = new RegExp("ZPSL", "i");
const uefa = new RegExp("ucl", "i");
const europa = new RegExp("Europa", "i");
const callFootballApi = async (competition) => {
  console.log("api fottnall called");
  let league;
  if (englishPremier.test(competition)) {
    league = 39;
  } else if (serieA.test(competition)) {
    league = 135;
  } else if (laLiga.test(competition)) {
    league = 140;
  } else if (zpsl.test(competition)) {
    league = 401;
  } else if (uefa.test(competition)) {
    league = 2;
  } else if (europa.test(competition)) {
    league = 3;
  }

  const options = {
    method: "GET",
    url: `https://api-football-v1.p.rapidapi.com/v3/fixtures`,
    params: {
      league: league,
      // current: true,
      season: "2022",
      date: todayDate,

      timezone: "Africa/Harare",
    },
    headers: {
      "X-RapidAPI-Key": process.env.FOOTBALLAPIKEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  };

  const matchStatusFormatter = (matchStatus, penalty, winner) => {
    //check if the match is finished or hasnt started
    const inProgress = /1H|2H|HT|ET/;
    const matchFinishedNotStarted = /FT|NS/;
    const postponed = /PST/;
    const afterEtPen = /AET|PEN/;
    if (matchFinishedNotStarted.test(matchStatus.short)) {
      return matchStatus.long;
    } else if (inProgress.test(matchStatus.short)) {
      return `In progress,${matchStatus.long}, ${matchStatus.elapsed} minutes played`;
    } else if (afterEtPen.test(matchStatus.short)) {
      let winningScore =
        penalty.home > penalty.away ? penalty.home : penalty.away;
      let losingScore =
        penalty.home < penalty.away ? penalty.home : penalty.away;

      return `${matchStatus.long} *${winner} won ${winningScore}-${losingScore}*`;
    } else if (postponed.test(matchStatus.short)) {
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
      console.log(response.data.response);
      return response.data.response;
    })
    .catch(function (error) {
      console.error(error);
    });

  try {
    results.forEach(async (result) => {
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
      const scoresHome = result.goals.home ? result.goals.home : "";
      const scoresAway = result.goals.home ? result.goals.home : "";
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
        score: score,
        fixtureID: fixtureID,
        competition: competition,
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
          fixtureModel.findOneAndUpdate(
            { fixtureID: fixtureID },
            {
              date: date,
              matchStatus: matchStatus,
              score: score,
              round: round,
              fixture: `${fixture.home} vs ${fixture.away}`,
            } /* ,
            (error, data) => {
              if (error) {
                console.log(error);
              } else {
                console.log(data);
              }
            } */
          );
        }
      };
      queryAndSave();
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = callFootballApi;
