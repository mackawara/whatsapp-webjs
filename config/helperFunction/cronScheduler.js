const cron=require("node-cron")

const cronScheduler=(minutes,hours,task)=>{
    
cron.schedule(
    `${minutes} ${hours} * * *`,
    () => {
      console.log("cron running");
      // client.sendMessage(tate, "test message");
      task
    },
    { scheduled: true, timezone: "UTC" }
  );
}
module.exports=cronScheduler