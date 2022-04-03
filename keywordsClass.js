const { LegacySessionAuth } = require("whatsapp-web.js");

function toTime(UNIX_timestamp) {
  const a = new Date(UNIX_timestamp * 1000);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const date = a.getDate();
  const hour = a.getHours();
  const min = a.getMinutes();
  const sec = a.getSeconds();
  const time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time;
}

function keywordAlert(keywordsArray, client, messageObject, contact) {
  this.keywordsArray = keywordsArray;
  //  this.messageResponse = messageResponse
  this.client = client;
  this.messageObject = messageObject;

  this.processResponse = (munhu) => {
    client.sendMessage(
      munhu,
      `${toTime(messageObject.timestamp)}  \n ${messageObject.from.replace(
        `263`,
        `0`
      )} \n group :message from :${messageObject.author}, \n  Message *_${
        messageObject.body
      }_* \n *message created by chatBot`
    );
  };
  this.keywordRun = async function (message) {
    for (let index = 0; index < keywordsArray.length; index++) {
      const keyword = keywordsArray[index];

      if (message.includes(keyword)) {
        console.log(`message received  with keyword`);
        this.processResponse(contact);
        break;
      }
    }
  };
  //};
}

module.exports = keywordAlert;
