import React, { useEffect, useState } from 'react';
import { DOGS_METADATA } from '../pages/Lobby';

interface ResultsModalProps {
  raceNumber: number | string;
  resultsData: any;
  liveOdds?: any[];
  onClose: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  raceNumber,
  resultsData,
  liveOdds = [],
  onClose,
}) => {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Timer de 15 segundos — propio del modal, no depende de ningún estado externo
    const timer = setTimeout(onClose, 15000);
    const tick  = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
    return () => { clearTimeout(timer); clearInterval(tick); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolver posiciones del resultado
  let firstId = 1, secondId = 3, thirdId = 5;
  if (resultsData) {
    if (resultsData.winners?.trifecta) {
      const p = resultsData.winners.trifecta.split('-').map(Number);
      firstId = p[0] || 1; secondId = p[1] || 3; thirdId = p[2] || 5;
    } else if (resultsData.winners?.exacta) {
      const p = resultsData.winners.exacta.split('-').map(Number);
      firstId = p[0] || 1; secondId = p[1] || 3;
    } else if (resultsData.winners?.winner) {
      firstId = Number(resultsData.winners.winner);
    } else if (resultsData.resultado) {
      const p = resultsData.resultado.split('-').map(Number);
      firstId = p[0] || 1; secondId = p[1] || 3; thirdId = p[2] || 5;
    }
  }

  const getOdds = (betType: string, sel: string): string => {
    const o = liveOdds.find(x => x.betType === betType && x.selection === sel);
    if (o && +o.currentOdds > 1) return (+o.currentOdds).toFixed(2);
    if (betType === 'WINNER') return (DOGS_METADATA[Number(sel) - 1]?.defaultOdds.win ?? 2).toFixed(2);
    const parts = sel.split('-').map(Number);
    const base  = parts.reduce((acc, id) => acc * (DOGS_METADATA[id - 1]?.defaultOdds.win ?? 2), 1);
    return (Math.round(base * (parts.length === 2 ? 1.8 : 3.5) * 100) / 100).toFixed(2);
  };

  const winOdds      = getOdds('WINNER',   String(firstId));
  const exactaOdds   = getOdds('EXACTA',   `${firstId}-${secondId}`);
  const trifectaOdds = getOdds('TRIFECTA', `${firstId}-${secondId}-${thirdId}`);

  const firstDog  = DOGS_METADATA[firstId  - 1] || DOGS_METADATA[0];
  const secondDog = DOGS_METADATA[secondId - 1] || DOGS_METADATA[2];
  const thirdDog  = DOGS_METADATA[thirdId  - 1] || DOGS_METADATA[4];

  const rows = [
    { dog: firstDog,  label: '1°', sublabel: 'PRIMER LUGAR',
      medalBg: 'linear-gradient(135deg,#FFE9A8,#F5C518,#9a6e00)', medalColor: '#1a1200', medalBorder: '#F5C518',
      rowLeft: '#F5C518' },
    { dog: secondDog, label: '2°', sublabel: 'SEGUNDO LUGAR',
      medalBg: 'linear-gradient(135deg,#F2F2F2,#C0C0C0,#6e6e6e)', medalColor: '#111',   medalBorder: '#C0C0C0',
      rowLeft: '#888888' },
    { dog: thirdDog,  label: '3°', sublabel: 'TERCER LUGAR',
      medalBg: 'linear-gradient(135deg,#E3A468,#CD7F32,#7a4a18)', medalColor: '#1a0800', medalBorder: '#CD7F32',
      rowLeft: thirdDog.isStripes ? '#aaaaaa' : thirdDog.color },
  ];

  return (
    /* Overlay oscuro full screen */
    <div
      className="fixed inset-0 flex items-center justify-center select-none"
      style={{ zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      {/* Modal */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: '78vw', maxWidth: 1100,
          background: 'linear-gradient(180deg,#111 0%,#0a0a0a 100%)',
          borderRadius: 24,
          border: '1.5px solid rgba(212,175,55,0.4)',
          boxShadow: '0 0 80px rgba(212,175,55,0.2), 0 30px 80px rgba(0,0,0,0.8)',
          padding: '28px 28px 20px',
        }}
      >
        {/* Botón cerrar + countdown */}
        <button
          onClick={onClose}
          className="absolute font-display font-black flex items-center justify-center rounded-full cursor-pointer"
          style={{
            top: 16, right: 16,
            width: 42, height: 42,
            background: 'rgba(255,255,255,0.1)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: 18,
          }}
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="MBSport" style={{ height: 56, objectFit: 'contain' }} />
        </div>

        {/* Título */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-display font-black text-white uppercase" style={{ fontSize: 32, lineHeight: 1 }}>
              RESULTADO OFICIAL
            </div>
            <div className="font-display font-bold" style={{ fontSize: 20, color: '#F5C518', marginTop: 4 }}>
              CARRERA {raceNumber}
            </div>
          </div>
          <div
            className="flex items-center gap-2 font-display font-black uppercase rounded-full"
            style={{ background: '#22c55e22', border: '1.5px solid #22c55e', color: '#22c55e', fontSize: 14, padding: '6px 16px', letterSpacing: '0.1em' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" fill="#22c55e" opacity="0.25" stroke="#22c55e" strokeWidth="1.5"/>
              <path d="M4.5 9l3 3 6-6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            FINALIZADA
          </div>
        </div>

        {/* Filas de resultado + panel cuotas */}
        <div className="flex gap-4">

          {/* Columna de filas */}
          <div className="flex flex-col gap-3" style={{ flex: 1 }}>
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl flex items-center"
                style={{
                  height: 110,
                  paddingLeft: 16,
                  gap: 16,
                  background: `linear-gradient(to right, ${row.rowLeft}22 0%, rgba(0,0,0,0.5) 55%)`,
                  border: `1.5px solid ${row.medalBorder}44`,
                  boxShadow: `0 0 20px ${row.medalBorder}30`,
                }}
              >
                {/* Medallón */}
                <div
                  className="shrink-0 flex items-center justify-center font-display font-black rounded-full"
                  style={{
                    width: 76, height: 76,
                    background: row.medalBg,
                    color: row.medalColor,
                    fontSize: 28,
                    border: `2.5px solid ${row.medalBorder}`,
                    boxShadow: `0 0 20px ${row.medalBorder}88`,
                    zIndex: 2,
                  }}
                >
                  {row.label}
                </div>

                {/* Número */}
                <div
                  className="shrink-0 flex items-center justify-center font-display font-black rounded-xl"
                  style={{
                    width: 62, height: 62,
                    background: row.dog.isStripes
                      ? 'repeating-linear-gradient(45deg,#111 0,#111 7px,#fff 7px,#fff 14px)'
                      : row.dog.color,
                    color: row.dog.textColor,
                    fontSize: 32,
                    border: '2px solid rgba(0,0,0,0.4)',
                    boxShadow: row.dog.isStripes ? 'none' : `0 0 16px ${row.dog.color}77`,
                    zIndex: 2,
                  }}
                >
                  {row.dog.id}
                </div>

                {/* Nombre */}
                <div className="flex flex-col" style={{ zIndex: 2 }}>
                  <span className="font-display font-black text-white uppercase" style={{ fontSize: 36, lineHeight: 1 }}>
                    {row.dog.name}
                  </span>
                  <span className="font-display font-bold text-gray-400 uppercase tracking-widest" style={{ fontSize: 11, marginTop: 3 }}>
                    {row.sublabel}
                  </span>
                </div>

                {/* Imagen del perro — grande en el lado derecho */}
                <div
                  className="absolute top-0 right-0 bottom-0 overflow-hidden pointer-events-none"
                  style={{ width: '40%', zIndex: 1 }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: row.dog.isStripes
                        ? 'linear-gradient(to left, rgba(200,200,200,0.1), transparent 70%)'
                        : `linear-gradient(to left, ${row.dog.color}55 0%, ${row.dog.color}20 40%, transparent 80%)`,
                    }}
                  />
                  <img
                    src={row.dog.image}
                    alt={row.dog.name}
                    className="absolute drop-shadow-2xl"
                    style={{ height: '130%', width: 'auto', bottom: '-15%', right: 0, objectFit: 'contain' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Panel cuotas */}
          <div className="flex flex-col gap-3 shrink-0" style={{ width: 190 }}>
            {[
              { label: 'GANADOR',  combo: String(firstId),                         odds: winOdds      },
              { label: 'EXACTA',   combo: `${firstId} – ${secondId}`,              odds: exactaOdds   },
              { label: 'TRIFECTA', combo: `${firstId} – ${secondId} – ${thirdId}`, odds: trifectaOdds },
            ].map((item, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-center text-center rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(212,175,55,0.35)',
                  boxShadow: '0 0 16px rgba(212,175,55,0.12)',
                  padding: '10px 8px',
                }}
              >
                <span className="font-display font-black tracking-widest uppercase text-gray-400" style={{ fontSize: 11 }}>
                  {item.label}
                </span>
                <div style={{ height: 1, background: 'rgba(212,175,55,0.4)', width: '70%', margin: '6px auto' }} />
                <span className="font-display font-black text-white font-mono" style={{ fontSize: item.label === 'TRIFECTA' ? 20 : 30 }}>
                  {item.combo}
                </span>
                <span className="font-display font-black" style={{ fontSize: 24, color: '#F5C518', marginTop: 2 }}>
                  x{item.odds}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Barra inferior: felicitaciones */}
        <div
          className="flex items-center justify-center gap-3 rounded-2xl"
          style={{
            marginTop: 16,
            padding: '14px 20px',
            background: 'linear-gradient(to right, rgba(212,175,55,0.08), rgba(212,175,55,0.15), rgba(212,175,55,0.08))',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          <span style={{ fontSize: 28 }}>🏆</span>
          <div>
            <div className="font-display font-black text-white uppercase tracking-wider" style={{ fontSize: 18 }}>
              ¡FELICITACIONES A LOS GANADORES!
            </div>
            <div className="font-display font-bold text-gray-400 uppercase tracking-widest text-center" style={{ fontSize: 11 }}>
              GRACIAS POR SER PARTE DE MBSPORT
            </div>
          </div>
          <span style={{ fontSize: 28 }}>🏆</span>
        </div>

        {/* Contador pequeño */}
        <div className="text-center" style={{ marginTop: 8 }}>
          <span className="font-mono text-gray-600" style={{ fontSize: 11 }}>
            Cerrando en {countdown}s
          </span>
        </div>
      </div>
    </div>
  );
};
