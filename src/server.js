const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database first
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Habit Tracker Server running on port ${PORT}`);
  });
});
