const FixtureModel = require("../../models/footballFixtures");
const moment = require("moment");
var date = moment();
const englishPremier = new RegExp("epl", "i");
const laLiga = new RegExp("La liga", "i");
const serieA = new RegExp("Serie A", "i");
const zpsl = new RegExp("ZPSL", "i");
const uefa=new RegExp("ucl", "i")
//Fetches fixtures from datatbase
const getFixtures = async(competition,status)=> {
  let league;
  if (englishPremier.test(competition)) {
    league = 39;
  } else if (serieA.test(competition)) {
    league = 135;
  } else if (laLiga.test(competition)) {
    league = 140;
  } else if (zpsl.test(competition)) {
    league = 401;
  }
  else if(uefa.test(competition)){
    league=2;
  }
  const message = [];
  const fixtures = await FixtureModel.find({
    matchStatus: "Not Started",
    leagueId: league,
  }).exec();
  let comp, round;
  fixtures.forEach((fixture) => {
    const line = `${fixture.date} *${fixture.home} vs${fixture.away}* ${fixture.time} \n`;
    comp = fixture.competition;
    round = fixture.round;
    message.push(line);
  });
  const formatted = `AllSports Update :\n ${comp}\n round:${round} \n ${message.join(" ")}\n  ,*To recieve league fixtures*, Send *league: name of league*  to +263715248036 as shown below  \n For English premier league fixtures, send: *league: Epl* \n For La liga send *league: La liga* etc. \n Brought to you by All sports`;
  return formatted;
};
module.exports = getFixtures;
