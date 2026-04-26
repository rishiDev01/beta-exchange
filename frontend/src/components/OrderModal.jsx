import { useState } from 'react';
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

  const total = (stock.price * quantity).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`p-4 flex justify-between items-center text-white ${type === 'BUY' ? 'bg-blue-600' : 'bg-red-600'}`}>
          <h3 className="text-lg font-bold flex items-center">
            {type} {stock.symbol}
          </h3>
          <button onClick={onClose} className="hover:bg-black/10 rounded-full p-1 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-6">
          <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
            <span className="text-sm text-gray-500 font-medium uppercase">Current Price</span>
            <span className="text-lg font-bold text-gray-900">${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg font-semibold"
            />
          </div>

          <div className="border-t border-dashed pt-4 flex justify-between items-center">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</div>
            <div className={`text-2xl font-black ${type === 'BUY' ? 'text-blue-600' : 'text-red-600'}`}>${total}</div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-lg text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${type === 'BUY' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
          >
            {isLoading ? 'Processing...' : `${type} ORDER`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
