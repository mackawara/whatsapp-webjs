const cronScheduler = require("./dailyCronScheduler");

const callCricbuzz = async (league, matchID) => {
  const options = {
    method: "GET",
    url: "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming",
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPIKEY,
      "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
    },
  };

  const results = await axios
    .request(options)
    .then((response) => {
      return response; // do the repsonse
    })
    .catch(function (error) {
      console.error(error);
    });
};
