import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
  );
};

export const MarketWatchSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 transition-colors">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex flex-col items-end">
            <Skeleton className="h-4 w-12 mb-1" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-32" />
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-900/50 p-3 flex gap-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 flex-1" />)}
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 flex gap-4 border-t border-gray-200 dark:border-gray-700">
           {[1, 2, 3, 4, 5].map(j => <Skeleton key={j} className="h-4 flex-1" />)}
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
