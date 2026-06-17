import React from 'react';
import { DOGS_METADATA } from './Lobby';
import type { DogInfo } from './Lobby';

interface OfficialResultsProps {
  raceNumber: number | string;
  resultsData: any;
  liveOdds?: any[];
}

export const OfficialResults: React.FC<OfficialResultsProps> = ({
  raceNumber,
  resultsData,
  liveOdds = [],
}) => {
  // Resolve placing IDs from either API format or raceHistory format
  let firstId = 1;
  let secondId = 3;
  let thirdId = 5;

  if (resultsData) {
    // Format A: { winners: { winner, exacta, trifecta } }
    if (resultsData.winners) {
      const w = resultsData.winners;
      if (w.trifecta) {
        const parts = w.trifecta.split('-').map(Number);
        firstId = parts[0] || 1;
        secondId = parts[1] || 3;
        thirdId = parts[2] || 5;
      } else if (w.exacta) {
        const parts = w.exacta.split('-').map(Number);
        firstId = parts[0] || 1;
        secondId = parts[1] || 3;
      } else if (w.winner) {
        firstId = Number(w.winner);
      }
    }
    // Format B: { resultado: "1-3-5" } (from raceHistory)
    else if (resultsData.resultado) {
      const parts = resultsData.resultado.split('-').map(Number);
      firstId = parts[0] || 1;
      secondId = parts[1] || 3;
      thirdId = parts[2] || 5;
    }
  }

  // Exact odds from liveOdds if available, otherwise compute from defaults
  const getExactaOdds = (a: number, b: number): string => {
    const o = liveOdds.find(x => x.betType === 'EXACTA' && x.selection === `${a}-${b}`);
    if (o && +o.currentOdds > 1) return (+o.currentOdds).toFixed(2);
    const d1 = DOGS_METADATA[a - 1]?.defaultOdds.win ?? 2;
    const d2 = DOGS_METADATA[b - 1]?.defaultOdds.win ?? 2;
    return (Math.round(d1 * d2 * 1.8 * 100) / 100).toFixed(2);
  };

  const getWinOdds = (id: number): string => {
    const o = liveOdds.find(x => x.betType === 'WINNER' && x.selection === String(id));
    if (o && +o.currentOdds > 1) return (+o.currentOdds).toFixed(2);
    return (DOGS_METADATA[id - 1]?.defaultOdds.win ?? 2).toFixed(2);
  };

  const exactaOdds = getExactaOdds(firstId, secondId);
  const winOdds = getWinOdds(firstId);

  const firstDog = DOGS_METADATA[firstId - 1] || DOGS_METADATA[0];
  const secondDog = DOGS_METADATA[secondId - 1] || DOGS_METADATA[2];
  const thirdDog = DOGS_METADATA[thirdId - 1] || DOGS_METADATA[4];

  const renderPlaceCard = (dog: DogInfo, place: '1°' | '2°' | '3°', bgGradient: string, delay: string) => {
    const podiumConfig = {
      '1°': { border: '#FFD700', glow: 'rgba(255,215,0,0.6)', badge: 'linear-gradient(135deg,#FFE9A8 0%,#F5C518 45%,#C9960A 100%)', textColor: '#1a1300' },
      '2°': { border: '#C0C0C0', glow: 'rgba(192,192,192,0.5)', badge: 'linear-gradient(135deg,#F2F2F2 0%,#C0C0C0 45%,#8c8c8c 100%)', textColor: '#1a1a1a' },
      '3°': { border: '#CD7F32', glow: 'rgba(205,127,50,0.5)', badge: 'linear-gradient(135deg,#E3A468 0%,#CD7F32 45%,#8a521c 100%)', textColor: '#1a0f00' },
    }[place];
    const placeNumber = place.replace('°', '');

    return (
      <div
        className="flex items-center gap-6 p-4 rounded-2xl border relative overflow-hidden h-[95px] animate-result-card glass-panel"
        style={{
          backgroundImage: `linear-gradient(to right, ${bgGradient})`,
          animationDelay: delay,
          borderColor: podiumConfig.border,
          boxShadow: `0 0 20px ${podiumConfig.glow}, inset 0 0 10px ${podiumConfig.glow}`,
        } as React.CSSProperties}
      >
        <div
          className="flex items-center justify-center font-display font-black text-3xl w-14 h-14 rounded-full shrink-0 shadow-lg"
          style={{ background: podiumConfig.badge, color: podiumConfig.textColor }}
        >
          {placeNumber}°
        </div>

        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center font-display font-black text-3xl border border-black/50 shrink-0 shadow-md"
          style={{
            background: dog.isStripes
              ? 'repeating-linear-gradient(45deg,#111 0px,#111 6px,#fff 6px,#fff 12px)'
              : dog.color,
            color: dog.textColor,
          }}
        >
          {dog.id}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <span className="font-display font-black text-2xl text-white tracking-wide uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {dog.name}
          </span>
          <span className="text-[10px] font-bold text-gray-400 mt-1 tracking-wider font-display uppercase leading-none">
            {place === '1°' ? 'PRIMER LUGAR' : place === '2°' ? 'SEGUNDO LUGAR' : 'TERCER LUGAR'}
          </span>
        </div>

        <div className="absolute right-2 top-0 bottom-0 flex items-center h-full w-[140px] justify-end overflow-hidden pointer-events-none opacity-90">
          <img
            src={dog.image}
            alt={dog.name}
            className="h-[80px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
          />
        </div>
      </div>
    );
  };

  // Mientras no hay resultados, mostrar pantalla de espera
  if (!resultsData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black select-none">
        <div className="flex flex-col items-center gap-6 p-10 rounded-3xl glass-panel" style={{ boxShadow: '0 0 60px rgba(245,197,24,0.15)' }}>
          <div className="w-14 h-14 border-4 border-pos-yellow border-t-transparent rounded-full animate-spin" />
          <span className="font-display font-black text-gradient-gold text-2xl tracking-widest uppercase">
            Calculando Resultados...
          </span>
          <span className="text-gray-500 text-sm tracking-widest uppercase font-bold">
            Carrera {raceNumber}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 bg-black select-none overflow-hidden relative">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-3 shrink-0">
        <span className="font-display font-black text-white text-xl tracking-wider uppercase">
          Resultado Oficial · Carrera {raceNumber}
        </span>
        <span className="font-display font-extrabold text-gradient-gold text-lg tracking-wider uppercase">
          Finalizada
        </span>
      </div>
      <div className="gold-divider" />

      <div className="flex-1 flex gap-6 my-4 overflow-hidden">
        {/* Left: Place Cards */}
        <div className="flex-1 flex flex-col justify-between py-2 gap-4">
          {renderPlaceCard(firstDog, '1°', 'from-amber-600/35 via-pos-bg to-pos-bg', '0.1s')}
          {renderPlaceCard(secondDog, '2°', 'from-slate-500/30 via-pos-bg to-pos-bg', '0.3s')}
          {renderPlaceCard(thirdDog, '3°', 'from-amber-900/30 via-pos-bg to-pos-bg', '0.5s')}
        </div>

        {/* Right: Bet Results */}
        <div className="w-[320px] flex flex-col justify-between shrink-0 py-2 gap-4">
          {/* GANADOR */}
          <div
            className="flex-1 flex flex-col justify-center rounded-2xl p-4 text-center animate-result-card glass-panel"
            style={{
              animationDelay: '0.6s',
              boxShadow: '0 0 25px rgba(245,197,24,0.25), inset 0 0 15px rgba(245,197,24,0.05)',
              borderColor: 'rgba(245,197,24,0.35)',
            } as React.CSSProperties}
          >
            <span className="text-xs font-black text-gray-500 tracking-widest font-display uppercase">GANADOR</span>
            <span className="text-5xl font-extrabold text-white font-mono mt-2 tracking-wider">
              {firstId}
            </span>
            <span className="text-2xl font-extrabold text-gradient-gold font-display mt-1">
              x{winOdds}
            </span>
          </div>

          {/* EXACTA */}
          <div
            className="flex-1 flex flex-col justify-center rounded-2xl p-4 text-center animate-result-card glass-panel"
            style={{
              animationDelay: '0.8s',
              boxShadow: '0 0 25px rgba(245,197,24,0.25), inset 0 0 15px rgba(245,197,24,0.05)',
              borderColor: 'rgba(245,197,24,0.35)',
            } as React.CSSProperties}
          >
            <span className="text-xs font-black text-gray-500 tracking-widest font-display uppercase">EXACTA</span>
            <span className="text-3xl font-extrabold text-white font-mono mt-2 tracking-wider">
              {firstId} – {secondId}
            </span>
            <span className="text-2xl font-extrabold text-gradient-gold font-display mt-1">
              x{exactaOdds}
            </span>
          </div>

          {/* TRIFECTA */}
          <div
            className="flex-1 flex flex-col justify-center rounded-2xl p-4 text-center animate-result-card glass-panel"
            style={{
              animationDelay: '1s',
              boxShadow: '0 0 25px rgba(245,197,24,0.25), inset 0 0 15px rgba(245,197,24,0.05)',
              borderColor: 'rgba(245,197,24,0.35)',
            } as React.CSSProperties}
          >
            <span className="text-xs font-black text-gray-500 tracking-widest font-display uppercase">TRIFECTA</span>
            <span className="text-3xl font-extrabold text-white font-mono mt-2 tracking-wider">
              {firstId} – {secondId} – {thirdId}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="h-10 flex items-center justify-center gap-2 rounded-2xl shrink-0 glass-panel">
        <span className="font-display font-black text-gradient-gold tracking-wider text-base">MB</span>
        <span className="font-display font-black text-white tracking-wider text-base">SPORT</span>
        <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase ml-1">Racing Dogs</span>
      </div>
    </div>
  );
};
