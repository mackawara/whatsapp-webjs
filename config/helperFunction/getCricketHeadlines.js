const axios = require("axios");
const writeFile = require("writeFile");
const getCricketHeadlines = async () => {
  console.log("get cricket headlines running");
  const options = {
    method: "GET",

    url: 'https://cricbuzz-cricket.p.rapidapi.com/news/v1/index',
    headers: {
      "content-type": "application/octet-stream",
      "X-RapidAPI-Key": process.env.RAPIDAPIKEY,
      "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    writeFile(response.data, "headlines.json");
  } catch (error) {
    console.error(error.data);
  }
};
module.exports = getCricketHeadlines;
