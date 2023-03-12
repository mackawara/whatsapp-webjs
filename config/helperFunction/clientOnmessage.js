const clientOnMessage=async(client,message)=>{

    client.on(`${message}`, async (message) => {
        const contact=await message.getContact().BusinessContact
        console.log(contact)
        const messageContents = message.body;
        const author = message.from.replace("@c.us", "");
        const receiver = message.to.replace("@c.us", "").replace("263", "0");
       
        })};


  module.exports=clientOnMessage