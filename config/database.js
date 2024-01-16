const mongoose = require('mongoose');
const logger = require('../services/winston');
const createIndexes = async models => {
  try {
    await Promise.all(
      models.map(model =>
        mongoose
          .model(model)
          .createIndexes()
          .then(result => logger.info(result))
      )
    );
    logger.info('Index update process completed.');
  } catch (error) {
    logger.info('Error updating indexes:', error);
  }
};
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const models = await mongoose.modelNames();
    await createIndexes(models);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
