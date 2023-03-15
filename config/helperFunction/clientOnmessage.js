const me = process.env.ME;

const clientOnMessage = async (client, message) => {
  const contactModel = require("../../models/contactsModel");
  client.on(`${message}`, async (msg) => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    
    const contactVName=contact.verifiedName;
    const contactNumber=contact.number
    const serialisedNumber=contact.id._serialised
    const msgBody = msg.body;
    if (chat.isGroup) {
      const groupName = chat.name,
        grpDescription = chat.description,
        grpOwner = chat.owner.user;
      console.log(groupName, grpDescription, grpOwner);
    } else {
      let from = msg.from;
     
      let senderNotifyName = await contact.pushname;

      if (!contactModel.find({ number: from })) {
        const newContact = new contactModel({
          notifyName: senderNotifyName,
          number: from,
          serialisedNumber: contact.id._serialised,
          isBlocked:contact.isBlocked
        });
        newContact.save().then(() => console.log("saved"));
      }

      chat.sendSeen();
      msg.reply("hi thank you")
      client.sendMessage(
        me,
        `Hi ${senderNotifyName}, we will get back to you shortly`
      );
    }
  });
};

module.exports = clientOnMessage;
