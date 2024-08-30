const mongoose = require('mongoose');

const dbUrl = 'mongodb://localhost:27017/Hospital'; // replace with your database URL

mongoose.connect(dbUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = mongoose;
