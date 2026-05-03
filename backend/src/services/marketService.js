const axios = require('axios');
const { getIO } = require('../config/socket');

// Initial symbols to track. All values (price, name, change) will be fetched dynamically.
const stocks = [
  { symbol: 'AAPL' },
  { symbol: 'MSFT' },
  { symbol: 'GOOGL' },
  { symbol: 'AMZN' },
  { symbol: 'TSLA' },
  { symbol: 'NVDA' },
  { symbol: 'META' }
];

// Utility to wait between API calls
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize stocks with real names and prices from live API
const initializeStocks = async () => {
  const apiKey = process.env.FINNHUB_API_KEY;
  const hasApiKey = apiKey && apiKey !== 'your_finnhub_api_key_here';

  const updatedStocks = [];

  for (const stock of stocks) {
    if (!hasApiKey) {
      updatedStocks.push({
        symbol: stock.symbol,
        name: `${stock.symbol} Corp.`,
        price: 150.0 + (Math.random() * 300),
        change: 0
      });
      continue;
    }

    try {
      // Fetch quote and search sequentially with a small delay
      const quoteRes = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${apiKey}`);
      await sleep(200); // Respect rate limit
      
      const searchRes = await axios.get(`https://finnhub.io/api/v1/search?q=${stock.symbol}&token=${apiKey}`);
      await sleep(200); // Respect rate limit
      
      const quote = quoteRes.data;
      const match = searchRes.data.result?.find(r => r.symbol === stock.symbol);

      updatedStocks.push({
        symbol: stock.symbol,
        name: match ? match.description : stock.symbol,
        price: quote.c ? parseFloat(quote.c.toFixed(2)) : 100.0,
        change: quote.d ? parseFloat(quote.d.toFixed(2)) : 0
      });
    } catch (err) {
      console.error(`Failed to init ${stock.symbol}:`, err.message);
      updatedStocks.push({ symbol: stock.symbol, name: stock.symbol, price: 100.0, change: 0 });
    }
  }
  
  stocks.length = 0;
  stocks.push(...updatedStocks);
};

const fetchStockData = async () => {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || apiKey === 'your_finnhub_api_key_here') {
    simulateData();
    return;
  }

  try {
    const io = getIO();
    const updatedStocks = [];

    for (const stock of stocks) {
      try {
        const response = await axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${apiKey}`
        );
        const data = response.data;
        
        if (data.c) {
          stock.price = parseFloat(data.c.toFixed(2));
          stock.change = parseFloat(data.d.toFixed(2));
        }
        updatedStocks.push(stock);
        
        // Wait 200ms between each stock quote to stay under the 60 calls/minute limit
        await sleep(200);
      } catch (error) {
        console.error(`Error fetching data for ${stock.symbol}:`, error.message);
        updatedStocks.push(stock);
      }
    }

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

const searchStocks = async (query) => {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || apiKey === 'your_finnhub_api_key_here') {
    // Return a subset of local stocks that match the query if no API key
    return stocks.filter(s => 
      s.symbol.toLowerCase().includes(query.toLowerCase()) || 
      s.name.toLowerCase().includes(query.toLowerCase())
    ).map(s => ({
      symbol: s.symbol,
      description: s.name,
      displaySymbol: s.symbol,
      type: 'Common Stock'
    }));
  }

  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/search?q=${query}&token=${apiKey}`
    );
    // Filter for US stocks only for better relevance if needed, or just return results
    return response.data.result || [];
  } catch (error) {
    console.error('Error searching stocks:', error.message);
    return [];
  }
};

const getQuote = async (symbol) => {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || apiKey === 'your_finnhub_api_key_here') {
    const localStock = stocks.find(s => s.symbol === symbol.toUpperCase());
    if (localStock) return localStock;
    return { symbol: symbol.toUpperCase(), name: symbol.toUpperCase(), price: 100.0, change: 0 };
  }

  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    );
    const data = response.data;
    if (data.c) {
      return {
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(), // Quote API doesn't return name, usually you'd get this from search
        price: parseFloat(data.c.toFixed(2)),
        change: parseFloat(data.d.toFixed(2)),
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error.message);
    return null;
  }
};

const trackStock = async (symbol) => {
  const existing = stocks.find(s => s.symbol === symbol.toUpperCase());
  if (existing) return existing;

  const quote = await getQuote(symbol);
  if (quote) {
    // Try to get a better name from search if possible
    const searchResults = await searchStocks(symbol);
    const match = searchResults.find(r => r.symbol === symbol.toUpperCase());
    if (match) {
      quote.name = match.description;
    }
    
    stocks.push(quote);
    return quote;
  }
  return null;
};

module.exports = { startPriceSimulator, stocks, getHistoricalData, searchStocks, getQuote, trackStock, initializeStocks };
