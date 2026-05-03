require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { startPriceSimulator, initializeStocks } = require('./services/marketService');

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Initialize and Start Market Data Simulator
const startMarket = async () => {
  await initializeStocks();
  startPriceSimulator();
};

startMarket();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
