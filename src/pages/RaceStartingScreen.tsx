import React from 'react';

interface RaceStartingScreenProps {
  raceNumber: number | string;
}

export const RaceStartingScreen: React.FC<RaceStartingScreenProps> = ({ raceNumber }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-black">
      <img src="/race-starting.jpg" alt="Ya va a comenzar" className="w-full h-full object-cover" />
      <div className="absolute top-6 left-6 shadow-2xl" style={{
        background: 'linear-gradient(135deg, #f5c518, #e0a800)',
        borderRadius: 12,
        padding: '10px 24px',
        border: '2px solid rgba(255,255,255,0.3)',
        boxShadow: '0 4px 24px rgba(245,197,24,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1,
      }}>
        <span style={{ color: '#000', fontWeight: 900, fontSize: 16, letterSpacing: '0.3em', textTransform: 'uppercase' }}>CARRERA</span>
        <span style={{ color: '#000', fontWeight: 900, fontSize: 52, letterSpacing: '0.05em', lineHeight: 1.1 }}>#{raceNumber}</span>
      </div>
    </div>
  );
};
