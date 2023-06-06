//openai
const queryAndSave = require("./queryAndSave");
const contactsModel = require("../../models/contactsModel.js");
// keep track of token usage per day,best save in DB
// block brute forcers
//block rogue numbers
// check if existing number locally if not check on db

let chats = require("../../chats");
const openAiCall = async (prompt, chatID) => {
  const contacts = await contactsModel
    .find({ serialisedNumber: chatID })
    .exec();
  const contact = contacts[0];

  //check if there is an existing chat from that number and create if not

  if (!chats[chatID]) {
    console.log("no previous found");
    Object.assign(chats, {
      [chatID]: {
        messages: [{ role: "user", content: prompt }],
        calls: 0,
      },
    });
    console.log(chats);
  } else {
    console.log("found existing chat");
    chats[chatID].calls++;
    chats[chatID].messages.push({ role: "user", content: prompt });
  }

  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANISATION_KEY,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  let error;
  if (chats[chatID]["calls"] < 2) {
    const response = await openai
      .createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: chats[chatID]["messages"],
        temperature: 0.3,
        max_tokens: 250,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      })
      .catch((err) => {
        console.log("Error recorded " + err.response.data.error.message);
        console.log(err);
        error = err.response;
        return;
      });

    if ("data" in response) {
      chats[chatID]["calls"]++; // add call count
      chats[chatID].messages.push(response.data.choices[0]["message"]); //add system response to messages
      chats[chatID].messages.splice(0, chats[chatID].messages.length - 4); //trim messages and remain wit newest ones only
      console.log(chats[chatID].messages.length);
      contact.calls = parseInt(contact.calls) + 1;
      setTimeout(() => {
        chats[chatID]["calls"] = 0;
      }, 15000); // reset the calls in local store
      setTimeout(() => {
        chats[chatID]["message"] = [];
      }, 180000); // messages are forgotten after 30mins
      contact.tokens =
        parseInt(contact.tokens) + response.data.usage.total_tokens;
      contact.calls = parseInt(contact.calls) + 1;
      contact.save();
      return response.data.choices[0]["message"]["content"];
    } else {
      return error.message;
    }
  } else {
    contact.warnings = contact.warnings + 1;
    if (contact.warnings > 10) {
      contact.isBlocked = true;
    }

    try {
      contact.save();
    } catch (error) {
      console.log(error);
    }
    return "*Error!* too many requests made , please try later. You cannot make mutiple requests at the same time";
  }
};
module.exports = openAiCall;
