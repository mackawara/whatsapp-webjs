const mongoose = require("mongoose");

const matchIdSchema = new mongoose.Schema({
  date: {
    type: String,
    required: false,
  },
  matchState: {
    type: String,
    required: true,
  },
  matchStatus: {
    type: String,
    required: true,
  },
  matchType: {
    type: String,
    required: true,
  },
  matchID: {
    type: String,
    required: true,
  },
  startingTime: {
    type: String,
    required: true,
  },
  seriesName: {
    type: String,
    required: true,
  },
  unixTimeStamp: {
    type: String,
    required: true,
  },
  fixture: {
    type: String,
    required: true,
  },
});

const matchIdModel = mongoose.model("matchId", matchIdSchema);

module.exports = matchIdModel;
