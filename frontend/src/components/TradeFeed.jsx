import React, { useEffect, useState, useRef } from 'react';
import useMarketStore from '../store/useMarketStore';
import { Zap, Clock } from 'lucide-react';

const TradeFeed = () => {
  const [trades, setTrades] = useState([]);
  const { socket } = useMarketStore();
  const listRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on('newTrade', (trade) => {
        setTrades((prev) => [trade, ...prev].slice(0, 20));
      });
    }
    return () => {
      if (socket) socket.off('newTrade');
    };
  }, [socket]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[300px] transition-colors">
      <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
         <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center">
           <Zap className="h-3 w-3 mr-1.5 text-blue-500 fill-blue-500" /> Live Trades
         </h3>
         <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50 scrollbar-hide" ref={listRef}>
         {trades.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-xs font-medium italic">Waiting for market activity...</p>
           </div>
         ) : (
           trades.map((trade, i) => (
             <div key={i} className="p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors animate-in slide-in-from-top duration-300">
                <div className="flex items-center space-x-3">
                   <div className={`p-1.5 rounded-lg ${trade.type === 'BUY' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                      <Zap className="h-3 w-3" />
                   </div>
                   <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white leading-none">{trade.symbol}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                        {trade.quantity} @ ${trade.price.toFixed(2)}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className={`text-xs font-black ${trade.type === 'BUY' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                      {trade.type}
                   </p>
                   <p className="text-[10px] text-gray-400 flex items-center justify-end mt-0.5">
                      <Clock className="h-2.5 w-2.5 mr-1" />
                      {new Date(trade.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                   </p>
                </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};

export default TradeFeed;
