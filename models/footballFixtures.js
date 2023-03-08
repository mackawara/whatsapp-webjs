const mongoose = require("mongoose");

const fixtureSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  leagueId: {
    type: String,
    required: true,
  },
  home: {
    type: String,
    required: true,
  },
  away: {
    type: String,
    required: true,
  },
  fixture: {
    type: String,
    required: true,
  },
  competition: {
    type: String,
    required: true,
  },

  matchStatus: {
    type: String,
    required: true,
  },
  round: {
    type: String,
    required: true,
  },
  score: {
    type: String,
    required: true,
  },
  fixtureID: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

const fixtureModel = mongoose.model("fixture", fixtureSchema);

module.exports = fixtureModel;
