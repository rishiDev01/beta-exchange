import { useEffect, useState } from 'react';
import useWalletStore from '../store/useWalletStore';
import { DollarSign, ArrowDownCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TableSkeleton } from './Skeleton';

const Wallet = () => {
  const { balance, transactions, isLoading, fetchWallet, deposit, withdraw, fetchTransactions, isError, message } = useWalletStore();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (depositAmount && Number(depositAmount) > 0) {
      try {
        await deposit(Number(depositAmount));
        toast.success(`Successfully deposited $${depositAmount}`);
        setDepositAmount('');
      } catch (error) {
        toast.error(error.message || 'Deposit failed');
      }
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (withdrawAmount && Number(withdrawAmount) > 0) {
      try {
        await withdraw(Number(withdrawAmount));
        toast.success(`Successfully withdrawn $${withdrawAmount}`);
        setWithdrawAmount('');
      } catch (error) {
        toast.error(error.message || 'Withdrawal failed');
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 transition-colors duration-200">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center text-gray-900 dark:text-gray-100">
          <DollarSign className="mr-2 text-green-600 dark:text-green-400 h-5 w-5 sm:h-6 sm:w-6" /> Wallet Balance
        </h2>
        <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6">
          ${(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        
        <div className="flex flex-col space-y-4">
          <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              min="1"
              required
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2.5 border text-sm transition-colors outline-none"
              placeholder="Deposit amount"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
            >
              Deposit
            </button>
          </form>

          <form onSubmit={handleWithdraw} className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              min="1"
              required
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="flex-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 p-2.5 border text-sm transition-colors outline-none"
              placeholder="Withdraw amount"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
            >
              Withdraw
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 transition-colors duration-200">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">Recent Transactions</h2>
        {isLoading && transactions.length === 0 ? (
          <TableSkeleton />
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="whitespace-nowrap py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium">
                        <span className={tx.type === 'DEPOSIT' || tx.type === 'SELL_ORDER' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                           {tx.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-semibold">${(tx.amount || 0).toLocaleString('en-US')}</td>
                      <td className="whitespace-nowrap py-3 px-3 sm:px-4 text-xs sm:text-sm">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
