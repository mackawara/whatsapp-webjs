//openai

let chats = {};
const openAiCall = async (prompt, chatID) => {
  console.log(chats);
  if (!chats[chatID]) {
    Object.assign(chats, {
      [chatID]: {
        messages: [{ role: "user", content: prompt }],
      },
    });
    console.log(chats);
  } else {
    chats[chatID].messages.push({ role: "user", content: prompt });
  }
  console.log("openai called");
  console.log(chats[chatID]["messages"]);
  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANISATION_KEY,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  let error;
  const response = await openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: chats[chatID]["messages"],
      temperature: 0.3,
      max_tokens: 150,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    })
    .catch((err) => {
      console.log("Error recorded " + err.response.data.error);
      error = err.response.data.error;
    });
  if (response.data) {
    console.log("no errors");
    console.log(response.data.choices[0]["message"]);
    console.log(chats[chatID]["messages"]);
    chats[chatID].messages.push(response.data.choices[0]["message"]);
    console.log(chats);
    return response.data.choices[0]["message"]["content"];
  } else {
    return error.message;
  }
};
module.exports = openAiCall;
