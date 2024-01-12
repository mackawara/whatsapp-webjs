const mongoose = require('mongoose');
const createIndexes = async models => {
  try {
    await Promise.all(
      models.map(model =>
        mongoose
          .model(model)
          .createIndexes()
          .then(result => console.log(result))
      )
    );
    console.log('Index update process completed.');
  } catch (error) {
    console.log('Error updating indexes:', error);
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
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
