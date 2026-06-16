import React, { useEffect, useState } from 'react';

interface HeaderProps {
  raceNumber: number | string;
  status: string;
  closeAt: string | null;
  autoMode: boolean;
  toggleAutoMode: () => void;
  onLock?: () => void;
  debugMode?: boolean;
  isTransparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  raceNumber,
  status,
  closeAt,
  autoMode,
  toggleAutoMode,
  onLock,
  debugMode = false,
  isTransparent = false,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [countdownStr, setCountdownStr] = useState('00:00');
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  // Real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('es-DO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!closeAt || status !== 'OPEN') {
      setCountdownStr('00:00');
      setSecondsRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(closeAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdownStr('00:00');
        setSecondsRemaining(0);
      } else {
        const totalSecs = Math.max(0, Math.floor(diff / 1000));
        setSecondsRemaining(totalSecs);
        const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
        const secs = (totalSecs % 60).toString().padStart(2, '0');
        setCountdownStr(`${mins}:${secs}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [closeAt, status]);

  const getStatusBadge = (status: string) => {
    const s = (status || 'OPEN').toUpperCase();
    switch (s) {
      case 'OPEN':
        return (
          <span className="px-3 py-0.5 rounded bg-green-950/80 border border-green-500 text-green-400 font-display font-black text-xl tracking-wider shadow-[0_0_12px_rgba(34,197,94,0.35)] select-none">
            ● OPEN
          </span>
        );
      case 'RUNNING':
        return (
          <span className="px-3 py-0.5 rounded bg-red-950/80 border border-red-500 text-red-500 font-display font-black text-xl tracking-wider animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)] select-none">
            ● RUNNING
          </span>
        );
      case 'FINISHED':
      case 'OFFICIAL':
        return (
          <span className="px-3 py-0.5 rounded bg-amber-950/80 border border-pos-yellow text-pos-yellow font-display font-black text-xl tracking-wider shadow-[0_0_12px_rgba(245,197,24,0.35)] select-none">
            ● FINISHED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-3 py-0.5 rounded bg-red-950/40 border border-red-900 text-red-700 font-display font-black text-xl tracking-wider select-none">
            ● CLOSED
          </span>
        );
      default:
        return (
          <span className="px-3 py-0.5 rounded bg-zinc-900 border border-zinc-500 text-zinc-300 font-display font-black text-xl tracking-wider select-none">
            {s}
          </span>
        );
    }
  };

  const getCountdownClass = () => {
    if (status !== 'OPEN' || secondsRemaining === null) return 'text-white';
    if (secondsRemaining <= 5 && secondsRemaining > 0) {
      return 'text-pos-red font-display font-black animate-countdown-urgent inline-block';
    }
    if (secondsRemaining <= 10) {
      return 'text-orange-500 font-bold';
    }
    if (secondsRemaining <= 30) {
      return 'text-yellow-500 font-bold';
    }
    return 'text-white';
  };

  const headerClass = isTransparent
    ? "relative flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/85 via-black/45 to-transparent select-none z-10 shrink-0 border-b-0 shadow-none"
    : "relative flex items-center justify-between px-6 py-3 bg-gradient-to-b from-surface-2/80 via-pos-bg to-black select-none z-10 shrink-0 shadow-card";

  const chipClass = "flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] text-center backdrop-blur-sm";

  return (
    <header className={headerClass}>
      {/* Left Section: Logo & Status info */}
      <div className="flex items-center gap-7">
        {/* Brand Logo */}
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="MBSport Logo" className="h-14 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]" />
          <span className="text-[9px] font-bold text-gray-500 tracking-[0.35em] uppercase -mt-2">
            Racing Dogs
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-pos-border to-transparent" />

        {/* Panels Container */}
        <div className="flex items-center gap-3">
          {/* Carrera Info */}
          <div className={`${chipClass} px-4 py-1 min-w-[95px] h-[52px]`}>
            <span className="text-[10px] font-black text-gray-500 tracking-wider font-display uppercase leading-none mb-1">CARRERA</span>
            <span className="text-3xl font-extrabold font-display leading-none text-gradient-gold drop-shadow-[0_0_10px_rgba(245,197,24,0.25)]">
              {raceNumber || '---'}
            </span>
          </div>

          {/* Estado Info */}
          <div className={`${chipClass} px-4 py-1 min-w-[135px] h-[52px]`}>
            <span className="text-[10px] font-black text-gray-500 tracking-wider font-display uppercase leading-none mb-1.5">ESTADO</span>
            {getStatusBadge(status)}
          </div>

          {/* Countdown Info */}
          <div className={`${chipClass} px-5 py-1 min-w-[160px] h-[52px]`}>
            <span className="text-[10px] font-black text-gray-500 tracking-wider font-display uppercase leading-none mb-1.5">
              PRÓXIMA CARRERA EN
            </span>
            <div className="h-6 flex items-center justify-center">
              <span className={`text-2xl font-black font-mono leading-none tracking-widest ${getCountdownClass()}`}>
                {countdownStr}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Time, Date & Auto TV Toggle */}
      <div className="flex items-center gap-6">
        {/* Debug controls — ocultar en fullscreen */}
        {debugMode && !isFullscreen && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAutoMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-300 ${
                autoMode
                  ? 'bg-pos-green/20 border-pos-green-light text-pos-green-light shadow-[0_0_12px_rgba(34,197,94,0.45)]'
                  : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${autoMode ? 'bg-pos-green-light animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-gray-500'}`} />
              {autoMode ? 'MODO TV: AUTO' : 'MODO TV: MANUAL'}
            </button>
            {onLock && (
              <button
                onClick={onLock}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white hover:border-red-500/50 text-xs font-bold transition-all duration-300"
                title="Bloquear display"
              >
                🔒 LOCK
              </button>
            )}
          </div>
        )}

        {/* Clock */}
        <div className={`${chipClass} items-end px-4 py-1.5 min-w-[130px] h-[52px] justify-center`}>
          <span className="text-xl font-bold font-mono text-white tracking-wide leading-none">
            {timeStr}
          </span>
          <span className="text-[10px] font-bold text-gray-500 font-mono mt-1 uppercase leading-none">
            {dateStr}
          </span>
        </div>
      </div>

      {/* Bottom gold accent line */}
      {!isTransparent && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gold-line" />
      )}
    </header>
  );
};

