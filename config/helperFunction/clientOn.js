const me = process.env.ME;
const getCommentary = require("../getCommentary");

const clientOn = async (client, arg1) => {
  const contactModel = require("../../models/contactsModel");

  if (arg1 == "message") {
    client.on(`${arg1}`, async (msg) => {
      const chat = await msg.getChat();
      const contact = await msg.getContact();

      const contactVName = contact.verifiedName;
      const contactNumber = contact.number;
      const serialisedNumber = contact.id._serialised;
      const msgBody = msg.body;
      if (chat.isGroup) {
        console.log(msg.body);
        /*  console.log(chat);
        console.log(msg); */
        const groupName = chat.name,
          grpDescription = chat.description;
        //grpOwner = chat.owner.user;

        const testRegex = new RegExp("matchId", "i");

        if (testRegex.test(msgBody.replaceAll(" ", ""))) {
          console.log("matchid receieved");
          // getCommentary()

          //get the math they want
          const matchId = msgBody
            .replace(/\s/g, "")
            .slice("8")
            .trim()
            .replace(":", "");
          const matchCommentary = await getCommentary(matchId); // check if message contains a req for ID

          msg.reply(matchCommentary); //do stuff
        }
      } else {
        let from = msg.from;

        let senderNotifyName = await contact.pushname;

        if (!contactModel.find({ number: from })) {
          const newContact = new contactModel({
            notifyName: senderNotifyName,
            number: from,
            serialisedNumber: contact.id._serialised,
            isBlocked: contact.isBlocked,
          });
          newContact.save().then(() => console.log("saved"));
        }

        chat.sendSeen();
        // msg.reply("hi thank you");
      }
    });
  }
  //run when group is left
  else if (arg1 == "group-leave") {
    client.on("group_leave", (notification) => {
      // User has left or been kicked from the group.
      const user = notification.id.participant;
      client.sendMessage(
        user,
        "we are sorry to see you leave the group, May you indly share wy you decided to leave"
      );
      client.sendMessage(me, `user just left  the group`);
    });
  } else if (arg1 == "group-join") {
    client.on("group_join", (notification) => {
      console.log("left gropu");
      // User has joined or been added to the group.
      console.log("join", notification);
      client.sendMessage(
        notification.id.participant,
        "welcome to ... Here are the group rules for your convenience.... \n"
      );
      notification.reply("User joined.");
    });
  }
};

module.exports = clientOn;
