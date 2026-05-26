import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMarketStore from '../store/useMarketStore';
import { TrendingUp, TrendingDown, Search, MinusCircle } from 'lucide-react';
import OrderModal from './OrderModal';
import { MarketWatchSkeleton } from './Skeleton';
import PriceTicker from './PriceTicker';

const MarketWatch = () => {
  const navigate = useNavigate();
  const { 
    stocks, 
    watchlist, 
    fetchStocks, 
    fetchWatchlist, 
    connectSocket, 
    disconnectSocket, 
    isLoading, 
    searchStocks, 
    addStockToWatchlist,
    removeFromWatchlist
  } = useMarketStore();
  const [selectedStock, setSelectedStock] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [hoveredSymbol, setHoveredSymbol] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchStocks();
    fetchWatchlist();
    connectSocket();
    return () => disconnectSocket();
  }, []);


  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        const results = await searchStocks(searchQuery);
        // Map search results to include Common Stock filter and slicing
        setSearchResults(results.filter(r => r.type === 'Common Stock' || !r.type).slice(0, 5));
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchStocks]);

  const openOrder = (e, stock, type) => {
    e.stopPropagation();
    setSelectedStock(stock);
    setOrderType(type);
  };

  const handleAddStock = async (symbol) => {
    await addStockToWatchlist(symbol);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Filter stocks that are in the user's watchlist
  const filteredStocks = stocks.filter(stock => 
    watchlist.includes(stock.symbol.toUpperCase()) && (
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (isLoading && stocks.length === 0) {
    return <MarketWatchSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col h-auto max-h-[400px] lg:max-h-none lg:flex-1 transition-colors duration-200">
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 transition-colors duration-200 flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">Market Watch</h2>
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search symbol or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full transition-colors"
          />
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-800 shadow-xl rounded-md border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <div className="p-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">Global Market Results</div>
              {searchResults.map((result) => (
                <div
                  key={result.symbol}
                  className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b border-gray-50 dark:border-gray-700 last:border-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddStock(result.symbol);
                  }}
                >
                  <div>
                    <div className="font-bold text-xs text-gray-900 dark:text-gray-100">{result.symbol}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate w-40">{result.description}</div>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 font-bold text-[10px] hover:underline">ADD</button>
                </div>
              ))}
            </div>
          )}
          {isSearching && (
             <div className="absolute top-full right-0 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50 p-2 text-center">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
             </div>
          )}
        </div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto flex-1">
        {filteredStocks.length === 0 && !isLoading && (
          <div className="p-8 text-center">
             <p className="text-gray-500 dark:text-gray-400 text-sm italic mb-2">Watchlist is empty.</p>
             <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Search and add stocks to start trading</p>
          </div>
        )}
        {filteredStocks.map((stock) => (
          <div
            key={stock.symbol}
            onClick={() => navigate(`/stock/${stock.symbol}`)}
            className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex justify-between items-center transition-colors relative group"
            onMouseEnter={() => setHoveredSymbol(stock.symbol)}
            onMouseLeave={() => setHoveredSymbol(null)}
          >
            <div className="flex items-center">
               {hoveredSymbol === stock.symbol && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(stock.symbol);
                    }}
                    className="mr-2 text-red-400 hover:text-red-600 transition-colors"
                    title="Remove from watchlist"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
               )}
               <div>
                 <div className="font-bold text-gray-900 dark:text-gray-100">{stock.symbol}</div>
                 <div className="text-xs text-gray-500 dark:text-gray-400">{stock.name}</div>
               </div>
            </div>

            {hoveredSymbol === stock.symbol ? (
              <div className="flex space-x-2">
                <button
                  onClick={(e) => openOrder(e, stock, 'BUY')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700"
                >
                  BUY
                </button>
                <button
                  onClick={(e) => openOrder(e, stock, 'SELL')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700"
                >
                  SELL
                </button>
              </div>
            ) : (
              <div className="text-right">
                <div className={`font-bold ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <PriceTicker price={stock.price || 0} />
                </div>
                <div className={`text-xs flex items-center justify-end ${stock.change >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
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
