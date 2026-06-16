import React, { useEffect, useRef, useState } from 'react';

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

function useJackpotAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }

  function coinClink(ctx: AudioContext, master: GainNode, time: number, pitch = 1.0, vol = 0.3) {
    const harmonics: [number, number][] = [[1, vol], [2.756, vol * 0.55], [5.404, vol * 0.3], [8.9, vol * 0.15]];
    harmonics.forEach(([h, v]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(master);
      osc.type = 'sine';
      osc.frequency.value = (1000 + Math.random() * 900) * pitch * h;
      const decay = 0.04 / h + 0.18;
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(v, time + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, time + decay);
      osc.start(time);
      osc.stop(time + decay + 0.04);
    });
  }

  function whoosh(ctx: AudioContext, master: GainNode, time: number) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const g = ctx.createGain();
    filter.type = 'bandpass';
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(200, time);
    filter.frequency.exponentialRampToValueAtTime(2200, time + 0.45);
    osc.connect(filter);
    filter.connect(g);
    g.connect(master);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, time);
    osc.frequency.exponentialRampToValueAtTime(900, time + 0.45);
    g.gain.setValueAtTime(0.55, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);
    osc.start(time);
    osc.stop(time + 0.55);
  }

  function fanfare(ctx: AudioContext, master: GainNode, startTime: number) {
    const notes: [number, number, number][] = [
      [523.25, 0.00, 0.18],
      [659.25, 0.16, 0.18],
      [783.99, 0.32, 0.18],
      [1046.5, 0.48, 0.55],
      [880.00, 0.88, 0.12],
      [1046.5, 1.00, 0.90],
    ];
    notes.forEach(([freq, delay, dur]) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();
      filter.type = 'lowpass';
      filter.frequency.value = 3500;
      osc.connect(filter);
      filter.connect(g);
      g.connect(master);
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const t = startTime + delay;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.42, t + 0.02);
      g.gain.setValueAtTime(0.42, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  }

  function coinRain(ctx: AudioContext, master: GainNode, duration = 10) {
    const now = ctx.currentTime;
    for (let i = 0; i < 200; i++) {
      const t = now + Math.pow(Math.random(), 0.65) * duration;
      const pitch = 0.55 + Math.random() * 1.1;
      const vol = 0.10 + Math.random() * 0.28;
      coinClink(ctx, master, t, pitch, vol);
    }
  }

  function playAll() {
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const master = ctx.createGain();
      master.gain.value = 0.65;
      master.connect(ctx.destination);
      const now = ctx.currentTime;
      whoosh(ctx, master, now);
      fanfare(ctx, master, now + 0.15);
      coinRain(ctx, master, 10);
    } catch (e) {
      console.warn('JackpotAudio: Web Audio API not available', e);
    }
  }

  function stop() {
    try {
      ctxRef.current?.close();
      ctxRef.current = null;
    } catch (_) {}
  }

  return { playAll, stop };
}

export const JackpotAnimation: React.FC<JackpotAnimationProps> = ({ amount, onClose }) => {
  const [countdown, setCountdown] = useState(10);
  const { playAll, stop } = useJackpotAudio();

  useEffect(() => {
    playAll();
    return () => stop();
  }, []);

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
