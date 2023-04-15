const cron = require("node-cron");

const cronScheduler = async (minutes, hours, task) => {
    
  cron.schedule(
    `${minutes} ${hours} * * *`,
    function () {
      console.log("running");
      try {
        task();
        
      } catch (error) {
        console.error(error);
      }
    },
    { scheduled: true, timezone: "UTC" }
  );
};
module.exports = cronScheduler;
