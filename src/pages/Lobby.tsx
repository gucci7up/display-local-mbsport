import React from 'react';
import { LiveOddsValue } from '../components/LiveOddsValue';

export interface DogInfo {
  id: number;
  name: string;
  color: string;
  textColor: string;
  isStripes: boolean;
  image: string;
  defaultOdds: { win: number; exacta: number; trifecta: number };
}

export const DOGS_METADATA: DogInfo[] = [
  { id: 1, name: 'BRAVO', color: '#ff0000', textColor: '#ffffff', isStripes: false, image: '/dog_1.png', defaultOdds: { win: 2.60, exacta: 5.80, trifecta: 45.00 } },
  { id: 2, name: 'RELÁMPAGO', color: '#005eff', textColor: '#ffffff', isStripes: false, image: '/dog_2.png', defaultOdds: { win: 3.20, exacta: 9.80, trifecta: 52.00 } },
  { id: 3, name: 'TIGRE', color: '#ffffff', textColor: '#111111', isStripes: false, image: '/dog_3.png', defaultOdds: { win: 4.10, exacta: 11.50, trifecta: 61.00 } },
  { id: 4, name: 'NEGRO', color: '#111111', textColor: '#ffffff', isStripes: false, image: '/dog_4.png', defaultOdds: { win: 6.60, exacta: 15.00, trifecta: 78.00 } },
  { id: 5, name: 'FURIA', color: '#e8760a', textColor: '#ffffff', isStripes: false, image: '/dog_5.png', defaultOdds: { win: 7.50, exacta: 18.00, trifecta: 90.00 } },
  { id: 6, name: 'BANDIDO', color: 'stripes', textColor: '#ff0000', isStripes: true, image: '/dog_6.png', defaultOdds: { win: 9.90, exacta: 22.00, trifecta: 120.00 } }
];

interface LobbyProps {
  raceHistory: any[];
  liveOdds: any[];
}

