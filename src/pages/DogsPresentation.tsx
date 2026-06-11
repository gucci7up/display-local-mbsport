import { DOGS_METADATA } from './Lobby';
import { LiveOddsValue } from '../components/LiveOddsValue';

interface DogsPresentationProps {
  liveOdds: any[];
}

export const DogsPresentation: React.FC<DogsPresentationProps> = ({ liveOdds }) => {
  const getDogOdds = (dogId: number) => {
    const oddItem = liveOdds.find(
      (o) => o.betType === 'WINNER' && Number(o.selection) === dogId
    );
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
    <div className="flex-1 flex flex-col p-6 bg-black/40 select-none overflow-hidden relative z-10">
      {/* 6 Columns Container */}
      <div className="flex-1 grid grid-cols-6 gap-4 items-stretch mb-4">
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
            {/* Column Header (Badge + Name) */}
            <div className="flex flex-col items-center gap-2 p-3 bg-black/60 border-b border-pos-border">
              {/* Badge */}
              <div
                className={`w-12 h-12 rounded flex items-center justify-center font-display font-black text-3xl border border-black/50`}
                style={{
                  background: dog.isStripes
                    ? 'repeating-linear-gradient(45deg, #111 0px, #111 6px, #fff 6px, #fff 12px)'
                    : dog.color,
                  color: dog.textColor,
                }}
              >
                {dog.id}
              </div>
              {/* Name */}
              <span className="font-display font-black text-lg text-white tracking-wide uppercase">
                {dog.name}
              </span>
            </div>

            {/* Dog Image (Centered, Flex-1) */}
            <div className="flex-1 flex items-center justify-center p-2 min-h-[220px]">
              <img
                src={dog.image}
                alt={dog.name}
                className="h-[80%] max-h-[240px] w-auto object-contain drop-shadow-[0_6px_15px_rgba(0,0,0,0.95)]"
              />
            </div>

            {/* Column Footer (Odds) */}
            <div className="p-3 bg-black/75 border-t border-pos-border flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-gray-500 tracking-wider font-display uppercase">
                GANAR
              </span>
              <span className="text-3xl leading-none mt-1">
                <LiveOddsValue value={getDogOdds(dog.id)} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Branding Banner */}
      <div className="h-10 flex items-center justify-center gap-2 border-t border-pos-border bg-pos-bg/50 rounded-lg shrink-0">
        <span className="font-display font-black text-pos-yellow tracking-wider text-base">MB</span>
        <span className="font-display font-black text-white tracking-wider text-base">SPORT</span>
        <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase ml-1">
          Racing Dogs
        </span>
      </div>
    </div>
  );
};
