import React, { useMemo } from 'react';
import useOrderStore from '../store/useOrderStore';
import useMarketStore from '../store/useMarketStore';
import useWalletStore from '../store/useWalletStore';
import { TrendingUp, TrendingDown, Wallet, Briefcase, BarChart3 } from 'lucide-react';

const PortfolioSummary = () => {
  const { holdings } = useOrderStore();
  const { stocks } = useMarketStore();
  const { balance } = useWalletStore();

  const summary = useMemo(() => {
    let totalInvested = 0;
    let currentMarketValue = 0;

    holdings.forEach((holding) => {
      totalInvested += holding.averagePrice * holding.quantity;
      const currentPrice = stocks.find((s) => s.symbol === holding.symbol)?.price || holding.averagePrice;
      currentMarketValue += currentPrice * holding.quantity;
    });

    const totalPL = currentMarketValue - totalInvested;
    const plPercentage = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;
    const totalPortfolioValue = currentMarketValue + balance;

    return {
      totalInvested,
      currentMarketValue,
      totalPL,
      plPercentage,
      totalPortfolioValue,
      isProfit: totalPL >= 0,
    };
  }, [holdings, stocks, balance]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Portfolio Value */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Total Net Worth</p>
            <h3 className="text-3xl font-black">${summary.totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm font-bold">
           <span className="text-blue-100/80">Available Cash:</span>
           <span>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Current Value & P/L */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Invested Value</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">${summary.currentMarketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-gray-400 dark:text-gray-500 text-sm">Cost: ${summary.totalInvested.toLocaleString('en-US')}</p>
        </div>
      </div>

      {/* Total P/L */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Returns</p>
          <div className={`${summary.isProfit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} p-2 rounded-lg transition-colors`}>
            {summary.isProfit ? <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" /> : <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />}
          </div>
        </div>
        <div className={`text-2xl font-black mb-1 ${summary.isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {summary.isProfit ? '+' : ''}${summary.totalPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`text-sm font-bold flex items-center ${summary.isProfit ? 'text-green-500' : 'text-red-500'}`}>
           {summary.isProfit ? '+' : ''}{summary.plPercentage.toFixed(2)}%
           <span className="text-gray-400 dark:text-gray-500 font-medium ml-2">all time</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
