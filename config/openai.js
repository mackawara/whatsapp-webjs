const axios = require("axios");
const writeFile = require("./helperFunction/writeFile");
const callOpenAi = async () => {
  const options = {
    method: "POST",
    url: "https://openai80.p.rapidapi.com/chat/completions",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": process.env.RAPID,
      "X-RapidAPI-Host": "openai80.p.rapidapi.com",
    },
    data: '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello!"}]}',
  };
  let res;
  axios
    .request(options)
    .then(async function (response) {
      res = await response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
  writeFile(res, "openAi.json");
};
module.exports = callOpenAi;
