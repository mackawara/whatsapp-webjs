const mongoose = require("mongoose");
const dbString=process.env.DB_STRING

const connectDB = async () => {
  try {
    console.log(dbString)
    const conn = await mongoose.connect(process.env.DB_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
