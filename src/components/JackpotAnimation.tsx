import React, { useEffect, useState } from 'react';

interface JackpotAnimationProps {
  amount: number;
  onClose: () => void;
}

const COINS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: ((i * 37 + 5) % 98) + 1,
  delay: (i * 0.22) % 2.8,
  duration: 2.0 + (i % 5) * 0.4,
  size: 18 + (i % 4) * 7,
  swing: (i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 6),
}));

const STARS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  top: ((i * 29 + 11) % 80) + 5,
  left: ((i * 53 + 17) % 90) + 5,
  delay: (i * 0.18) % 1.5,
  scale: 0.6 + (i % 4) * 0.25,
}));

export const JackpotAnimation: React.FC<JackpotAnimationProps> = ({ amount, onClose }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onClose]);

  const formatted = amount.toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden jackpot-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/88 jackpot-backdrop" />

      {/* Radial gold glow */}
      <div className="absolute inset-0 jackpot-bg-glow pointer-events-none" />

      {/* Falling coins */}
      {COINS.map((c) => (
        <span
          key={c.id}
          className="absolute top-0 jackpot-coin pointer-events-none select-none"
          style={{
            left: `${c.left}%`,
            fontSize: `${c.size}px`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            '--swing': `${c.swing}px`,
          } as React.CSSProperties}
        >
          🪙
        </span>
      ))}

      {/* Background sparkle stars */}
      {STARS.map((s) => (
        <span
          key={s.id}
          className="absolute jackpot-star pointer-events-none select-none text-yellow-300"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            fontSize: '22px',
            animationDelay: `${s.delay}s`,
            transform: `scale(${s.scale})`,
          }}
        >
          ✦
        </span>
      ))}

      {/* Main content card */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-12 py-10 jackpot-card pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top emoji */}
        <div className="text-7xl mb-2 jackpot-trophy select-none">🏆</div>

        {/* JACKPOT title */}
        <div className="jackpot-title font-display font-black uppercase select-none">
          JACKPOT
        </div>

        {/* Gold divider */}
        <div className="jackpot-divider my-3" />

        {/* INSTANT WIN */}
        <div className="jackpot-subtitle font-display font-black uppercase tracking-[0.45em] select-none">
          INSTANT WIN
        </div>

        {/* Prize amount */}
        <div className="jackpot-amount font-mono font-black select-none mt-4">
          ${formatted}
        </div>

        {/* Dismiss hint */}
        <p className="mt-6 text-sm tracking-widest font-mono select-none jackpot-hint">
          Toca para cerrar · Cierra en {countdown}s
        </p>
      </div>
    </div>
  );
};
