import React, { useEffect, useRef, useState } from 'react';

interface X2AnimationProps {
  dog: number;
  onClose: () => void;
}

const DOG_META: Record<number, { color: string; textColor: string; name: string; isStripes?: boolean }> = {
  1: { color: '#ff0000', textColor: '#ffffff', name: 'BRAVO' },
  2: { color: '#005eff', textColor: '#ffffff', name: 'RELÁMPAGO' },
  3: { color: '#ffffff', textColor: '#111111', name: 'TIGRE' },
  4: { color: '#111111', textColor: '#ffffff', name: 'NEGRO' },
  5: { color: '#e8760a', textColor: '#ffffff', name: 'FURIA' },
  6: { color: 'stripes', textColor: '#ff0000', name: 'BANDIDO', isStripes: true },
};

const BOLTS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  top: ((i * 41 + 7) % 85) + 5,
  left: ((i * 61 + 13) % 88) + 4,
  delay: (i * 0.15) % 1.8,
  scale: 0.7 + (i % 4) * 0.2,
}));

function useX2Audio() {
  const ctxRef = useRef<AudioContext | null>(null);

  function playAll() {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      ctxRef.current = ctx;
      const master = ctx.createGain();
      master.gain.value = 0.65;
      master.connect(ctx.destination);
      const now = ctx.currentTime;

      // Electric zap — noise burst through bandpass
      const bufSize = Math.floor(ctx.sampleRate * 0.4);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass'; bpf.Q.value = 4;
      bpf.frequency.setValueAtTime(1200, now);
      bpf.frequency.exponentialRampToValueAtTime(300, now + 0.35);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.7, now);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      noise.connect(bpf); bpf.connect(ng); ng.connect(master);
      noise.start(now); noise.stop(now + 0.45);

      // Rising sweep
      const osc = ctx.createOscillator();
      const og = ctx.createGain();
      osc.connect(og); og.connect(master);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.55);
      og.gain.setValueAtTime(0.35, now + 0.1);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.start(now + 0.1); osc.stop(now + 0.65);

      // Power chord E5-B5 (electric feel)
      [[659.25, 0.6, 0.9], [987.77, 0.65, 0.85]].forEach(([freq, t, dur]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const dist = ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
          const x = (i * 2) / 256 - 1;
          curve[i] = (Math.PI + 300) * x / (Math.PI + 300 * Math.abs(x));
        }
        dist.curve = curve;
        o.connect(dist); dist.connect(g); g.connect(master);
        o.type = 'sawtooth'; o.frequency.value = freq;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35, t + 0.02);
        g.gain.setValueAtTime(0.35, t + dur * 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t); o.stop(t + dur + 0.05);
      });
    } catch (e) {
      console.warn('X2Audio error', e);
    }
  }

  function stop() { try { ctxRef.current?.close(); ctxRef.current = null; } catch (_) {} }
  return { playAll, stop };
}

export const X2Animation: React.FC<X2AnimationProps> = ({ dog, onClose }) => {
  const [countdown, setCountdown] = useState(6);
  const { playAll, stop } = useX2Audio();
  const meta = DOG_META[dog] ?? { color: '#e8760a', textColor: '#ffffff', name: `PERRO ${dog}` };

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

  const dogBadgeStyle: React.CSSProperties = meta.isStripes
    ? { background: 'repeating-linear-gradient(45deg,#111 0px,#111 8px,#fff 8px,#fff 16px)', color: meta.textColor }
    : { background: meta.color, color: meta.textColor };

  return (
    <div
      className="fixed inset-0 z-[998] flex flex-col items-center justify-center overflow-hidden x2-overlay"
      onClick={onClose}
    >
      <div className="absolute inset-0 x2-backdrop" />
      <div className="absolute inset-0 x2-bg-glow pointer-events-none" />

      {/* Background lightning bolts */}
      {BOLTS.map(b => (
        <span key={b.id} className="absolute x2-bolt pointer-events-none select-none"
          style={{ top: `${b.top}%`, left: `${b.left}%`, fontSize: '26px',
            animationDelay: `${b.delay}s`, transform: `scale(${b.scale})` }}>
          ⚡
        </span>
      ))}

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center text-center px-14 py-10 x2-card pointer-events-none"
        onClick={e => e.stopPropagation()}>

        {/* Top label */}
        <div className="x2-top-label font-display font-black uppercase tracking-[0.5em] select-none mb-3">
          MULTIPLICADOR ACTIVADO
        </div>

        {/* X2 mega text */}
        <div className="x2-title font-display font-black select-none">
          ⚡ X2 ⚡
        </div>

        {/* Dog badge + name */}
        <div className="flex items-center gap-5 mt-5 x2-dog-enter">
          <div className="x2-dog-badge font-display font-black select-none"
            style={dogBadgeStyle}>
            {dog}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-white/50 text-sm font-bold tracking-widest uppercase font-display">Perro</span>
            <span className="x2-dog-name font-display font-black uppercase select-none"
              style={{ color: meta.isStripes ? '#ff0000' : meta.color === '#111111' ? '#aaaaaa' : meta.color }}>
              {meta.name}
            </span>
          </div>
        </div>

        {/* Subtitle */}
        <div className="mt-5 x2-subtitle font-display font-bold uppercase select-none">
          Su cuota se duplica esta carrera
        </div>

        <p className="mt-5 text-sm tracking-widest font-mono select-none x2-hint">
          Toca para cerrar · {countdown}s
        </p>
      </div>
    </div>
  );
};
