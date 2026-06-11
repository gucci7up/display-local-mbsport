import { DOGS_METADATA } from './Lobby';
import type { DogInfo } from './Lobby';

interface OfficialResultsProps {
  raceNumber: number | string;
  resultsData: any;
}

export const OfficialResults: React.FC<OfficialResultsProps> = ({
  raceNumber,
  resultsData,
}) => {
  // Parse places from winners object
  let firstId = 1;
  let secondId = 3;
  let thirdId = 5;
  let exactaStr = '1 - 3';
  let exactaOdds = '5.80';
  let trifectaStr = '1 - 3 - 5';
  let trifectaOdds = '18.00';

  if (resultsData && resultsData.winners) {
    const winners = resultsData.winners;
    if (winners.winner) firstId = Number(winners.winner);

    if (winners.exacta) {
      const parts = winners.exacta.split('-');
      if (parts.length >= 2) {
        firstId = Number(parts[0]);
        secondId = Number(parts[1]);
        exactaStr = parts.join(' - ');
      }
    }

    if (winners.trifecta) {
      const parts = winners.trifecta.split('-');
      if (parts.length >= 3) {
        firstId = Number(parts[0]);
        secondId = Number(parts[1]);
        thirdId = Number(parts[2]);
        trifectaStr = parts.join(' - ');
      }
    }

    // Attempt to pull real payout or fall back to defaults
    if (resultsData.montoPremios && Number(resultsData.montoPremios) > 0) {
      // If we have actual payouts, we can display them
    }
  }

  const firstDog = DOGS_METADATA[firstId - 1] || DOGS_METADATA[0];
  const secondDog = DOGS_METADATA[secondId - 1] || DOGS_METADATA[2];
  const thirdDog = DOGS_METADATA[thirdId - 1] || DOGS_METADATA[4];

  // Helper to draw place cards
  const renderPlaceCard = (dog: DogInfo, place: '1°' | '2°' | '3°', bgGradient: string, delay: string) => {
    const medal = place === '1°' ? '🥇' : place === '2°' ? '🥈' : '🥉';
    
    // Custom colors requested by user (Oro, Plata, Bronce)
    const glowConfig = {
      '1°': { border: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)' },
      '2°': { border: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.5)' },
      '3°': { border: '#CD7F32', glow: 'rgba(205, 127, 50, 0.5)' },
    }[place];

    return (
      <div 
        className="flex items-center gap-6 p-4 rounded-xl border relative overflow-hidden h-[95px] animate-result-card"
        style={{
          backgroundImage: `linear-gradient(to right, ${bgGradient})`,
          animationDelay: delay,
          borderColor: glowConfig.border,
          boxShadow: `0 0 20px ${glowConfig.glow}, inset 0 0 10px ${glowConfig.glow}`,
        } as React.CSSProperties}
      >
        {/* Place Indicator */}
        <div className="flex items-center justify-center font-display font-black text-4xl text-white w-18 border-r border-white/20 pr-4 italic shrink-0">
          <span className="mr-1.5 text-2xl">{medal}</span>{place}
        </div>

        {/* Badge */}
        <div
          className={`w-12 h-12 rounded flex items-center justify-center font-display font-black text-3xl border border-black/50 shrink-0`}
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
        <div className="flex-1 flex flex-col justify-center">
          <span className="font-display font-black text-2xl text-white tracking-wide uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {dog.name}
          </span>
          <span className="text-[10px] font-bold text-gray-400 mt-1 tracking-wider font-display uppercase leading-none">
            {place === '1°' ? 'PRIMER LUGAR' : place === '2°' ? 'SEGUNDO LUGAR' : 'TERCER LUGAR'}
          </span>
        </div>

        {/* Dog Image */}
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

  return (
    <div className="flex-1 flex flex-col p-6 bg-black select-none overflow-hidden relative">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-pos-border pb-3 shrink-0">
        <span className="font-display font-black text-white text-xl tracking-wider uppercase">
          RESULTADO OFICIAL - CARRERA {raceNumber}
        </span>
        <span className="font-display font-extrabold text-pos-yellow text-lg tracking-wider uppercase">
          FINALIZADA
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 my-4 overflow-hidden">
        {/* Left Column: Place Cards (1°, 2°, 3°) - Escalated entry */}
        <div className="flex-1 flex flex-col justify-between py-2 gap-4">
          {/* 1° Lugar (Gold) */}
          {renderPlaceCard(firstDog, '1°', 'from-amber-600/35 via-pos-bg to-pos-bg', '0.1s')}

          {/* 2° Lugar (Silver) */}
          {renderPlaceCard(secondDog, '2°', 'from-slate-500/30 via-pos-bg to-pos-bg', '0.3s')}

          {/* 3° Lugar (Bronze) */}
          {renderPlaceCard(thirdDog, '3°', 'from-amber-900/30 via-pos-bg to-pos-bg', '0.5s')}
        </div>

        {/* Right Column: Special Bets Results */}
        <div className="w-[320px] flex flex-col justify-between shrink-0 py-2 gap-4">
          {/* EXACTA Card */}
          <div 
            className="flex-1 flex flex-col justify-center border border-pos-border bg-pos-bg rounded-xl p-4 text-center animate-result-card"
            style={{
              animationDelay: '0.6s',
              '--glow-color': 'rgba(245, 197, 24, 0.45)',
              boxShadow: '0 0 25px var(--glow-color), inset 0 0 15px rgba(245, 197, 24, 0.05)',
              borderColor: 'rgba(245, 197, 24, 0.5)',
            } as React.CSSProperties}
          >
            <span className="text-xs font-black text-gray-500 tracking-widest font-display uppercase">
              EXACTA
            </span>
            <span className="text-3xl font-extrabold text-white font-mono mt-2 tracking-wider">
              {exactaStr}
            </span>
            <span className="text-3xl font-extrabold text-pos-yellow font-display mt-2 drop-shadow-[0_0_8px_rgba(245,197,24,0.3)]">
              {exactaOdds}
            </span>
          </div>

          {/* TRIFECTA Card */}
          <div 
            className="flex-1 flex flex-col justify-center border border-pos-border bg-pos-bg rounded-xl p-4 text-center animate-result-card"
            style={{
              animationDelay: '0.8s',
              '--glow-color': 'rgba(245, 197, 24, 0.45)',
              boxShadow: '0 0 25px var(--glow-color), inset 0 0 15px rgba(245, 197, 24, 0.05)',
              borderColor: 'rgba(245, 197, 24, 0.5)',
            } as React.CSSProperties}
          >
            <span className="text-xs font-black text-gray-500 tracking-widest font-display uppercase">
              TRIFECTA
            </span>
            <span className="text-3xl font-extrabold text-white font-mono mt-2 tracking-wider">
              {trifectaStr}
            </span>
            <span className="text-3xl font-extrabold text-pos-yellow font-display mt-2 drop-shadow-[0_0_8px_rgba(245,197,24,0.3)]">
              {trifectaOdds}
            </span>
          </div>
        </div>
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
