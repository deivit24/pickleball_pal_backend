const mongoose = require('mongoose');

const { db } = require('./config');
// const db = config.get('MONGO_URI');
// const db = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    console.log('MongoDb Connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
