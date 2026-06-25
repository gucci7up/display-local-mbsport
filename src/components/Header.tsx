import React, { useEffect, useState } from 'react';

interface HeaderProps {
  raceNumber: number | string;
  status: string;
  closeAt: string | null;
  autoMode: boolean;
  toggleAutoMode: () => void;
  onLock?: () => void;
  onChangeAgency?: () => void;
  debugMode?: boolean;
  isTransparent?: boolean;
  jackpotAmount?: number;
  trifectaBonusRate?: number;
  trifectaBonusPool?: number;
}

export const Header: React.FC<HeaderProps> = ({
  raceNumber,
  status,
  closeAt,
  autoMode,
  toggleAutoMode,
  onLock,
  onChangeAgency,
  debugMode = false,
  isTransparent = false,
  jackpotAmount = 0,
  trifectaBonusRate = 0,
  trifectaBonusPool = 0,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [countdownStr, setCountdownStr] = useState('--:--');
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const detectFullscreen = () =>
    !!document.fullscreenElement || window.innerHeight === screen.height;

  const [isFullscreen, setIsFullscreen] = useState(detectFullscreen);

  useEffect(() => {
    const onChange = () => setIsFullscreen(detectFullscreen());
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);

  // Real-time clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDateStr(now.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // Countdown
  useEffect(() => {
    if (!closeAt || status !== 'OPEN') {
      setCountdownStr('--:--');
      setSecondsRemaining(null);
      return;
    }
    const update = () => {
      const diff = new Date(closeAt).getTime() - Date.now();
      if (diff <= 0) { setCountdownStr('00:00'); setSecondsRemaining(0); return; }
      const s = Math.max(0, Math.floor(diff / 1000));
      setSecondsRemaining(s);
      setCountdownStr(`${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [closeAt, status]);

  const s = (status || 'OPEN').toUpperCase();

  const statusConfig: Record<string, { color: string; glow: string; bg: string; dot: string }> = {
    OPEN:     { color: '#22c55e', glow: 'rgba(34,197,94,0.4)',   bg: 'rgba(20,83,45,0.5)',   dot: '#22c55e' },
    RUNNING:  { color: '#ef4444', glow: 'rgba(239,68,68,0.5)',   bg: 'rgba(127,29,29,0.5)',  dot: '#ef4444' },
    CLOSED:   { color: '#f97316', glow: 'rgba(249,115,22,0.35)', bg: 'rgba(124,45,18,0.4)',  dot: '#f97316' },
    FINISHED: { color: '#f5c518', glow: 'rgba(245,197,24,0.35)', bg: 'rgba(120,96,0,0.4)',   dot: '#f5c518' },
    OFFICIAL: { color: '#f5c518', glow: 'rgba(245,197,24,0.35)', bg: 'rgba(120,96,0,0.4)',   dot: '#f5c518' },
  };
  const sc = statusConfig[s] || { color: '#9ca3af', glow: 'rgba(156,163,175,0.3)', bg: 'rgba(30,30,30,0.5)', dot: '#9ca3af' };

  const cdColor = secondsRemaining === null ? '#ffffff'
    : secondsRemaining <= 5  ? '#ef4444'
    : secondsRemaining <= 10 ? '#f97316'
    : secondsRemaining <= 30 ? '#f5c518'
    : '#ffffff';

  const isUrgent = secondsRemaining !== null && secondsRemaining <= 5 && secondsRemaining > 0;

  // Shared chip style
  const chip = (accentColor: string, extraStyle?: React.CSSProperties): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 20px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderTop: `2px solid ${accentColor}`,
    boxShadow: `0 0 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
    minWidth: 100,
    height: 58,
    gap: 3,
    ...extraStyle,
  });

  const label: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    fontFamily: "'Barlow Condensed', sans-serif",
    lineHeight: 1,
  };

  const headerBg = isTransparent
    ? 'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)'
    : 'linear-gradient(180deg, #111114 0%, #0a0a0c 100%)';

  return (
    <header
      className="relative flex items-center justify-between select-none z-10 shrink-0"
      style={{
        padding: '0 24px',
        height: 72,
        background: headerBg,
        borderBottom: isTransparent ? 'none' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isTransparent ? 'none' : '0 4px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* ── Left: Logo + chips ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <img src="/logo.png" alt="MBSport" style={{ height: 48, objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))' }} />
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
            Racing Dogs
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 40, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

        {/* CARRERA */}
        <div style={chip('#f5c518')}>
          <span style={label}>Carrera</span>
          <span style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, fontFamily: "'Barlow Condensed', sans-serif", background: 'linear-gradient(135deg,#FFE9A8,#F5C518)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {raceNumber || '---'}
          </span>
        </div>

        {/* ESTADO */}
        <div style={{ ...chip(sc.color), minWidth: 140, background: sc.bg, borderColor: `${sc.color}40`, borderTop: `2px solid ${sc.color}`, boxShadow: `0 0 20px ${sc.glow}, inset 0 1px 0 rgba(255,255,255,0.04)` }}>
          <span style={label}>Estado</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, boxShadow: `0 0 8px ${sc.dot}`, flexShrink: 0, animation: s === 'RUNNING' ? 'pulse 1s infinite' : undefined }} />
            <span style={{ fontSize: 22, fontWeight: 900, color: sc.color, letterSpacing: '0.08em', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
              {s}
            </span>
          </div>
        </div>

        {/* CIERRE EN */}
        <div style={{ ...chip(cdColor), minWidth: 150, borderTop: `2px solid ${cdColor}`, transition: 'border-color 0.5s' }}>
          <span style={label}>Cierre en</span>
          <span
            style={{
              fontSize: 30,
              fontWeight: 900,
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              lineHeight: 1,
              color: cdColor,
              textShadow: isUrgent ? `0 0 20px ${cdColor}` : undefined,
              animation: isUrgent ? 'pulse 0.6s infinite' : undefined,
            }}
          >
            {countdownStr}
          </span>
        </div>

        {/* JACKPOT counter */}
        <div style={{ ...chip('#C98A00'), minWidth: 158, borderTop: '2px solid #C98A00', animation: 'jackpot-counter-glow 2.5s ease-in-out infinite alternate' }}>
          <span style={{ ...label, color: '#B8963A', fontSize: 10 }}>💰 JACKPOT</span>
          <span style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, background: 'linear-gradient(135deg,#FFE9A8,#F5C518)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ${jackpotAmount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* BONUS TRIPLETA — muestra el pozo acumulado */}
        {trifectaBonusRate > 0 && (
          <div style={{ ...chip('#1a6b3a'), minWidth: 145, borderTop: '2px solid #22c55e' }}>
            <span style={{ ...label, color: '#4ade80', fontSize: 10 }}>🏆 BONUS TRIPLETA</span>
            <span style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, color: '#4ade80' }}>
              ${trifectaBonusPool.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* ── Right: Debug controls + Clock ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Debug controls — hidden in fullscreen */}
        {debugMode && !isFullscreen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleAutoMode}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 16px', borderRadius: 999,
                border: autoMode ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.12)',
                background: autoMode ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                color: autoMode ? '#22c55e' : '#6b7280',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
                boxShadow: autoMode ? '0 0 12px rgba(34,197,94,0.3)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: autoMode ? '#22c55e' : '#4b5563', boxShadow: autoMode ? '0 0 6px #22c55e' : 'none' }} />
              {autoMode ? 'MODO TV: AUTO' : 'MODO TV: MANUAL'}
            </button>
            {onChangeAgency && (
              <button
                onClick={onChangeAgency}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 999,
                  border: '1px solid rgba(245,197,24,0.25)',
                  background: 'rgba(245,197,24,0.05)',
                  color: '#b8963a', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                ⚙ AGENCIA
              </button>
            )}
            {onLock && (
              <button
                onClick={onLock}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#6b7280', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                🔒 LOCK
              </button>
            )}
          </div>
        )}

        {/* Clock */}
        <div style={chip('rgba(255,255,255,0.15)', { minWidth: 140 })}>
          <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: '#ffffff', lineHeight: 1, letterSpacing: '0.05em' }}>
            {timeStr}
          </span>
          <span style={{ ...label, marginTop: 2, color: 'rgba(255,255,255,0.3)' }}>{dateStr}</span>
        </div>
      </div>

      {/* Bottom gold accent line */}
      {!isTransparent && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(245,197,24,0.5), transparent)' }} />
      )}
    </header>
  );
};
