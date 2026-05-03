import { useEffect, useState } from 'react';
import useWalletStore from '../store/useWalletStore';
import { DollarSign, ArrowDownCircle } from 'lucide-react';

const Wallet = () => {
  const { balance, transactions, isLoading, fetchWallet, deposit, fetchTransactions } = useWalletStore();
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const handleDeposit = (e) => {
    e.preventDefault();
    if (depositAmount && Number(depositAmount) > 0) {
      deposit(Number(depositAmount));
      setDepositAmount('');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center">
          <DollarSign className="mr-2 text-green-600 h-5 w-5 sm:h-6 sm:w-6" /> Wallet Balance
        </h2>
        <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6">
          ${(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        
        <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <input
            type="number"
            min="1"
            required
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
            placeholder="Amount to deposit"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            Deposit
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium">
                        <span className={tx.type === 'DEPOSIT' || tx.type === 'SELL_ORDER' ? 'text-green-600' : 'text-red-600'}>
                           {tx.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-600 font-semibold">${(tx.amount || 0).toLocaleString('en-US')}</td>
                      <td className="whitespace-nowrap py-3 px-3 sm:px-4 text-xs sm:text-sm">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-500">
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
