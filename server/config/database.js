const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    const dbUri = uri || process.env.MONGODB_URI;
    if (!dbUri) throw new Error('MONGODB_URI not defined');

    const conn = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📄 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
