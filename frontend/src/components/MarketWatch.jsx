import { useEffect, useState } from 'react';
import useMarketStore from '../store/useMarketStore';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import OrderModal from './OrderModal';

const MarketWatch = () => {
  const { stocks, fetchStocks, connectSocket, disconnectSocket, isLoading, searchStocks, addStockToWatchlist } = useMarketStore();
  const [selectedStock, setSelectedStock] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [hoveredSymbol, setHoveredSymbol] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchStocks();
    connectSocket();
    return () => disconnectSocket();
  }, [fetchStocks, connectSocket, disconnectSocket]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        const results = await searchStocks(searchQuery);
        setSearchResults(results.filter(r => r.type === 'Common Stock').slice(0, 5));
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchStocks]);

  const openOrder = (stock, type) => {
    setSelectedStock(stock);
    setOrderType(type);
  };

  const handleAddStock = async (symbol) => {
    await addStockToWatchlist(symbol);
    setSearchQuery('');
    setSearchResults([]);
  };

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && stocks.length === 0) {
    return <div className="p-4 text-center">Loading Market Data...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-auto max-h-[400px] lg:max-h-none lg:h-[calc(100vh-120px)] sticky top-20">
      <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
        <h2 className="text-base sm:text-lg font-bold text-gray-800">Market Watch</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 sm:pl-8 pr-2 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-blue-500 focus:border-blue-500 w-24 sm:w-auto"
          />
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white shadow-xl rounded-md border border-gray-200 z-50 overflow-hidden">
              <div className="p-2 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 border-b">Global Market Results</div>
              {searchResults.map((result) => (
                <div
                  key={result.symbol}
                  className="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0"
                  onClick={() => handleAddStock(result.symbol)}
                >
                  <div>
                    <div className="font-bold text-xs text-gray-900">{result.symbol}</div>
                    <div className="text-[10px] text-gray-500 truncate w-40">{result.description}</div>
                  </div>
                  <button className="text-blue-600 font-bold text-[10px] hover:underline">ADD</button>
                </div>
              ))}
            </div>
          )}
          {isSearching && (
             <div className="absolute top-full right-0 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 z-50 p-2 text-center">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
             </div>
          )}
        </div>
      </div>
      <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
        {filteredStocks.length === 0 && searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm italic">No local matches. Try a specific symbol.</div>
        )}
        {filteredStocks.map((stock) => (
          <div
            key={stock.symbol}
            className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors relative group"
            onMouseEnter={() => setHoveredSymbol(stock.symbol)}
            onMouseLeave={() => setHoveredSymbol(null)}
          >
            <div>
              <div className="font-bold text-gray-900">{stock.symbol}</div>
              <div className="text-xs text-gray-500">{stock.name}</div>
            </div>

            {hoveredSymbol === stock.symbol ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => openOrder(stock, 'BUY')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700"
                >
                  BUY
                </button>
                <button
                  onClick={() => openOrder(stock, 'SELL')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700"
                >
                  SELL
                </button>
              </div>
            ) : (
              <div className="text-right">
                <div className={`font-bold ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-xs flex items-center justify-end ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stock.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {stock.change >= 0 ? '+' : ''}{stock.change}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedStock && (
        <OrderModal
          stock={selectedStock}
          type={orderType}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
};

export default MarketWatch;