export const Lobby: React.FC<LobbyProps> = ({ raceHistory, liveOdds }) => {
  // Helper to format race time
  const formatRaceTime = (dateStr: string) => {
    if (!dateStr) return '12:00 PM';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatRaceDate = (dateStr: string) => {
    if (!dateStr) return '18/06';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Helper to get odds for a dog
  const getDogOdds = (dogId: number) => {
    const oddItem = liveOdds.find(
      (o) => o.betType === 'WINNER' && Number(o.selection) === dogId
    );
    // If the odd is 1 (mock/unconfigured), return the reference design default
    if (!oddItem || Number(oddItem.currentOdds) <= 1) {
      return DOGS_METADATA[dogId - 1].defaultOdds.win.toFixed(2);
    }
    return Number(oddItem.currentOdds).toFixed(2);
  };

  const getLaneGlowStyle = (dogId: number) => {
    const glowColors: { [key: number]: string } = {
      1: 'rgba(239, 68, 68, 0.35)', // red
      2: 'rgba(0, 94, 255, 0.35)',  // blue
      3: 'rgba(255, 255, 255, 0.2)', // white
      4: 'rgba(75, 85, 99, 0.25)',   // dark gray
      5: 'rgba(232, 118, 10, 0.35)', // orange
      6: 'rgba(255, 255, 255, 0.2)', // white
    };
    const borderColors: { [key: number]: string } = {
      1: 'rgba(239, 68, 68, 0.5)',
      2: 'rgba(0, 94, 255, 0.5)',
      3: 'rgba(255, 255, 255, 0.4)',
      4: 'rgba(75, 85, 99, 0.5)',
      5: 'rgba(232, 118, 10, 0.5)',
      6: 'rgba(255, 255, 255, 0.4)',
    };
    return {
      boxShadow: `0 0 15px ${glowColors[dogId]}, inset 0 0 10px ${glowColors[dogId]}`,
      borderColor: borderColors[dogId],
    };
  };

  const getFavoriteDogId = () => {
    let minOdds = Infinity;
    let favId = 1;
    DOGS_METADATA.forEach((dog) => {
      const oddItem = liveOdds.find(
        (o) => o.betType === 'WINNER' && Number(o.selection) === dog.id
      );
      const oddsVal = oddItem && Number(oddItem.currentOdds) > 1
        ? Number(oddItem.currentOdds)
        : dog.defaultOdds.win;
      if (oddsVal < minOdds) {
        minOdds = oddsVal;
        favId = dog.id;
      }
    });
    return favId;
  };

  return (
    <div className="flex-1 flex gap-6 p-6 overflow-hidden bg-black/40 select-none relative z-10">
      {/* Left Column: Últimos Resultados */}
      <div className="w-[320px] flex flex-col rounded-2xl shrink-0 glass-panel overflow-hidden" style={{ padding: '16px 14px' }}>
        <span className="text-gradient-gold font-display font-black uppercase tracking-widest" style={{ fontSize: 18, letterSpacing: '0.15em', marginBottom: 8 }}>
          Últimos Resultados
        </span>
        <div className="gold-divider" style={{ marginBottom: 0 }} />

        {/* Encabezados posición */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 56px', alignItems: 'center', padding: '6px 8px 4px', borderBottom: '1px solid rgba(212,175,55,0.3)' }}>
          <span style={{ color: '#6b7280', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Carrera</span>
          {['1er', '2do', '3er'].map(pos => (
            <span key={pos} style={{ color: '#D4AF37', fontSize: 11, fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{pos}</span>
          ))}
          <span style={{ color: '#6b7280', fontSize: 10, fontWeight: 700, textAlign: 'right' }}>Hora</span>
        </div>

        {/* Filas */}
        <div className="flex-1 overflow-y-auto">
          {raceHistory.map((race, ridx) => {
            const parts: string[] = race.resultado ? race.resultado.split('-') : [];
            const isEven = ridx % 2 === 0;
            return (
              <div key={race.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 56px', alignItems: 'center', padding: '7px 8px', background: isEven ? 'rgba(255,255,255,0.03)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ color: '#D4AF37', fontFamily: 'monospace', fontWeight: 900, fontSize: 18, lineHeight: 1.2 }}>
                  #{race.numero}
                </div>
                {[0, 1, 2].map(idx => {
                  const num = parts[idx];
                  if (!num) return <div key={idx} />;
                  const dog = DOGS_METADATA[Number(num) - 1];
                  if (!dog) return <div key={idx} />;
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ width: 42, height: 42, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 22, background: dog.isStripes ? 'repeating-linear-gradient(90deg,#111 0,#111 5px,#fff 5px,#fff 10px)' : dog.color, color: dog.textColor, boxShadow: `0 2px 8px ${dog.isStripes ? 'rgba(255,255,255,0.1)' : dog.color + '44'}`, border: '1.5px solid rgba(0,0,0,0.2)' }}>{num}</span>
                    </div>
                  );
                })}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#6b7280', fontSize: 9, fontWeight: 700 }}>{formatRaceDate(race.finishedAt)}</div>
                  <div style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{formatRaceTime(race.finishedAt)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Section: 6 Dog Cards Grid */}
      <div className="flex-1 grid grid-cols-3 gap-6">
        {DOGS_METADATA.map((dog) => (
          <div
            key={dog.id}
            className="flex flex-col rounded-2xl overflow-hidden relative shadow-card transition-all duration-300 glass-panel premium-card"
            style={getLaneGlowStyle(dog.id)}
          >
            {/* Pulsing Gold Favorite Badge */}
            {dog.id === getFavoriteDogId() && (
              <span className="absolute top-2 right-2 flex items-center gap-1 bg-gold-gradient text-black font-display font-black text-[9px] px-2.5 py-1 rounded-full shadow-gold-glow animate-pulse uppercase tracking-widest z-10">
                ★ FAVORITO
              </span>
            )}
            {/* Card Header (Badge + Name) */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-b from-white/[0.04] to-transparent border-b border-white/[0.06]">
              {/* Badge Number */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-black text-2xl border border-black/50 shadow-md`}
                style={{
                  background: dog.isStripes
                    ? 'repeating-linear-gradient(45deg, #111 0px, #111 6px, #fff 6px, #fff 12px)'
                    : dog.color,
                  color: dog.textColor,
                }}
              >
                {dog.id}
              </div>
              {/* Dog Name */}
              <span className="font-display font-black text-xl text-white tracking-wide">
                {dog.name}
              </span>
            </div>

            {/* Centered Dog Image */}
            <div className="flex-1 flex items-center justify-center p-3 overflow-hidden relative min-h-[160px]">
              <img
                src={dog.image}
                alt={dog.name}
                className="h-[80%] max-h-[150px] w-auto object-contain drop-shadow-[0_6px_15px_rgba(0,0,0,0.95)]"
              />
            </div>

            {/* Card Footer: Odds */}
            <div className="p-2.5 bg-black/50 border-t border-white/[0.06] flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-gray-500 tracking-wider font-display uppercase">
                GANAR
              </span>
              <span className="text-2xl leading-none mt-0.5 text-pos-yellow font-bold">
                <LiveOddsValue value={getDogOdds(dog.id)} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
