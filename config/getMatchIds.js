const axios = require("axios");
const timeConverter = require("./helperFunction/timeConverter");
const fs = require("fs");
const { dirname } = require("path");
const matchIdmodel = require("../models/cricketMatchIds");
const queryAndSave = require("./helperFunction/queryDbNSave");

const getMatchIds = async (type, matchType) => {
  const options = {
    method: "GET",
    url: `https://cricbuzz-cricket.p.rapidapi.com/matches/v1/${type}`,
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPIKEY,
      "X-RapidAPI-Host": process.env.RAPIDAPIHOST,
    },
  };

  let matchesList = [];
  axios
    .request(options)
    .then(function (response) {
      if (response.data.typeMatches) {
        const matchesAll = response.data; //JSON.parse(dummyresult); // array of all matches split by typpe
        //console.log(matchesAll.typeMatches);

        matchesAll.typeMatches.forEach((match) => {
          if (match.matchType == matchType) {
            console.log(matchType);
            //console.log(match)
            // const matchFormat = match.seriesAdWrapper.matchFormat;
            const matchArr = match.seriesMatches;
            matchArr.forEach((match) => {
              if (match.seriesAdWrapper) {
                const matches = match.seriesAdWrapper.matches;
                matches.forEach((match) => {
                  const matchInfo = match.matchInfo;
                  const seriesName = matchInfo.seriesName;
                  const matchID = matchInfo.matchId;
                  const matchFormat = matchInfo.matchFormat;
                  const date = timeConverter(parseInt(matchInfo.startDate))[1];
                  const startTime = timeConverter(
                    parseInt(matchInfo.startDate)
                  )[0];
                  const team1 = matchInfo.team1.teamName;
                  const team2 = matchInfo.team2.teamName;

                  // matchesList.push(
                  const item = `${matchFormat} match:${team1} vs ${team2} \nStarting time: ${Date} \nMatchID : ${matchID}`;

                  const matchModel = new matchIdmodel({
                    fixture: `${team1} vs ${team2}`,
                    date: date,
                    matchID: matchID,
                    unixTimeStamp: matchInfo.startDate,
                    startingTime: startTime,
                    seriesName: seriesName,
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
