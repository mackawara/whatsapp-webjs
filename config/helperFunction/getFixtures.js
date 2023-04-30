const FixtureModel = require("../../models/footballFixtures");
const moment = require("moment");
var date = moment();
const englishPremier = new RegExp("epl", "i");
const laLiga = new RegExp("La liga", "i");
const serieA = new RegExp("Serie A", "i");
const zpsl = new RegExp("ZPSL", "i");
const europa = new RegExp("Europa", "i");
const uefa = new RegExp("ucl", "i");
//Fetches fixtures from datatbase
const getFixtures = async (competition, status) => {
  console.log("get fixtures running");
  let league;
  if (englishPremier.test(competition)) {
    league = 39;
  } else if (serieA.test(competition)) {
    league = 135;
  } else if (laLiga.test(competition)) {
    league = 140;
  } else if (zpsl.test(competition)) {
    league = 401;
  } else if (europa.test(competition)) {
    league = 3;
  } else if (uefa.test(competition)) {
    league = 2;
  }
  const slash = new RegExp("/", "g");
  const date = new Date().toLocaleDateString().replace(slash, "-");
  const message = [];
  const testRegex = new RegExp(`${status}`, "i", "g");
  const fixtures = await FixtureModel.find({
    //  matchStatus: "Not Started",
    leagueId: league,
    date: new Date().toISOString().slice(0, 10),
    matchStatus: testRegex, // find matches that match the status
  }).exec();
  let comp, round;
  if (fixtures.length > 0) {
    fixtures.forEach((fixture) => {
      const line = `Kickoff: ${fixture.time} *${fixture.score.trim()}* \n ${
        fixture.matchStatus
      }\n`;
      comp = fixture.competition;
      round = fixture.round.slice("-2");
      message.push(line);
    });
    const formatted = `${comp} MatchDay:${round} \n${message.join("")}`;

    return formatted;
  } else {
    return ""; // return empty string if no matching fixtures
  }
};
module.exports = getFixtures;
