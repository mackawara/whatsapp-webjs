const axios = require("axios");
const writeFile = require("./writeFile");
const readFile = require("./readFile");
const queryAndSave = require("./queryAndSave");

const getCricketHeadlines = async () => {
  console.log("cricket headlines");

  const cricHeadlinesModel = require("../../models/cricHeadlines");
  const options = {
    method: "GET",
    url: "https://cricbuzz-cricket.p.rapidapi.com/news/v1/index",
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPIKEY,
      "X-RapidAPI-Host": process.env.RAPIDAPIHOST,
    },
  };

  const response = await axios.request(options).catch((err) => {
    console.log(err);
  });
  console.log("testing");

  const storyList = await response.data.storyList;
  console.log(storyList);
  // const storyList = JSON.parse(response).storyList;

  storyList.forEach((story) => {
    if (story.story) {
      const context = story.story.context;
      const hline = story.story.hline;
      const intro = story.story.intro;
      const storyType = story.story.storyType;
      const source = story.story.source;
      const storyId = story.story.id;

      const newsStory = new cricHeadlinesModel({
        context: context,
        storyId: storyId,
        hline: hline,
        intro: intro,
        source: source,
        storyType: storyType,
        source: source,
        unixTimeStamp: story.story.pubTime,
        date: new Date(parseInt(story.story.pubTime))
          .toISOString()
          .slice(0, 10),
      });
      console.log(
        new Date(parseInt(story.story.pubTime)).toISOString().slice(0, 10)
      );
      queryAndSave(cricHeadlinesModel, newsStory, "storyId", storyId);
    }
  });
};
module.exports = getCricketHeadlines;
