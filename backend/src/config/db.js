const mongoose = require('mongoose');
const Log = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    Log('info', 'db', `MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    Log('error', 'db', `Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
