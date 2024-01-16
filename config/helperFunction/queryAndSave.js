const logger = require('../../services/winston');

const queryAndSave = async function (model, item, queryString, itemId) {
  const stringified = `${queryString}`;

  const result = await model
    .find({
      [queryString]: itemId,
    })
    .exec();

  if (result.length < 1) {
    try {
      item.save().then(() => logger.log('now saved'));
    } catch (error) {
      logger.error(error);
    }
  } else {
    logger.log('item saved already');
  }
};
module.exports = queryAndSave;
