import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';

interface VideoRaceProps {
  currentRace: any;
  onVideoEnded: () => void;
}

export const VideoRace: React.FC<VideoRaceProps> = ({ currentRace, onVideoEnded }) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [downloadFailed, setDownloadFailed] = useState<boolean>(false);
  const [showStartingBanner, setShowStartingBanner] = useState<boolean>(true);
  
  // Video playback time or fallback countdown progress
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(42);
  const [fallbackCountdown, setFallbackCountdown] = useState<number>(42);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackIntervalRef = useRef<number | null>(null);

  // Determine current progress (for fallback progress bar)
  const progress = downloadFailed ? (duration - fallbackCountdown) / duration : currentTime / duration;

  // 1. Download Video Blob using auth header
  useEffect(() => {
    let active = true;
    let localBlobUrl: string | null = null;

    const loadVideo = async () => {
      if (!currentRace?.video) {
        setIsLoading(false);
        setDownloadFailed(true);
        return;
      }

      setIsLoading(true);
      setDownloadFailed(false);
      setShowStartingBanner(true);
      setCurrentTime(0);
      
      const videoDuration = currentRace.video.durationSeconds || 42;
      setDuration(videoDuration);
      setFallbackCountdown(videoDuration);

      // Extract filename from archivo path (e.g. "/opt/mbraces/videos/111.webm" -> "111.webm")
      const archivoPath = currentRace.video.archivo || '';
      const filename = archivoPath.split('/').pop() || `${currentRace.video.nombre}.webm`;

      // Log exact debugging info as requested by the user
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.mbsport.lat';
      const absoluteVideoUrl = `${baseUrl.replace(/\/+$/, '')}/videos/${filename}`;
      console.log(`Race Number: ${currentRace.numero}`);
      console.log(`Video Number: ${currentRace.video?.nombre || '---'}`);
      console.log(`Video URL: ${absoluteVideoUrl}`);

      try {
        const blob = await api.getVideoBlob(filename);
        
        if (!active) return;
        
        localBlobUrl = URL.createObjectURL(blob);
        setVideoSrc(localBlobUrl);
        setIsLoading(false);
        
        // Starting Banner timeout of 2 seconds
        setTimeout(() => {
          if (active) {
            setShowStartingBanner(false);
            if (videoRef.current) {
              videoRef.current.play().catch((err) => {
                console.error("Autoplay failed:", err);
              });
            }
          }
        }, 2000);

      } catch (err) {
        console.error("Failed to fetch video blob from API:", err);
        if (!active) return;
        
        setIsLoading(false);
        setDownloadFailed(true);
        
        // Show starting banner for 2 seconds even in fallback
        setTimeout(() => {
          if (active) {
            setShowStartingBanner(false);
          }
        }, 2000);
      }
    };

    loadVideo();

    return () => {
      active = false;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [currentRace?.id]);

  // 2. Handle Fallback Countdown Timer when download fails
  useEffect(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }

    if (downloadFailed && !showStartingBanner) {
      fallbackIntervalRef.current = setInterval(() => {
        setFallbackCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(fallbackIntervalRef.current!);
            onVideoEnded();
            return 0;
          }
          return prev - 1;
        }) as unknown as number;
      }, 1000) as unknown as number;
    }

    return () => {
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, [downloadFailed, showStartingBanner]);

  // Handle video element time update and ended events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleVideoEnded = () => {
    onVideoEnded();
  };

  // Helper to format remaining time MM:SS
  const formatSeconds = (totalSecs: number) => {
    const secs = Math.max(0, Math.floor(totalSecs));
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative bg-black overflow-hidden select-none w-full h-full z-10">
      
      {/* 1. STARTING BANNER OVERLAY */}
      {showStartingBanner && !isLoading && (
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

      {/* 2. LOADING STATE */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-40">
          <div className="flex flex-col items-center p-8 rounded-2xl shadow-card glass-panel">
            <div className="w-16 h-16 border-4 border-pos-yellow border-t-transparent rounded-full animate-spin" />
            <h2 className="text-gradient-gold font-display font-black text-xl tracking-widest mt-6 uppercase">
              Conectando con la Transmisión
            </h2>
            <p className="text-gray-400 font-mono text-xs mt-2 uppercase tracking-wider">
              Descargando Feed de Video de la API...
            </p>
          </div>
        </div>
      )}

      {/* 3. VIDEO RENDER */}
      {!isLoading && !downloadFailed && videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
        />
      )}

      {/* 4. CONTINGENCY FALLBACK GRAPHICS DISPLAY */}
      {!isLoading && downloadFailed && (
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-pos-gray/80 to-black z-0 flex flex-col items-center justify-center p-12 overflow-hidden">
          {/* Animated Stadium/Radar Background Grid Effect */}
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

            {/* Circular Race Track Progress Loader */}
            <div className="mt-8 flex justify-center relative">
              <div className="w-40 h-40 rounded-full border-4 border-pos-border flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
                {/* Spinning border overlay */}
                <div
                  className="absolute inset-0 border-4 border-pos-yellow border-t-transparent rounded-full animate-spin"
                  style={{ animationDuration: '6s' }}
                />
                <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">CRONÓMETRO</span>
                <span className="text-4xl font-extrabold text-gradient-gold font-mono mt-1 tracking-wider leading-none">
                  {formatSeconds(fallbackCountdown)}
                </span>
                <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">EN CURSO</span>
              </div>
            </div>

            {/* Track Progress Bar */}
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
