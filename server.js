const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const routes = require('./routes/nodeMailerRoutes');

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());

const dbUrl = 'mongodb://localhost:27017/Hospital'; // Replace with your database URL

async function connectToMongoDB() {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongoDB();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});
db.on('reconnected', () => {
  console.log('Reconnected to MongoDB');
});

app.use('/api', routes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});