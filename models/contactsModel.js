const mongoose = require("mongoose");

const contactsSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  }
});

const contactsModel = mongoose.model("contacts", contactsSchema);

module.exports = contactsModel;
