const fs = require('fs');
const logger = require('../../services/winston');
logger;
const writeFile = async (data, path) => {
  try {
    fs.writeFile(path, JSON.stringify(data), err => {
      logger.info('successfully saved');
    });
  } catch (err) {
    logger.info(err);
  }
};
module.exports = writeFile;
