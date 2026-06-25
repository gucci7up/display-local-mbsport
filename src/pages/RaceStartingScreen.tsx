import React from 'react';

interface RaceStartingScreenProps {
  raceNumber: number | string;
}

export const RaceStartingScreen: React.FC<RaceStartingScreenProps> = ({ raceNumber }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-black">
      {/* Imagen full screen */}
      <img
        src="/race-starting.jpg"
        alt="Ya va a comenzar la carrera"
        className="w-full h-full object-cover"
      />

      {/* Badge número de carrera - esquina superior izquierda */}
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-[#D4AF37] rounded-xl px-5 py-3 shadow-2xl">
        <span className="text-black font-black text-lg tracking-widest uppercase leading-none">
          CARRERA
        </span>
        <span className="text-black font-black text-4xl leading-none tracking-tight">
          #{raceNumber}
        </span>
      </div>
    </div>
  );
};
