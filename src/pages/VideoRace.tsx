import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { api } from '../services/api';

interface VideoRaceProps {
  currentRace: any;
  onVideoEnded: () => void;
}

type Phase = 'banner' | 'loading' | 'playing' | 'fallback';

export const VideoRace: React.FC<VideoRaceProps> = ({ currentRace, onVideoEnded }) => {
  const [phase, setPhase] = useState<Phase>('banner');
  const [fallbackCountdown, setFallbackCountdown] = useState(
    currentRace?.video?.durationSeconds || 42,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentRace?.video?.durationSeconds || 42);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const hlsRef    = useRef<Hls | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, []);

  // ── Reset al cambiar de carrera ────────────────────────────────────────────
  useEffect(() => {
    const d = currentRace?.video?.durationSeconds || 42;
    setDuration(d);
    setFallbackCountdown(d);
    setCurrentTime(0);
    setPhase('banner');

    // Destruir instancia HLS anterior si la hubiera
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const timer = setTimeout(() => {
      if (!isMounted.current) return;
      const hlsReady = currentRace?.video?.hlsReady;
      const archivo  = currentRace?.video?.archivo;
      if (hlsReady && archivo) {
        setPhase('loading');
      } else {
        setPhase('fallback');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentRace?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Iniciar HLS cuando phase pasa a 'loading' ──────────────────────────────
  useEffect(() => {
    if (phase !== 'loading') return;

    const archivo = currentRace?.video?.archivo;
    if (!archivo) { setPhase('fallback'); return; }

    const video = videoRef.current;
    if (!video) { setPhase('fallback'); return; }

    // URLs a intentar en orden: local primero (si aplica), luego online
    const urls = api.isUsingLocalVideo()
      ? [api.getHlsUrl(archivo), api.getOnlineHlsUrl(archivo)]
      : [api.getHlsUrl(archivo)];

    let urlIndex = 0;

    const tryNext = () => {
      if (!isMounted.current) return;
      if (urlIndex >= urls.length) { setPhase('fallback'); return; }

      const hlsUrl = urls[urlIndex++];

      // Destruir instancia anterior si existe
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 60,
          xhrSetup: (xhr: XMLHttpRequest) => {
            const token = api.getToken();
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          },
        });
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play()
            .then(() => { if (isMounted.current) setPhase('playing'); })
            .catch(tryNext);
        });

        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (data.fatal && isMounted.current) {
            hls.destroy();
            hlsRef.current = null;
            tryNext();
          }
        });

        hls.loadSource(hlsUrl);
        hls.attachMedia(video);

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.play()
          .then(() => { if (isMounted.current) setPhase('playing'); })
          .catch(tryNext);
      } else {
        setPhase('fallback');
      }
    };

    tryNext();
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Countdown fallback ─────────────────────────────────────────────────────
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

  const progress = phase === 'fallback'
    ? (duration - fallbackCountdown) / duration
    : duration > 0 ? currentTime / duration : 0;

  const fmt = (s: number) => {
    const t = Math.max(0, Math.floor(s));
    return `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative bg-black overflow-hidden select-none w-full h-full z-10">

      {/* VIDEO — siempre en el DOM para que el ref esté disponible */}
      <video
        ref={videoRef}
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
      />

      {/* STARTING BANNER */}
      {phase === 'banner' && (
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

      {/* CARGANDO HLS */}
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

      {/* FALLBACK */}
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
