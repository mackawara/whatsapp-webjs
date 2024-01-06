const mongoose = require('mongoose');
const { isNumberObject } = require('util/types');

const leaguesSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false,
  },
  logo: { type: String, required: false },
  name: { type: String, required: false },
  leagueCountry: {
    type: String,
    required: true,
  },
  coverage: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  type: { type: String, required: false },
});
const LeaguesModel = mongoose.model('leagues', leaguesSchema);
module.exports = LeaguesModel;
