const axios = require("axios");
const timeConverter = require("./timeConverter");
const matchIdModel = require("../../models/matchIdModel");
const queryAndSave = require("./queryAndSave");
const getMatchIds = async (type, calls) => {
  calls = calls + 1;
  console.log("there have been " + calls + " call to cricbuz");
  if (calls > 80) {
    return;
  }
  let matches = [];
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
        const International = /International/gi;
        const League = /League/gi;
        matchesAll.typeMatches.forEach(async (match) => {
          if (
            International.test(match.matchType) ||
            League.test(match.matchType)
          ) {
            console.log(match.matchType + " match found");
            const matchArr = match.seriesMatches;
            matchArr.forEach((match) => {
              if (match.seriesAdWrapper) {
                const matches = match.seriesAdWrapper.matches;
                matches.forEach(async (match) => {
                  const matchInfo = match.matchInfo;
                  const matchState = matchInfo.state;
                  const matchStatus = matchInfo.status;
                  const seriesName = matchInfo.seriesName;
                  const matchID = matchInfo.matchId;
                  const matchFormat = matchInfo.matchFormat;
                  console.log(matchState, matchStatus, matchInfo);
                  const date = new Date(parseInt(matchInfo.startDate))
                    .toISOString()
                    .slice(0, 10);
                  const startTime = timeConverter(
                    parseInt(matchInfo.startDate)
                  )[0];
                  const team1 = matchInfo.team1.teamName;
                  const team2 = matchInfo.team2.teamName;

                  const item = `${matchFormat} match:${team1} vs ${team2} \nStarting time: ${Date} \nMatchID : ${matchID}`;

                  const matchModel = new matchIdModel({
                    fixture: `${team1} vs ${team2}`,
                    date: date,
                    matchID: matchID,
                    unixTimeStamp: matchInfo.startDate,
                    startingTime: startTime,
                    seriesName: seriesName,
                    matchState: matchState,
                    matchType: matchInfo.matchFormat,
                    matchStatus: matchInfo.status,
                  });
                  const result = await matchIdModel
                    .find({ matchID: matchID })
                    .exec();
                  // check if match is already saved
                  if (result.length > 0) {
                    try {
                      result.forEach(async (match) => {
                        await match.overwrite({
                          fixture: `${team1} vs ${team2}`,
                          date: date,
                          matchID: matchID,
                          unixTimeStamp: matchInfo.startDate,
                          startingTime: startTime,
                          seriesName: seriesName,
                          matchState: matchState,
                          matchType: matchInfo.matchFormat,
                          matchStatus: matchStatus,
                        });
                        await matchModel
                          .save()
                          .then(() => console.log("new match saved"))
                          .catch((err) => console.log(err));
                      });
                    } catch (error) {
                      console.error(error);
                    }
                  } else {
                    await matchModel
                      .save()
                      .then(() => console.log("new match saved"))
                      .catch((err) => console.log(err));
                  }
                });
              } else {
                console.log("NO MATCHES FOUND");
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
  return matches;
};
module.exports = getMatchIds;
