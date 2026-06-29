import React, { useEffect, useRef, useState } from 'react';

interface VideoRaceProps {
  currentRace: any;
  onVideoEnded: () => void;
}

const LOCAL_VIDEO_PATH = 'C:/ProgramData/MBSport/videos/';

export const VideoRace: React.FC<VideoRaceProps> = ({ currentRace, onVideoEnded }) => {
  const [phase, setPhase] = useState<'loading' | 'playing' | 'fallback'>('loading');
  const [fallbackCountdown, setFallbackCountdown] = useState(currentRace?.video?.durationSeconds || 45);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;

    const archivo = currentRace?.video?.archivo;
    if (!archivo) { setPhase('fallback'); return; }

    const video = videoRef.current;
    if (!video) { onVideoEnded(); return; }

    // Extraer nombre del archivo y construir ruta local
    const filename = archivo.split('/').pop() || archivo;
    const nombre = filename.replace(/\.[^.]+$/, '');
    const localUrl = `file:///${LOCAL_VIDEO_PATH}${nombre}.mp4`;

    video.src = localUrl;
    video.load();
    video.play()
      .then(() => { if (isMounted.current) setPhase('playing'); })
      .catch(() => { if (isMounted.current) setPhase('fallback'); });

  }, [currentRace?.video?.archivo]);

  // Fallback: countdown local
  useEffect(() => {
    if (phase !== 'fallback') return;
    const d = currentRace?.video?.durationSeconds || 45;
    let remaining = d;
    const id = setInterval(() => {
      remaining--;
      setFallbackCountdown(remaining);
      if (remaining <= 0) { clearInterval(id); onVideoEnded(); }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, onVideoEnded]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black z-[950]"
        style={{ visibility: phase === 'playing' ? 'visible' : 'hidden' }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          onEnded={onVideoEnded}
          onError={() => setPhase('fallback')}
        />
      </div>

      {phase === 'fallback' && (
        <div className="fixed inset-0 z-[940] flex items-end justify-center pb-12">
          <div className="bg-black/60 px-8 py-4 rounded-full border border-white/20">
            <span className="text-white font-mono text-lg tracking-widest">
              {String(Math.floor(fallbackCountdown / 60)).padStart(2, '0')}:
              {String(fallbackCountdown % 60).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
