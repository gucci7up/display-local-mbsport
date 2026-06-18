import React, { useEffect, useState, useRef } from 'react';

interface VideoRaceProps {
  currentRace: any;
  onVideoEnded: () => void;
  blobUrl: string | null;
  isPreloading: boolean;
}

export const VideoRace: React.FC<VideoRaceProps> = ({
  currentRace,
  onVideoEnded,
  blobUrl,
  isPreloading,
}) => {
  const [showStartingBanner, setShowStartingBanner] = useState(true);
  // 'banner' | 'loading' | 'playing' | 'fallback'
  const [phase, setPhase] = useState<'banner' | 'loading' | 'playing' | 'fallback'>('banner');
  const [fallbackCountdown, setFallbackCountdown] = useState(
    currentRace?.video?.durationSeconds || 42,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentRace?.video?.durationSeconds || 42);

  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── 1. Reset cuando cambia la carrera ──────────────────────────────────────
  useEffect(() => {
    const d = currentRace?.video?.durationSeconds || 42;
    setDuration(d);
    setFallbackCountdown(d);
    setCurrentTime(0);
    setPhase('banner');
    setShowStartingBanner(true);

    const timer = setTimeout(() => {
      if (!isMounted.current) return;
      setShowStartingBanner(false);
      // Solo decidimos qué fase viene — play() lo maneja el effect de fase
      if (blobUrl) {
        setPhase('playing');
      } else if (isPreloading) {
        setPhase('loading');
      } else {
        setPhase('fallback');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentRace?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Cuando llega el blob mientras esperamos (loading) ───────────────────
  useEffect(() => {
    if (phase !== 'loading' || !blobUrl) return;
    setPhase('playing'); // play() se llama en el effect de abajo
  }, [blobUrl, phase]);

  // ── 3. Si la descarga falla durante loading ────────────────────────────────
  useEffect(() => {
    if (phase === 'loading' && !isPreloading && !blobUrl) {
      setPhase('fallback');
    }
  }, [isPreloading, blobUrl, phase]);

  // ── 4. Llamar play() DESPUÉS del render en que el <video> aparece ──────────
  // Este effect corre tras el commit del DOM, así videoRef.current ya está seteado.
  useEffect(() => {
    if (phase !== 'playing' || !blobUrl) return;
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      if (isMounted.current) setPhase('fallback');
    });
  }, [phase, blobUrl]);

  // ── 5. Countdown del fallback ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'fallback') return;
    const id = setInterval(() => {
      setFallbackCountdown((prev: number) => {
        if (prev <= 1) { clearInterval(id); onVideoEnded(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, onVideoEnded]);

  const progress =
    phase === 'fallback'
      ? (duration - fallbackCountdown) / duration
      : duration > 0 ? currentTime / duration : 0;

  const fmt = (s: number) => {
    const t = Math.max(0, Math.floor(s));
    return `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative bg-black overflow-hidden select-none w-full h-full z-10">

      {/* STARTING BANNER */}
      {showStartingBanner && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 animate-fade-in">
          <div
            className="text-center p-10 rounded-3xl shadow-gold-glow animate-scale-up glass-panel"
            style={{ boxShadow: '0 0 60px rgba(245,197,24,0.35)', borderColor: 'rgba(245,197,24,0.5)' }}
          >
            <h1 className="font-display font-black text-6xl md:text-8xl text-gradient-gold tracking-widest leading-none">
              🏁 STARTING RACE
            </h1>
            <p className="text-gray-300 font-display font-black tracking-[0.25em] text-lg md:text-2xl uppercase mt-5">
              PREPÁRENSE PARA LA CARRERA
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-600 animate-pulse" />
              <span className="w-4 h-4 rounded-full bg-red-600 animate-pulse delay-75" />
              <span className="w-4 h-4 rounded-full bg-red-600 animate-pulse delay-150" />
            </div>
          </div>
        </div>
      )}

      {/* VIDEO — siempre en el DOM cuando hay blobUrl, para que el effect
          de play() tenga acceso al ref tras el render */}
      {blobUrl && (
        <video
          ref={videoRef}
          key={blobUrl}
          src={blobUrl}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ visibility: phase === 'playing' ? 'visible' : 'hidden' }}
          muted
          playsInline
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              if (videoRef.current.duration) setDuration(videoRef.current.duration);
            }
          }}
          onEnded={onVideoEnded}
          onError={() => { if (isMounted.current && phase === 'playing') setPhase('fallback'); }}
        />
      )}

      {/* CARGANDO TRANSMISIÓN */}
      {phase === 'loading' && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-10">
          <div
            className="text-center p-10 rounded-3xl glass-panel"
            style={{ borderColor: 'rgba(245,197,24,0.3)' }}
          >
            <div className="w-16 h-16 border-4 border-pos-yellow border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="font-display font-black text-white text-3xl tracking-widest uppercase mt-6">
              Cargando transmisión
            </h2>
            <p className="text-gray-400 font-display font-bold tracking-widest text-sm uppercase mt-2">
              CARRERA {currentRace?.numero || '---'} — CIRCUITO MBSPORT
            </p>
          </div>
        </div>
      )}

      {/* FALLBACK DE CONTINGENCIA */}
      {phase === 'fallback' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-pos-gray/80 to-black z-0 flex flex-col items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(245,197,24,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,197,24,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-40" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pos-yellow/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          <div className="text-center z-10 max-w-2xl p-8 rounded-3xl shadow-card glass-panel">
            <div className="inline-flex items-center gap-3 bg-red-600/90 text-white font-display font-black text-sm tracking-widest px-6 py-2 rounded-full border border-red-500 uppercase animate-pulse mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              Transmisión de Contingencia
            </div>
            <h1 className="font-display font-black text-white text-5xl tracking-wide uppercase leading-none">
              CARRERA {currentRace?.numero || '---'}
            </h1>
            <p className="text-gray-400 font-display font-bold tracking-widest text-sm uppercase mt-3">
              GALGOS EN COMPETENCIA - CIRCUITO MBSPORT
            </p>
            <div className="mt-8 flex justify-center relative">
              <div className="w-40 h-40 rounded-full border-4 border-pos-border flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
                <div className="absolute inset-0 border-4 border-pos-yellow border-t-transparent rounded-full animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">CRONÓMETRO</span>
                <span className="text-4xl font-extrabold text-gradient-gold font-mono mt-1 tracking-wider leading-none">
                  {fmt(fallbackCountdown)}
                </span>
                <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">EN CURSO</span>
              </div>
            </div>
            <div className="w-full bg-pos-gray/80 border border-pos-border h-3.5 rounded-full mt-8 overflow-hidden relative">
              <div
                className="bg-gold-gradient h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,197,24,0.5)]"
                style={{ width: `${(progress * 100).toFixed(1)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 font-bold font-mono tracking-widest mt-2 uppercase">
              <span>LARGADA</span>
              <span>META</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
