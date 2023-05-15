const axios = require("axios");

const checkMatchInfo = async (matchId) => {
  const options = {
    method: "GET",
    url: `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}`,
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPIKEY,
      "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
    },
  };

  const response = await axios.request(options).catch((error) => {
    console.error(error);
  });
  console.log(response);
  return response.matchInfo;
};
module.exports = checkMatchInfo;
