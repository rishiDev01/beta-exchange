import { useState } from 'react';
import { createPortal } from 'react-dom';
import useOrderStore from '../store/useOrderStore';
import { X } from 'lucide-react';

const OrderModal = ({ stock, type, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { placeOrder, isLoading } = useOrderStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await placeOrder({
        symbol: stock.symbol,
        type,
        quantity: Number(quantity),
        orderType: 'MARKET',
        price: stock.price,
      });
      alert(`Order ${type} Successful!`);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  const total = ((stock.price || 0) * quantity).toFixed(2);

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
        <div className={`p-4 flex justify-between items-center text-white ${type === 'BUY' ? 'bg-blue-600 dark:bg-blue-700' : 'bg-red-600 dark:bg-red-700'}`}>
          <h3 className="text-lg font-bold flex items-center">
            {type} {stock.symbol}
          </h3>
          <button onClick={onClose} className="hover:bg-black/10 dark:hover:bg-black/20 rounded-full p-1 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center transition-colors">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">Current Price</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">${(stock.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 tracking-wider">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg font-semibold transition-colors"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 border-dashed pt-4 flex justify-between items-center transition-colors">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</div>
            <div className={`text-2xl font-black ${type === 'BUY' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>${total}</div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-lg text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${type === 'BUY' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none' : 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'}`}
          >
            {isLoading ? 'Processing...' : `${type} ORDER`}
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default OrderModal;
