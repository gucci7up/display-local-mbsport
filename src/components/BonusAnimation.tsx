import React, { useEffect, useRef, useState } from 'react';

interface BonusAnimationProps {
  bonusLabel: string;
  onClose: () => void;
}

const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  top: ((i * 37 + 9) % 82) + 5,
  left: ((i * 53 + 17) % 84) + 6,
  delay: (i * 0.22) % 2.4,
  size: 14 + (i % 5) * 5,
}));

const DIAMONDS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  top: ((i * 47 + 3) % 78) + 8,
  left: ((i * 71 + 21) % 80) + 8,
  delay: (i * 0.28) % 2.0,
}));

function useBonusAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  function playAll() {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      ctxRef.current = ctx;
      const master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
      const now = ctx.currentTime;

      // Sparkle intro — high-freq shimmer
      for (let i = 0; i < 8; i++) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(master);
        o.type = 'sine';
        const freq = 1800 + i * 320;
        o.frequency.value = freq;
        const t = now + i * 0.04;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.25, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        o.start(t); o.stop(t + 0.28);
      }

      // Triumphant fanfare C-E-G-C (major chord cascade)
      const fanfare = [
        [523.25, 0.32], [659.25, 0.44], [783.99, 0.56],
        [1046.5, 0.68], [1046.5, 0.80], [783.99, 0.88],
        [1318.51, 1.0],
      ];
      fanfare.forEach(([freq, t], idx) => {
        const dur = idx === fanfare.length - 1 ? 1.5 : 0.35;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(master);
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.3, t + 0.03);
        g.gain.setValueAtTime(0.3, t + dur * 0.7);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t); o.stop(t + dur + 0.02);
      });

      // Harmony — low C major chord
      [[130.81, 0.68, 2.0], [164.81, 0.70, 1.8], [196.00, 0.72, 1.6]].forEach(([freq, t, dur]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(master);
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t); o.stop(t + dur + 0.05);
      });

      // Coin clinks celebration (8 random tings)
      for (let i = 0; i < 8; i++) {
        const t = now + 1.1 + Math.pow(Math.random(), 0.7) * 4;
        const harmonics = [1, 2.756, 5.404, 8.9];
        harmonics.forEach(h => {
          const freq = (800 + Math.random() * 600) * h;
          if (freq > ctx.sampleRate / 2) return;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(master);
          o.type = 'sine'; o.frequency.value = freq;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.08 / h, t + 0.005);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
          o.start(t); o.stop(t + 0.45);
        });
      }
    } catch (e) {
      console.warn('BonusAudio error', e);
    }
  }

  function stop() { try { ctxRef.current?.close(); ctxRef.current = null; } catch (_) {} }
  return { playAll, stop };
}

export const BonusAnimation: React.FC<BonusAnimationProps> = ({ bonusLabel, onClose }) => {
  const [countdown, setCountdown] = useState(8);
  const { playAll, stop } = useBonusAudio();

  useEffect(() => { playAll(); return () => stop(); }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); onClose(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[997] flex flex-col items-center justify-center overflow-hidden bonus-overlay"
      onClick={onClose}
    >
      <div className="absolute inset-0 bonus-backdrop" />
      <div className="absolute inset-0 bonus-bg-glow pointer-events-none" />

      {/* Floating stars */}
      {STARS.map(s => (
        <span key={s.id} className="absolute bonus-star pointer-events-none select-none"
          style={{ top: `${s.top}%`, left: `${s.left}%`, fontSize: `${s.size}px`, animationDelay: `${s.delay}s` }}>
          ✦
        </span>
      ))}

      {/* Diamonds */}
      {DIAMONDS.map(d => (
        <span key={d.id} className="absolute bonus-diamond pointer-events-none select-none"
          style={{ top: `${d.top}%`, left: `${d.left}%`, fontSize: '18px', animationDelay: `${d.delay}s` }}>
          💎
        </span>
      ))}

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center text-center px-16 py-10 bonus-card pointer-events-none"
        onClick={e => e.stopPropagation()}>

        {/* Trophy icon */}
        <div className="text-7xl mb-1 bonus-trophy">🏆</div>

        {/* TRIFECTA BONUS title */}
        <div className="bonus-title font-display font-black select-none">
          TRIFECTA BONUS
        </div>

        {/* Divider */}
        <div className="bonus-divider my-4" />

        {/* Bonus label (e.g. "+20%") */}
        <div className="bonus-amount font-display font-black select-none">
          {bonusLabel || 'ACTIVADO'}
        </div>

        {/* Subtitle */}
        <div className="mt-4 bonus-subtitle font-display font-bold uppercase tracking-widest select-none">
          ¡Combinación ganadora de trifecta!
        </div>

        <p className="mt-6 text-sm tracking-widest font-mono select-none bonus-hint">
          Toca para cerrar · {countdown}s
        </p>
      </div>
    </div>
  );
};
