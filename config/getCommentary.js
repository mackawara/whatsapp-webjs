const axios = require("axios");
const fs = require("fs");
const queryDbNSave = require("./helperFunction/queryDbNSave");
const writeFile = require("./helperFunction/writeFile");
const readFile = require("./helperFunction/readFile");
const getCommentary = async (matchId) => {
  let latestComm, message;
  const options = {
    method: "GET",
    url: `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/comm`,
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPIKEY,
      "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
    },
  };
  let commentary = [];
  let matchComment = await axios.request(options).then(function (res) {
    const response = res.data;
    console.log(res.data);
    // writeFile(response.data, "testFile.json");
    let matchState, matchDesc, seriesname, team1, team2; //  const response=readFile("/../../testFile.json")
    if (response.matchHeader) {
      (matchStatus = response.matchHeader.status),
        (matchState = response.matchHeader.state),
        (matchDesc = response.matchHeader.matchDescription),
        (seriesname = response.matchHeader.seriesDesc),
        (team1 = response.matchHeader.team1.name),
        (team2 = response.matchHeader.team2.name);
    } else {
      matchStatus,
        matchState,
        matchDesc,
        seriesname,
        team1,
        (tean2 = response.matchHeader.state);
    }

    const currRR = response.miniscore
        ? response.miniscore.currentRunRate
        : "none",
      reqRR = response.miniscore ? response.miniscore.requiredRunRate : "none",
      miniscore = response.miniscore;
    // lastWicket = response.miniscore.lastWicket;
    let inningsList = response.miniscore
      ? miniscore.matchScoreDetails.inningsScoreList
      : [];
    inningsList = inningsList.map((innings) => {
      return `${innings.batTeamName} *${innings.score}-${innings.wickets}* ,${innings.overs} overs \n`;
    });
    let matchDetails = `*${seriesname}, ${matchDesc}* \n${team1} vs ${team2}\n\n*Match status* \n${inningsList.join(
      ""
    )} *${matchStatus}*\nCurr RR: *${currRR}*, Req RRate *${reqRR}*\n \n*Commentary*`;

    commentary.push(matchDetails);
    response.commentaryList.forEach((comment) => {
      const overNumber = comment.overNumber ? comment.overNumber + ":" : "";

      const batttingTeam = comment.batTeamName;

      let commText = `${overNumber}${comment.commText}`;

      let boldValue;
      const bold = /(B0\$|B1\$)/;
      if (comment.commentaryFormats.bold) {
        boldValue = comment.commentaryFormats.bold.formatValue[0];
        commText = commText.replace(bold, `*${boldValue}*`);
      }
      commentary.push(commText);
      if (comment.overSeparator) {
        const ovrSrt = comment.overSeparator;
        const miniScoreCard = `*End of over ${comment.overNumber}* Innings of ${batttingTeam} ${ovrSrt.score}-${ovrSrt.wickets}Batsmen :${ovrSrt.batStrikerNames[0]} ${ovrSrt.batStrikerRuns} runs off ${ovrSrt.batStrikerBalls} balls ,${ovrSrt.batNonStrikerNames[0]} ${ovrSrt.batNonStrikerRuns}runs off ${ovrSrt.batNonStrikerBalls} balls\n Bowler :${ovrSrt.bowlNames[0]} ${ovrSrt.bowlOvers} overs ${ovrSrt.bowlMaidens} Maidens ${ovrSrt.bowlRuns} runs ${ovrSrt.bowlWickets} wkts`;
        commentary.push(miniScoreCard);
      }
    });
    commentary = commentary.slice("0", "8").map((comment) => {
      return comment + "\n";
    });
    return commentary.join("\n");
  });
  /*  .catch(function (error) {
      console.error(error);
    }); */ return matchComment;
};
module.exports = getCommentary;
