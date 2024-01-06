const mongoose = require('mongoose');

const GroupsSchema = new mongoose.Schema({
  date: {
    type: String,
    required: false,
  },
  product: { type: String, required: false },

  group: { type: String, required: false },
  notifyName: {
    type: String,
    required: false,
  },
  serialisedNumber: {
    type: String,
    required: true,
    Unique: true,
  },
});

const GroupsModel = mongoose.model('groups', GroupsSchema);

module.exports = GroupsModel;
