const axios = require("axios");
const fs = require("fs");
const queryDbNSave = require("./queryDbNSave");
const writeFile = require("./writeFile");
const readFile = require("./readFile");

const commentary = async (matchId) => {
  const res = await readFile("/../../testFile.json");
  const response = JSON.parse(res);

  const matchStatus = response.matchHeader.status,
    matchState = response.matchHeader.state,
    matchDesc = response.matchHeader.matchDescription,
    seriesname = response.matchHeader.seriesDesc,
    team1 = response.matchHeader.team1.name,
    team2 = response.matchHeader.team2.name,
    currRR = response.miniscore.currentRunRate,
    reqRR = response.miniscore.requiredRunRate
   // miniscore = response.miniscore
   // lastWicket = response.miniscore.lastWicket;

  let matchDetails = `${seriesname}, ${matchDesc} \n ${team1} vs ${team2}\nMatch status ${matchState}, ${matchStatus} \n  Current Run rate: ${currRR}, Req run rate ${reqRR}\n*Commentary*`;

  let commentary = [];
  commentary.push(matchDetails);
  response.commentaryList.forEach((comment) => {
    const overNumber = comment.overNumber ? comment.overNumber + ":" : "";

    const batttingTeam = comment.batTeamName;
    
    let commText = `${overNumber}${comment.commText}`;

    let score, summary;
    let boldValue;
    if (comment.commentaryFormats.bold) {
      boldValue = comment.commentaryFormats.bold.formatValue[0];
      commText = commText.replace("B0$", `*${boldValue}*`);
    }
    commentary.push(commText);
    if (comment.overSeparator) {
      const ovrSrt = comment.overSeparator;
      const miniScoreCard = `*End of over ${comment.overNumber}* Innings of ${batttingTeam} ${ovrSrt.score}-${ovrSrt.wickets}Batsmen :${ovrSrt.batStrikerNames[0]} ${ovrSrt.batStrikerRuns} runs off ${ovrSrt.batStrikerBalls} balls ,${ovrSrt.batNonStrikerNames[0]} ${ovrSrt.batNonStrikerRuns}runs off ${ovrSrt.batNonStrikerBalls} balls\n Bowler :${ovrSrt.bowlNames[0]} ${ovrSrt.bowlOvers} overs ${ovrSrt.bowlMaidens} Maidens ${ovrSrt.bowlRuns} runs ${ovrSrt.bowlWickets} wkts`;
      commentary.push(miniScoreCard);
    }
  });
  commentary = commentary.slice("0", "7").map((comment) => {
    return comment + "\n";
  });
  console.log(commentary.join("\n"));
};
module.exports = commentary;
