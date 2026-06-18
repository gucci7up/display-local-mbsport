import React, { useEffect, useState, useRef } from 'react';

interface VideoRaceProps {
  currentRace: any;
  onVideoEnded: () => void;
  videoUrl: string | null;
}

export const VideoRace: React.FC<VideoRaceProps> = ({ currentRace, onVideoEnded, videoUrl }) => {
  const [showStartingBanner, setShowStartingBanner] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [fallbackCountdown, setFallbackCountdown] = useState(42);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentRace?.video?.durationSeconds || 42);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Reset state when race changes
  useEffect(() => {
    const d = currentRace?.video?.durationSeconds || 42;
    setDuration(d);
    setFallbackCountdown(d);
    setCurrentTime(0);
    setVideoFailed(false);
    setShowStartingBanner(true);

    // Show banner 2s then play
    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      setShowStartingBanner(false);
      if (!videoRef.current) {
        // No video element (videoUrl is null) — go straight to fallback countdown
        setVideoFailed(true);
        return;
      }
      videoRef.current.play().catch(() => {
        if (isMountedRef.current) setVideoFailed(true);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentRace?.id]);

  // Fallback countdown when video fails
  useEffect(() => {
    if (!videoFailed || showStartingBanner) return;
    const id = setInterval(() => {
      setFallbackCountdown((prev) => {
        if (prev <= 1) { clearInterval(id); onVideoEnded(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [videoFailed, showStartingBanner, onVideoEnded]);

  const progress = videoFailed
    ? (duration - fallbackCountdown) / duration
    : duration > 0 ? currentTime / duration : 0;

  const formatSeconds = (s: number) => {
    const t = Math.max(0, Math.floor(s));
    return `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative bg-black overflow-hidden select-none w-full h-full z-10">

      {/* STARTING BANNER */}
      {showStartingBanner && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-10 rounded-3xl shadow-gold-glow animate-scale-up glass-panel" style={{ boxShadow: '0 0 60px rgba(245,197,24,0.35)', borderColor: 'rgba(245,197,24,0.5)' }}>
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

      {/* VIDEO — siempre en el DOM para que el navegador bufferice inmediatamente */}
      {videoUrl && !videoFailed && (
        <video
          ref={videoRef}
          key={videoUrl}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover z-0"
          preload="auto"
          muted
          playsInline
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              if (videoRef.current.duration) setDuration(videoRef.current.duration);
            }
          }}
          onEnded={onVideoEnded}
          onError={() => { if (isMountedRef.current) setVideoFailed(true); }}
        />
      )}

      {/* FALLBACK cuando el video falla */}
      {videoFailed && !showStartingBanner && (
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
                  {formatSeconds(fallbackCountdown)}
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
