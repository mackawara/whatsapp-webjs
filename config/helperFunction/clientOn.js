const contactsModel = require("../../models/contactsModel");
const queryAndSave = require("./queryAndSave");
let messages = [];
const timeDelay = (ms) => new Promise((res) => setTimeout(res, ms));
const clientOn = async (client, arg1, arg2, MessageMedia) => {
  const fs = require("fs/promises");
  const me = process.env.ME;
  const contactsModel = require("../../models/contactsModel");
  //const { MessageMedia } = require("whatsapp-web.js");

  if (arg1 == "auth_failure") {
    client.on("auth_failure", (msg) => {
      // Fired if session restore was unsuccessful
      console.error("AUTHENTICATION FAILURE", msg);
    });
  }
  if (arg1 == "authenticated") {
    client.on("authenticated", async (session) => {
      console.log(`client authenticated`);
    });
  }
  const qrcode = require("qrcode-terminal");
  if (arg1 == "qr") {
    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
      console.log(qr);
    });
  }

  // let groupName, grpDescription;
  if (arg1 == "message") {
    client.on(`message`, async (msg) => {
      const chat = await msg.getChat();
      const contact = await msg.getContact();

      // console.log(chat);
      const msgBody = msg.body;

      if (/openAi:/gi.test(msgBody) && !chat.isGroup) {
        msgBody.split(" ").forEach(async (word) => {
          const keywords = {
            flags: ["porn", "xxx"],
          };

          if (keywords.flags.includes(word)) {
            console.log(msg);
            //do stuff
            msg.reply(
              `flagged words detected in your request please refrain from requesting adult content or cntent that promotes violence. If you believe you have been wrngly flagged please submit your text to us by prefixing you text with wrong flag`
            );
            return;
          }
        });
        const openAiCall = require("./openai");
        const prompt = await msgBody.replace(/openAi:/gi, "");
        //const timeStamp=new Date()
        const chatID = msg.from;
        const contacts = await contactsModel
          .find({ serialisedNumber: chatID })
          .exec();

        let serialisedNumber, notifyName, number;
        serialisedNumber = contact.id._serialized;
        notifyName = contact.pushname;
        number = contact.number;
        if (contacts.length < 1) {
          const newContact = new contactsModel({
            date: new Date().toISOString().slice(0, 10),
            isBlocked: false,
            number: number,
            notifyName: notifyName,
            serialisedNumber: serialisedNumber,
            isSubscribed: false,
            tokens: 0,
            warnings: 0,
            calls: 0,
          });
          await newContact.save();
        }

        let response = await openAiCall(prompt, chatID, client);
        // response = response[0].text;

        const signOff = `\n\n\n*Thank you ${notifyName}* for using this *trial version* brought to you buy Venta Tech. In this improved version you can chat to our Ai as you would to a person. Send all feedback/suggestions to 0775231426`;
        if (
          response ==
          "*Error!* too many requests made , please try later. You cannot make mutiple requests at the same time"
        ) {
          //const offender=new
          console.log("contact is in serious breach");
          const offender = await client.getContactById(serialisedNumber);
          console.log(offender);
          await offender.block();
          contacts[0].isBlocked
            ? await offender
                .block()
                .then(async () =>
                  client.sendMessage(
                    `263775231426@c.us`,
                    `contact ${chatID} has been blocked for infractions`
                  )
                )
            : msg.reply(response + signOff);
        } else {
          msg.reply(response + signOff);
        }

        // messages=[]
      }

      //queries chatGPT work in progress
      /* if (msgBody.includes("openAi")) {
        const response = await callOpenAi(msgBody);
        msg.reply(response);
      } */
    });
  }
  //run when group is left
};

module.exports = clientOn;
