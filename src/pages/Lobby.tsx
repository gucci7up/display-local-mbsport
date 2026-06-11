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
      <div className="w-[380px] flex flex-col rounded-lg p-4 shrink-0 glass-panel">
        <h2 className="text-pos-yellow font-display font-extrabold text-xl tracking-wider mb-4 border-b border-pos-border pb-2">
          ÚLTIMOS RESULTADOS
        </h2>

        {/* Results List */}
        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
          {raceHistory.length === 0 ? (
            // Mock Fallbacks matching ref-1.png if history is empty
            <>
              <div className="flex items-center justify-between border-b border-pos-border pb-2.5">
                <span className="text-gray-400 font-mono text-base font-bold">#396</span>
                <span className="flex gap-2">
                  <span className="bg-pos-blue w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white">2</span>
                  <span className="bg-pos-gray border border-pos-border w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white">4</span>
                  <span className="bg-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-black">6</span>
                </span>
                <span className="text-gray-500 font-mono text-xs font-semibold">18/06 12:28 PM</span>
              </div>
              <div className="flex items-center justify-between border-b border-pos-border pb-2.5">
                <span className="text-gray-400 font-mono text-base font-bold">#395</span>
                <span className="flex gap-2">
                  <span className="bg-pos-orange w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white">5</span>
                  <span className="bg-pos-red w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white">1</span>
                  <span className="bg-pos-blue w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white">2</span>
                </span>
                <span className="text-gray-500 font-mono text-xs font-semibold">18/06 12:21 PM</span>
              </div>
              <div className="flex items-center justify-between border-b border-pos-border pb-2.5">
                <span className="text-gray-400 font-mono text-base font-bold">#394</span>
                <span className="flex gap-2">
                  <span className="bg-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-black">3</span>
                  <span className="bg-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-black striped-badge text-stroke-black">6</span>
                  <span className="bg-pos-gray border border-pos-border w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white">4</span>
                </span>
                <span className="text-gray-500 font-mono text-xs font-semibold">18/06 12:14 PM</span>
              </div>
              <div className="flex items-center justify-between border-b border-pos-border pb-2.5">
                <span className="text-gray-400 font-mono text-base font-bold">#393</span>
                <span className="flex gap-2">
                  <span className="bg-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-black striped-badge text-stroke-black">6</span>
                  <span className="bg-pos-blue w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white">2</span>
                  <span className="bg-pos-red w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white">1</span>
                </span>
                <span className="text-gray-500 font-mono text-xs font-semibold">18/06 12:07 PM</span>
              </div>
              <div className="flex items-center justify-between border-b border-pos-border pb-2.5">
                <span className="text-gray-400 font-mono text-base font-bold">#392</span>
                <span className="flex gap-2">
                  <span className="bg-pos-red w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white">1</span>
                  <span className="bg-pos-orange w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white">5</span>
                  <span className="bg-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-black">3</span>
                </span>
                <span className="text-gray-500 font-mono text-xs font-semibold">18/06 12:00 PM</span>
              </div>
            </>
          ) : (
            raceHistory.map((race) => {
              const resParts = race.resultado ? race.resultado.split('-') : [];
              return (
                <div key={race.id} className="flex items-center justify-between border-b border-pos-border pb-2.5">
                  <span className="text-gray-400 font-mono text-base font-bold">#{race.numero}</span>
                  <span className="flex gap-2">
                    {resParts.map((num: string, idx: number) => {
                      const numInt = Number(num);
                      const dogMeta = DOGS_METADATA[numInt - 1];
                      if (!dogMeta) return null;
                      return (
                        <span
                          key={idx}
                          className={`w-6 h-6 rounded flex items-center justify-center font-bold text-sm border border-black/30 shadow-sm`}
                          style={{
                            background: dogMeta.isStripes
                              ? 'repeating-linear-gradient(90deg, #111 0px, #111 4px, #fff 4px, #fff 8px)'
                              : dogMeta.color,
                            color: dogMeta.textColor,
                          }}
                        >
                          {num}
                        </span>
                      );
                    })}
                  </span>
                  <span className="text-gray-500 font-mono text-xs font-semibold">
                    {formatRaceDate(race.finishedAt)} {formatRaceTime(race.finishedAt)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Section: 6 Dog Cards Grid */}
      <div className="flex-1 grid grid-cols-3 gap-6">
        {DOGS_METADATA.map((dog) => (
          <div
            key={dog.id}
            className="flex flex-col rounded-lg overflow-hidden relative shadow-lg transition-all duration-300 glass-panel"
            style={getLaneGlowStyle(dog.id)}
          >
            {/* Pulsing Gold Favorite Badge */}
            {dog.id === getFavoriteDogId() && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-display font-black text-[9px] px-2.5 py-0.5 rounded-full border border-black/40 shadow-md animate-pulse uppercase tracking-widest z-10">
                ★ FAVORITO
              </span>
            )}
            {/* Card Header (Badge + Name) */}
            <div className="flex items-center gap-3 p-3 bg-black/50 border-b border-pos-border">
              {/* Badge Number */}
              <div
                className={`w-10 h-10 rounded flex items-center justify-center font-display font-black text-2xl border border-black/50`}
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
            <div className="p-2.5 bg-black/60 border-t border-pos-border flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-gray-500 tracking-wider font-display uppercase">
                GANAR
              </span>
              <span className="text-2xl leading-none mt-0.5">
                <LiveOddsValue value={getDogOdds(dog.id)} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
