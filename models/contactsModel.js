const mongoose = require("mongoose");

const contactsSchema = new mongoose.Schema({
  date: {
    type: String,
    required: false,
  },
  isBloceked: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  notifyName: {
    type: String,
    required: true,
  },
  serialisedNumber: {
    type: String,
    required: true,
  },
  isSubscribed: {
    type: String,
    required: true,
  },
  tokens: {
    type: Number,
  },
});

const contactsModel = mongoose.model("contacts", contactsSchema);

module.exports = contactsModel;
