const mongoose = require('mongoose');

const topScorersSchema = new mongoose.Schema({
  leagueId: {
    type: Number,
    required: false,
  },
  leagueName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  season: {
    type: Number,
    required: true,
  },

  goalsScored: {
    type: Number,
    required: true,
  },
  assists: {
    type: Number,
    // required: true,
  },

  name: {
    type: String,
    required: true,
  },
  teamName: {
    type: String,
    required: true,
  },
  appearences: {
    type: Number,
    required: true,
  },
  appearences: {
    type: Number,
    required: true,
  },
  playerId: {
    type: Number,
    required: true,
    // unique: true,
  },
  playerPhoto: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: false,
  },
  teamName: {
    type: String,
    required: true,
  },
  totalShots: {
    type: Number,
    required: false,
  },
  shotsOnTarget: {
    type: Number,
    required: false,
  },
});

const topScorersModel = mongoose.model('topScorers', topScorersSchema);

module.exports = topScorersModel;
