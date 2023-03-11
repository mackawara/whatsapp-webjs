const clientOnMessage=async(client,message)=>{

    client.on(`${message}`, async (message) => {
        console.log(client,message)
        const messageContents = message.body;
        const author = message.from.replace("@c.us", "");
        const receiver = message.to.replace("@c.us", "").replace("263", "0");
        const keywords = require("./keywords");
        const usdKeywords = keywords.usdKeyword;
        const businessKeywords = keywords.businessKeywords;
    
        usdKeywords.filter((keyword) => {
          if (
            message.body.includes(keyword) &&
            !message.body.includes(`message created by chatBot`)
          ) {
            client.sendMessage(
              me,
              `${toTime(message.timestamp)}  at ${
                message.from
              } group :message from :${message.author
                .replace("@c.us", "")
                .replace("263", "0")}, ${message.notifyName} ${
                message.body
              } *message created by chatBot*`
            );
          }
        });
    
        /*   let usdAlert = new keywordAlert(
              usdKeywords,
              client,
              message,
              amnestyinternational
            ); */
        //usdAlert.keywordRun(message.body);
    
        let businessAlert = new keywordAlert(businessKeywords, client, message, me);
        businessAlert.keywordRun(message.body);
      })
};


  module.exports=clientOnMessage