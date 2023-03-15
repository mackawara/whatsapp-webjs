const clientOnMessage = async (client, message) => {
  const contactModel = require("../../models/contactsModel");
  client.on(`${message}`, async (message) => {
    const chat = await message.getChat();
    const contact = await message.getContact();
    const messageBody = message.body;
    if (chat.isGroup) {
      const groupName = chat.name,
        grpDescription = chat.description,
        grpOwner = chat.owner.user;
      console.log(groupName, grpDescription, grpOwner);
    } else {
      let number = message.body.split(" ")[1];
      let messageIndex = message.body.indexOf(number) + number.length;
      let message = message.body.slice(messageIndex, message.body.length);
      number = number.includes("@c.us") ? number : `${number}@c.us`;

      chat.sendSeen();
      client.sendMessage(number, message);
    }
  });
};

module.exports = clientOnMessage;
