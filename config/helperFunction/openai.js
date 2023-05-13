//openai
const openAiCall = async (prompt) => {
  console.log("openai called");
  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANISATION_KEY,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  const response = await openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0,
      max_tokens: 1000,
    })
    .catch((err) => {
      console.log(err);
    });
  return response.data.choices;
};
module.exports = openAiCall;
