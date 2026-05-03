import { useEffect } from 'react';
import useOrderStore from '../store/useOrderStore';
import useMarketStore from '../store/useMarketStore';
import { Briefcase } from 'lucide-react';

const Holdings = () => {
  const { holdings, fetchHoldings } = useOrderStore();
  const { stocks } = useMarketStore();

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const calculatePL = (holding) => {
    const currentPrice = stocks.find((s) => s.symbol === holding.symbol)?.price || holding.averagePrice;
    const pl = (currentPrice - holding.averagePrice) * holding.quantity;
    return {
      currentPrice,
      pl: (pl || 0).toFixed(2),
      isProfit: pl >= 0,
    };
  };

  if (holdings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-gray-100">
          <Briefcase className="mr-2 text-blue-600 dark:text-blue-400" /> Holdings
        </h2>
        <p className="text-gray-500 dark:text-gray-400">You don't have any holdings yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 transition-colors duration-200">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center text-gray-900 dark:text-gray-100">
        <Briefcase className="mr-2 text-blue-600 dark:text-blue-400 h-5 w-5 sm:h-6 sm:w-6" /> Holdings
      </h2>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-3 sm:px-4">Symbol</th>
                <th className="py-3 px-3 sm:px-4">Qty</th>
                <th className="py-3 px-3 sm:px-4">Avg. Price</th>
                <th className="py-3 px-3 sm:px-4">LTP</th>
                <th className="py-3 px-3 sm:px-4">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {holdings.map((holding) => {
                const { currentPrice, pl, isProfit } = calculatePL(holding);
                return (
                  <tr key={holding._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-900 dark:text-gray-100">
                    <td className="py-3 px-3 sm:py-4 sm:px-4 font-bold text-xs sm:text-sm">{holding.symbol}</td>
                    <td className="py-3 px-3 sm:py-4 sm:px-4 text-xs sm:text-sm">{holding.quantity}</td>
                    <td className="py-3 px-3 sm:py-4 sm:px-4 text-xs sm:text-sm">${(holding.averagePrice || 0).toFixed(2)}</td>
                    <td className="py-3 px-3 sm:py-4 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300">${(currentPrice || 0).toFixed(2)}</td>
                    <td className={`py-3 px-3 sm:py-4 sm:px-4 font-bold text-xs sm:text-sm ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isProfit ? '+$' : '-$'}{Math.abs(pl)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Holdings;
