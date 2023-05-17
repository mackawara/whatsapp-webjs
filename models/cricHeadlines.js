const mongoose = require("mongoose");

const cricketHeadlinesSchema = new mongoose.Schema({
  context: {
    type: String,
    required: false,
  },
  storyId: {
    type: String,
    required: true,
  },

  hline: {
    type: String,
    required: true,
  },
  intro: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  unixTimeStamp: {
    type: String,
    required: true,
  },
});

const headlinesModel = mongoose.model("cricheadlines", cricketHeadlinesSchema);

module.exports = headlinesModel;
