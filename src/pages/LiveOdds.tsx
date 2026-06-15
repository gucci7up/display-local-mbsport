import React from 'react';
import { DOGS_METADATA } from './Lobby';
import { LiveOddsValue } from '../components/LiveOddsValue';

interface LiveOddsProps {
  status: string;
  liveOdds: any[];
}

export const LiveOdds: React.FC<LiveOddsProps> = ({ status, liveOdds }) => {
  // Helper to fetch odds from the array or fallback
  const getDogOddsVal = (dogId: number, type: 'win' | 'exacta' | 'trifecta') => {
    let selectKey = String(dogId);

    if (type === 'exacta') {
      // Find the first combination starting with this dog, e.g. "1-2"
      const item = liveOdds.find(
        (o) => o.betType === 'EXACTA' && o.selection.startsWith(`${dogId}-`)
      );
      if (item && Number(item.currentOdds) > 1) {
        return Number(item.currentOdds).toFixed(2);
      }
      return DOGS_METADATA[dogId - 1].defaultOdds.exacta.toFixed(2);
    }

    if (type === 'trifecta') {
      // Find the first combination starting with this dog, e.g. "1-2-3"
      const item = liveOdds.find(
        (o) => o.betType === 'TRIFECTA' && o.selection.startsWith(`${dogId}-`)
      );
      if (item && Number(item.currentOdds) > 1) {
        return Number(item.currentOdds).toFixed(2);
      }
      return DOGS_METADATA[dogId - 1].defaultOdds.trifecta.toFixed(2);
    }

    // Winner odds
    const item = liveOdds.find(
      (o) => o.betType === 'WINNER' && o.selection === selectKey
    );
    if (item && Number(item.currentOdds) > 1) {
      return Number(item.currentOdds).toFixed(2);
    }
    return DOGS_METADATA[dogId - 1].defaultOdds.win.toFixed(2);
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-black/40 select-none overflow-hidden relative z-10">
      {/* Title Bar inside content */}
      <div className="flex items-center justify-between mb-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-gradient-gold text-xl tracking-wider uppercase">
            Cuotas en Vivo
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 font-mono">
          <span>
            ESTADO: <span className="text-pos-green-light font-bold font-display text-sm">{status}</span>
          </span>
          <span className="h-4 w-[1px] bg-pos-border" />
          <span>ACTUALIZADO: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      <div className="gold-divider -mt-4 mb-4" />

      {/* Odds Table */}
      <div className="flex-1 overflow-hidden rounded-2xl flex flex-col mb-4 glass-panel">
        {/* Table Header */}
        <div className="grid grid-cols-4 px-6 py-3.5 bg-black/40 border-b border-white/[0.06] text-xs font-black tracking-wider text-gray-400 font-display uppercase shrink-0">
          <div>PERRO</div>
          <div className="text-right pr-6 text-pos-yellow/80">GANAR</div>
          <div className="text-right pr-6">EXACTA</div>
          <div className="text-right pr-6">TRIFECTA</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 flex flex-col justify-between py-2">
          {DOGS_METADATA.map((dog) => (
            <div
              key={dog.id}
              className="grid grid-cols-4 items-center px-6 py-2.5 border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.03] transition-all duration-150"
            >
              {/* Perro Name and Badge */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-black text-xl border border-black/50 shadow-md`}
                  style={{
                    background: dog.isStripes
                      ? 'repeating-linear-gradient(45deg, #111 0px, #111 5px, #fff 5px, #fff 10px)'
                      : dog.color,
                    color: dog.textColor,
                  }}
                >
                  {dog.id}
                </div>
                <span className="font-display font-black text-lg text-white tracking-wide uppercase">
                  {dog.name}
                </span>
              </div>

              {/* Ganar (Yellow) */}
              <div className="text-right pr-6 text-2xl text-pos-yellow font-bold">
                <LiveOddsValue value={getDogOddsVal(dog.id, 'win')} />
              </div>

              {/* Exacta (White) */}
              <div className="text-right pr-6 text-2xl text-white">
                <LiveOddsValue value={getDogOddsVal(dog.id, 'exacta')} />
              </div>

              {/* Trifecta (White) */}
              <div className="text-right pr-6 text-2xl text-white">
                <LiveOddsValue value={getDogOddsVal(dog.id, 'trifecta')} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Branding Banner */}
      <div className="h-10 flex items-center justify-center gap-2 rounded-2xl shrink-0 glass-panel">
        <span className="font-display font-black text-gradient-gold tracking-wider text-base">MB</span>
        <span className="font-display font-black text-white tracking-wider text-base">SPORT</span>
        <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase ml-1">
          Racing Dogs
        </span>
      </div>
    </div>
  );
};
