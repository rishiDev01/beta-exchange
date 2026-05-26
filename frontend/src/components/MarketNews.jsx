import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import Skeleton from './Skeleton';

const MarketNews = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const token = user?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/market/news', config);
        setNews(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
         <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 w-1/4 rounded"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                 <div className="h-4 bg-gray-200 dark:bg-gray-700 w-full rounded"></div>
                 <div className="h-3 bg-gray-200 dark:bg-gray-700 w-5/6 rounded"></div>
              </div>
            ))}
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
      <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
         <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center uppercase tracking-tight">
           <Newspaper className="h-5 w-5 mr-2 text-blue-500" /> Market News
         </h3>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-700">
         {news.map((item) => (
           <a 
             key={item.id} 
             href={item.url} 
             target="_blank" 
             rel="noopener noreferrer"
             className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
           >
              <div className="flex justify-between items-start gap-4">
                 <div className="flex-1">
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                       <span>{item.source}</span>
                       <span>•</span>
                       <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                       {item.headline}
                    </h4>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                       {item.summary}
                    </p>
                 </div>
                 {item.image && (
                   <img src={item.image} alt="" className="w-20 h-20 rounded-xl object-cover hidden sm:block shadow-sm" />
                 )}
              </div>
           </a>
         ))}
      </div>
    </div>
  );
};

export default MarketNews;
