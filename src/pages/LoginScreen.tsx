import React, { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'display_unlocked';
const PIN_LENGTH = 4;
const CORRECT_PIN = import.meta.env.VITE_DISPLAY_PIN ?? '2025';

interface LoginScreenProps {
  onUnlock: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onUnlock }) => {
  const [digits, setDigits] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDigit = useCallback(
    (d: string) => {
      if (digits.length >= PIN_LENGTH) return;
      const next = [...digits, d];
      setDigits(next);

      if (next.length === PIN_LENGTH) {
        const entered = next.join('');
        if (entered === CORRECT_PIN) {
          setSuccess(true);
          localStorage.setItem(STORAGE_KEY, 'true');
          setTimeout(() => onUnlock(), 600);
        } else {
          setShake(true);
          setTimeout(() => {
            setDigits([]);
            setShake(false);
          }, 600);
        }
      }
    },
    [digits, onUnlock],
  );

  const handleDelete = () => setDigits((prev) => prev.slice(0, -1));

  // Keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      if (e.key === 'Backspace') handleDelete();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleDigit]);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      className={`h-screen w-screen flex flex-col items-center justify-center bg-black relative overflow-hidden transition-opacity duration-500 ${success ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-[120px]" />
      </div>

      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      {/* Logo */}
      <div className="flex flex-col items-center mb-10 z-10">
        <img src="/logo.png" alt="MBSport" className="h-16 object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]" />
        <span className="text-[11px] font-bold text-gray-500 tracking-[0.4em] uppercase mt-1">Racing Dogs · Display</span>
      </div>

      {/* Card */}
      <div
        className={`z-10 flex flex-col items-center gap-6 px-10 py-8 rounded-3xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm shadow-[0_0_60px_rgba(0,0,0,0.8)] transition-transform duration-100 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
      >
        <p className="text-sm font-bold text-gray-400 tracking-[0.2em] uppercase">Ingresa el PIN de acceso</p>

        {/* PIN dots */}
        <div className="flex gap-4">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                i < digits.length
                  ? 'bg-amber-400 border-amber-400 shadow-[0_0_10px_rgba(245,197,24,0.6)]'
                  : 'bg-transparent border-white/20'
              }`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => handleDigit(k)}
              className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white font-display font-black text-2xl hover:bg-white/[0.1] hover:border-amber-400/40 active:scale-95 transition-all duration-100 select-none"
            >
              {k}
            </button>
          ))}

          {/* Bottom row: DEL · 0 · (vacío) */}
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-gray-400 font-bold text-sm hover:bg-white/[0.07] active:scale-95 transition-all duration-100 select-none"
          >
            ⌫
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white font-display font-black text-2xl hover:bg-white/[0.1] hover:border-amber-400/40 active:scale-95 transition-all duration-100 select-none"
          >
            0
          </button>
          <div className="w-16 h-16" />
        </div>

        {shake && (
          <p className="text-red-400 text-xs font-bold tracking-widest uppercase animate-pulse">
            PIN incorrecto
          </p>
        )}
      </div>

      {/* Gold bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-8px); }
          30%       { transform: translateX(8px); }
          45%       { transform: translateX(-6px); }
          60%       { transform: translateX(6px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
};

/** Verifica si el display está desbloqueado en localStorage. */
export const isDisplayUnlocked = (): boolean =>
  localStorage.getItem(STORAGE_KEY) === 'true';

/** Borra el unlock del localStorage (para el botón de lock manual). */
export const lockDisplay = (): void =>
  localStorage.removeItem(STORAGE_KEY);