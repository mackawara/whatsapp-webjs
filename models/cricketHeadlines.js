const mongoose = require("mongoose");

const cricketHeadlinesSchema = new mongoose.Schema({
  date: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: true,
  },
  UnixTimeStamp: {
    type: String,
    required: true,
  },

  headline: {
    type: String,
    required: true,
  },
  snippet: {
    type: String,
    required: true,
  },
});

const headlinesModel = mongoose.model("matchId", cricketHeadlinesSchema);

module.exports = headlinesModel;
