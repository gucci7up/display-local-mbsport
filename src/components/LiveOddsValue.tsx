import React, { useEffect, useState, useRef } from 'react';

interface LiveOddsValueProps {
  value: string | number;
}

export const LiveOddsValue: React.FC<LiveOddsValueProps> = ({ value }) => {
  const numVal = Number(value);
  const prevValRef = useRef<number | null>(null);
  const [flashClass, setFlashClass] = useState<'flash-green' | 'flash-red' | ''>('');
  const [trend, setTrend] = useState<'up' | 'down' | ''>('');

  useEffect(() => {
    // Only flash if the previous value was set and is different from the current one
    if (prevValRef.current !== null && prevValRef.current !== numVal) {
      if (numVal < prevValRef.current) {
        setFlashClass('flash-green');
        setTrend('down');
      } else {
        setFlashClass('flash-red');
        setTrend('up');
      }

      // Reset trend arrow and flash effect after 1.5 seconds
      const timer = setTimeout(() => {
        setFlashClass('');
        setTrend('');
      }, 1500);

      return () => clearTimeout(timer);
    }
    prevValRef.current = numVal;
  }, [numVal]);

  return (
    <span className={`inline-flex items-center justify-center gap-1.5 transition-all duration-300 ${flashClass}`}>
      {trend === 'up' && <span className="text-[11px] text-red-500 font-extrabold animate-bounce">▲</span>}
      {trend === 'down' && <span className="text-[11px] text-green-500 font-extrabold animate-bounce">▼</span>}
      <span className="font-mono font-bold">{numVal.toFixed(2)}</span>
    </span>
  );
};
