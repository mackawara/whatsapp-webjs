const fs = require("fs");
module.exports = writeFile = async (data, path) => {
  try {
    fs.writeFile(path, JSON.stringify(data), (err) => {
      console.log("successfully saved");
    });
  } catch (err) {
    console.log(err);
  }
};
