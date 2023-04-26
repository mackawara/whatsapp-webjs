const axios = require("axios");
const timeConverter = require("./timeConverter");
const matchIdmodel = require("../../models/matchIdModel");
const queryAndSave = require("./queryAndSave");

const getMatchIds = async (type) => {
  console.log("get match ids runnong");
  matchIdmodel.deleteMany();

  const options = {
    method: "GET",
    url: `https://cricbuzz-cricket.p.rapidapi.com/matches/v1/${type}`,
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPIKEY,
      "X-RapidAPI-Host": process.env.RAPIDAPIHOST,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      if (response.data.typeMatches) {
        const matchesAll = response.data; //JSON.parse(dummyresult); // array of all matches split by typpe

        matchesAll.typeMatches.forEach((match) => {
          if (match.matchType) {
            const matchArr = match.seriesMatches;
            matchArr.forEach((match) => {
              if (match.seriesAdWrapper) {
                const matches = match.seriesAdWrapper.matches;
                matches.forEach((match) => {
                  const matchState = match.state;
                  const matchInfo = match.matchInfo;
                  const seriesName = matchInfo.seriesName;
                  const matchID = matchInfo.matchId;
                  const matchFormat = matchInfo.matchFormat;
                  const date = new Date(parseInt(matchInfo.startDate))
                    .toISOString()
                    .slice(0, 10);
                  const startTime = timeConverter(
                    parseInt(matchInfo.startDate)
                  )[0];
                  const team1 = matchInfo.team1.teamName;
                  const team2 = matchInfo.team2.teamName;

                  const item = `${matchFormat} match:${team1} vs ${team2} \nStarting time: ${Date} \nMatchID : ${matchID}`;

                  const matchModel = new matchIdmodel({
                    fixture: `${team1} vs ${team2}`,
                    date: date,
                    matchID: matchID,
                    unixTimeStamp: matchInfo.startDate,
                    startingTime: startTime,
                    seriesName: seriesName,
                    matchState: matchInfo.state,
                    matchType: matchInfo.matchFormat,
                  });
                  queryAndSave(matchIdmodel, matchModel, "matchID", matchID); // checks if there is existing
                  //  );
                });
              } else {
                console.log("NO MATCHES FOUND");
                return "Matches not  found";
              }
            });
            // const matchInfo = match.SeriesAdWrapper.matches;
          }
        });
      }
    })
    .catch(function (error) {
      console.error(error);
    });
};
module.exports = getMatchIds;
