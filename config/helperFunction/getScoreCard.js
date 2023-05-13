const readFile = require("./readFile");
const sortObjectKeys = (obj, keyName) => {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = Object.fromEntries(
    sortedKeys.map((key) => [key, obj[key]])
  );
  return sortedObj;
};

const getScorecard = async (matchId) => {
  const axios = require("axios");

  const writeFile = require("./writeFile");

  const options = {
    method: "GET",
    url: `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/hscard`,
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPIKEY,
      "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
    },
  };
  const scoreCardObject = await axios
    .request(options)
    .then(async (res) => {
      //const scoreCardData = await res.data.scoreCard;
      const scoreObject = {};
      // const scoreCards = await readFile("/../../scorecard.json");
      //const scoreCard = JSON.parse(scoreCards).scoreCard;
      const scoreCard = await res.data.scoreCard;
      console.log(scoreCard);
      scoreCard.forEach(async (score) => {
        const innings = `Innings${score.inningsId}`;
        const lineItems = [];
        const teamName = score.batTeamDetails.batTeamName;
        const teamScore = `*${innings} ${teamName} ${score.scoreDetails.runs}-${score.scoreDetails.wickets} in ${score.scoreDetails.overs} overs*\n`;
        const batting = [];
        const bowling = [];
        lineItems.push(teamScore);

        let batsManData = score.batTeamDetails.batsmenData;
        batsManData = sortObjectKeys(batsManData);

        let bowlersData = score.bowlTeamDetails.bowlersData;
        bowlersData = sortObjectKeys(bowlersData);

        // console.log(Object.keys(batsManData));
        for (let batter in batsManData) {
          const batName = batsManData[batter]["batName"];
          const howOut = batsManData[batter]["outDesc"];
          const runs = batsManData[batter]["runs"];
          const balls = batsManData[batter]["balls"];
          const battingScoreCard = `*${batName}* ${howOut} *${runs}*(${balls})`;
          batting.push(battingScoreCard);
        }
        scoreObject[`${innings}Batting`] = batting.join("\n");
        lineItems.push(`\n*Innings ${innings} Bowling Analysis*`);
        for (let bowler in bowlersData) {
          const bowlerName = bowlersData[bowler]["bowlName"];
          const overs = bowlersData[bowler]["overs"];
          const runs = bowlersData[bowler]["runs"];
          const wickets = bowlersData[bowler]["wickets"];
          const economy = bowlersData[bowler]["economy"];
          const bowlingScorecard = `*${bowlerName}* Ov:${overs} Wkts:${wickets} Runs:${runs} Ec:${economy} `;
          bowling.push(bowlingScorecard);
        }
        scoreObject[`${innings}Bowling`] = bowling.join("\n");
      });
      console.log(scoreObject);
      return scoreObject;
    })
    .catch((error) => {
      console.error(error);
    });
  return scoreCardObject;
};
module.exports = getScorecard;
