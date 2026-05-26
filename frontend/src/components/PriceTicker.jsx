import React, { useState, useEffect, useRef } from 'react';

const PriceTicker = ({ price, className = "" }) => {
  const prevPriceRef = useRef(price);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (price > prevPriceRef.current) {
      setFlashClass("bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400");
      const timer = setTimeout(() => setFlashClass(""), 1000);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    } else if (price < prevPriceRef.current) {
      setFlashClass("bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400");
      const timer = setTimeout(() => setFlashClass(""), 1000);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = price;
  }, [price]);

  return (
    <span className={`px-1 rounded transition-colors duration-500 ${flashClass} ${className}`}>
      ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
};

export default PriceTicker;
