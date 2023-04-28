const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  mimetype: {
    type: String,
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: false,
  },
  filesize: {
    type: String,
    required: true,
  },
});

const mediaModel = mongoose.model("media", mediaSchema);

module.exports = mediaModel;
