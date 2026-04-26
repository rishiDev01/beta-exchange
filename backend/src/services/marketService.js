const axios = require('axios');
const { getIO } = require('../config/socket');

// Stocks we want to track
const stocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.0, change: 0 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.0, change: 0 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 150.0, change: 0 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 180.0, change: 0 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 170.0, change: 0 },
];

const fetchStockData = async () => {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || apiKey === 'your_finnhub_api_key_here') {
    // console.log('Finnhub API key not set, using simulated data');
    simulateData();
    return;
  }

  try {
    const io = getIO();
    const updatedStocks = await Promise.all(
      stocks.map(async (stock) => {
        try {
          const response = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${apiKey}`
          );
          const data = response.data;
          
          // c: Current price
          // d: Change
          if (data.c) {
            stock.price = parseFloat(data.c.toFixed(2));
            stock.change = parseFloat(data.d.toFixed(2));
          }
          return stock;
        } catch (error) {
          console.error(`Error fetching data for ${stock.symbol}:`, error.message);
          return stock;
        }
      })
    );

    io.emit('marketData', updatedStocks);
  } catch (error) {
    console.error('Error in fetchStockData:', error.message);
    simulateData();
  }
};

const simulateData = () => {
  const io = getIO();
  stocks.forEach((stock) => {
    const fluctuation = (Math.random() - 0.5) * 0.01;
    const changeAmount = stock.price * fluctuation;
    stock.price = parseFloat((stock.price + changeAmount).toFixed(2));
    stock.change = parseFloat(changeAmount.toFixed(2));
  });
  io.emit('marketData', stocks);
};

const startPriceSimulator = () => {
  // Initial fetch
  fetchStockData();
  
  // Update every 30 seconds (to respect free tier limits)
  setInterval(() => {
    fetchStockData();
  }, 30000);
};

const getHistoricalData = async (symbol, resolution = 'D') => {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || apiKey === 'your_finnhub_api_key_here') {
    // Generate some fake historical data if no API key
    return generateFakeHistory();
  }

  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 30 * 24 * 60 * 60; // 30 days ago
    const response = await axios.get(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`
    );
    
    if (response.data.s === 'ok') {
      return response.data.t.map((time, index) => ({
        time: time,
        open: response.data.o[index],
        high: response.data.h[index],
        low: response.data.l[index],
        close: response.data.c[index],
      }));
    }
    return generateFakeHistory();
  } catch (error) {
    console.error('Error fetching historical data:', error.message);
    return generateFakeHistory();
  }
};

const generateFakeHistory = () => {
  const data = [];
  let basePrice = 150;
  const now = Math.floor(Date.now() / 1000);
  for (let i = 30; i >= 0; i--) {
    const time = now - i * 24 * 60 * 60;
    const open = basePrice + (Math.random() - 0.5) * 10;
    const close = open + (Math.random() - 0.5) * 10;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    data.push({ time, open, high, low, close });
    basePrice = close;
  }
  return data;
};

module.exports = { startPriceSimulator, stocks, getHistoricalData };
