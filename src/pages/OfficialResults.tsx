import React, { useEffect, useState } from 'react';
import { DOGS_METADATA } from './Lobby';

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
  const [countdown, setCountdown] = useState(15);
  useEffect(() => {
    const t = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Resolver posiciones
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
    const base = parts.reduce((acc, id) => acc * (DOGS_METADATA[id - 1]?.defaultOdds.win ?? 2), 1);
    return (Math.round(base * (parts.length === 2 ? 1.8 : 3.5) * 100) / 100).toFixed(2);
  };

  const winOdds      = getOdds('WINNER',   String(firstId));
  const exactaOdds   = getOdds('EXACTA',   `${firstId}-${secondId}`);
  const trifectaOdds = getOdds('TRIFECTA', `${firstId}-${secondId}-${thirdId}`);

  const firstDog  = DOGS_METADATA[firstId  - 1] || DOGS_METADATA[0];
  const secondDog = DOGS_METADATA[secondId - 1] || DOGS_METADATA[2];
  const thirdDog  = DOGS_METADATA[thirdId  - 1] || DOGS_METADATA[4];

  const rows = [
    { dog: firstDog,  label: '1°', sublabel: 'PRIMER LUGAR',  medalBg: 'linear-gradient(135deg,#FFE9A8,#F5C518,#9a6e00)', medalBorder: '#F5C518', glow: 'rgba(245,197,24,0.7)',  rowAccent: firstDog.color  },
    { dog: secondDog, label: '2°', sublabel: 'SEGUNDO LUGAR', medalBg: 'linear-gradient(135deg,#F2F2F2,#C0C0C0,#6e6e6e)', medalBorder: '#C0C0C0', glow: 'rgba(192,192,192,0.5)', rowAccent: secondDog.color },
    { dog: thirdDog,  label: '3°', sublabel: 'TERCER LUGAR',  medalBg: 'linear-gradient(135deg,#E3A468,#CD7F32,#7a4a18)', medalBorder: '#CD7F32', glow: 'rgba(205,127,50,0.5)',  rowAccent: thirdDog.color  },
  ];

  if (!resultsData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6 p-10 rounded-3xl glass-panel">
          <div className="w-16 h-16 border-4 border-pos-yellow border-t-transparent rounded-full animate-spin" />
          <span className="font-display font-black text-gradient-gold text-3xl tracking-widest uppercase">
            Calculando Resultados...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black select-none overflow-hidden" style={{ padding: '10px 20px 0' }}>

      {/* Título */}
      <div className="flex items-center justify-between shrink-0" style={{ marginBottom: 8 }}>
        <span className="font-display font-black text-white uppercase" style={{ fontSize: 26, letterSpacing: '0.05em' }}>
          RESULTADO OFICIAL&nbsp;<span style={{ color: '#F5C518' }}>•</span>&nbsp;CARRERA {raceNumber}
        </span>
        <span className="flex items-center gap-2 font-display font-black uppercase" style={{ fontSize: 18, color: '#22c55e', letterSpacing: '0.1em' }}>
          FINALIZADA
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" fill="#22c55e" opacity="0.2" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 11l3.5 3.5 6.5-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      <div className="gold-divider shrink-0" style={{ marginBottom: 8 }} />

      {/* 3 filas + panel derecho */}
      <div className="flex gap-4 overflow-hidden" style={{ flex: 1, minHeight: 0 }}>

        {/* Filas de resultado */}
        <div className="flex flex-col gap-3" style={{ flex: 1 }}>
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl"
              style={{
                flex: 1,
                border: `1.5px solid ${row.medalBorder}44`,
                boxShadow: `0 0 30px ${row.glow}50`,
                background: `linear-gradient(to right, ${row.rowAccent && !row.dog.isStripes ? row.rowAccent + '18' : 'rgba(255,255,255,0.04)'} 0%, rgba(0,0,0,0.6) 55%)`,
              }}
            >
              {/* Contenido izquierdo */}
              <div className="flex items-center h-full" style={{ padding: '0 20px', gap: 20, position: 'relative', zIndex: 2 }}>

                {/* Medallón grande */}
                <div
                  className="shrink-0 flex items-center justify-center font-display font-black rounded-full"
                  style={{
                    width: 90, height: 90,
                    background: row.medalBg,
                    color: idx === 1 ? '#1a1a1a' : '#1a1100',
                    fontSize: 32,
                    boxShadow: `0 0 28px ${row.glow}`,
                    border: `3px solid ${row.medalBorder}`,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {row.label}
                </div>

                {/* Número del perro */}
                <div
                  className="shrink-0 flex items-center justify-center font-display font-black rounded-xl"
                  style={{
                    width: 72, height: 72,
                    background: row.dog.isStripes
                      ? 'repeating-linear-gradient(45deg,#111 0,#111 7px,#fff 7px,#fff 14px)'
                      : row.dog.color,
                    color: row.dog.textColor,
                    fontSize: 38,
                    border: '2px solid rgba(0,0,0,0.4)',
                    boxShadow: row.dog.isStripes ? 'none' : `0 0 20px ${row.dog.color}88`,
                  }}
                >
                  {row.dog.id}
                </div>

                {/* Nombre */}
                <div className="flex flex-col">
                  <span className="font-display font-black text-white uppercase" style={{ fontSize: 44, lineHeight: 1, letterSpacing: '-0.01em' }}>
                    {row.dog.name}
                  </span>
                  <span className="font-display font-bold text-gray-400 uppercase tracking-widest" style={{ fontSize: 14, marginTop: 4 }}>
                    {row.sublabel}
                  </span>
                </div>
              </div>

              {/* Imagen del perro — GRANDE, lado derecho */}
              <div
                className="absolute top-0 right-0 bottom-0 overflow-hidden pointer-events-none"
                style={{ width: '42%', zIndex: 1 }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: row.dog.isStripes
                      ? 'linear-gradient(to left, rgba(200,200,200,0.12) 0%, transparent 70%)'
                      : `linear-gradient(to left, ${row.dog.color}55 0%, ${row.dog.color}22 40%, transparent 80%)`,
                  }}
                />
                <img
                  src={row.dog.image}
                  alt={row.dog.name}
                  className="absolute drop-shadow-2xl"
                  style={{
                    height: '120%',
                    width: 'auto',
                    bottom: '-10%',
                    right: '0',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Panel derecho: cuotas */}
        <div className="flex flex-col gap-3 shrink-0" style={{ width: 220 }}>
          {[
            { label: 'GANADOR',  combo: String(firstId),                         odds: winOdds      },
            { label: 'EXACTA',   combo: `${firstId} – ${secondId}`,              odds: exactaOdds   },
            { label: 'TRIFECTA', combo: `${firstId} – ${secondId} – ${thirdId}`, odds: trifectaOdds },
          ].map((item, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col justify-center items-center text-center glass-panel rounded-2xl"
              style={{
                borderColor: 'rgba(245,197,24,0.4)',
                boxShadow: '0 0 20px rgba(245,197,24,0.15)',
                padding: '10px 8px',
              }}
            >
              <span className="font-display font-black tracking-widest uppercase text-gray-400" style={{ fontSize: 12, letterSpacing: '0.15em' }}>
                {item.label}
              </span>
              <div className="gold-divider my-2" style={{ width: '80%' }} />
              <span className="font-display font-black text-white font-mono" style={{ fontSize: item.label === 'TRIFECTA' ? 22 : 32, letterSpacing: '0.05em' }}>
                {item.combo}
              </span>
              <span className="font-display font-black" style={{ fontSize: 26, marginTop: 4, color: '#F5C518' }}>
                x{item.odds}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Barra inferior */}
      <div
        className="shrink-0 flex items-center gap-4 rounded-2xl"
        style={{
          margin: '8px 0 6px',
          padding: '10px 20px',
          background: 'linear-gradient(to right, rgba(245,197,24,0.1), rgba(0,0,0,0.4), rgba(245,197,24,0.1))',
          border: '1px solid rgba(245,197,24,0.25)',
        }}
      >
        <div className="flex items-center gap-3 shrink-0">
          <span style={{ fontSize: 24 }}>📢</span>
          <div>
            <div className="font-display font-black text-white uppercase tracking-wider" style={{ fontSize: 14 }}>
              Sigue la Acción en Vivo
            </div>
            <div className="font-display font-bold text-gray-500 uppercase tracking-widest" style={{ fontSize: 10 }}>
              Apuestas · Emoción · Diversión
            </div>
          </div>
        </div>
        <div className="flex-1 text-center">
          <span className="font-display font-black text-white uppercase tracking-widest" style={{ fontSize: 18 }}>
            La <span style={{ color: '#F5C518' }}>Emoción</span> Corre Por Nuestras <span style={{ color: '#F5C518' }}>Venas</span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-display font-bold text-gray-400 uppercase tracking-widest" style={{ fontSize: 12 }}>
            Próxima Carrera
          </span>
          <span className="font-mono font-black" style={{ fontSize: 22, color: '#F5C518' }}>
            ⏱ {String(Math.floor(countdown / 60)).padStart(2,'0')}:{String(countdown % 60).padStart(2,'0')}
          </span>
        </div>
      </div>
    </div>
  );
};
