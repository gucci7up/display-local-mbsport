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
  // Countdown próxima carrera
  const [countdown, setCountdown] = useState(60);
  useEffect(() => {
    const t = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const fmtCd = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

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

  // Cuotas
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

  const medals = [
    { label: '1°', bg: 'linear-gradient(135deg,#FFE9A8 0%,#F5C518 50%,#9a6e00 100%)', tc: '#1a1200', glow: 'rgba(245,197,24,0.6)',  border: '#F5C518' },
    { label: '2°', bg: 'linear-gradient(135deg,#F2F2F2 0%,#C0C0C0 50%,#6e6e6e 100%)', tc: '#111',   glow: 'rgba(192,192,192,0.5)', border: '#C0C0C0' },
    { label: '3°', bg: 'linear-gradient(135deg,#E3A468 0%,#CD7F32 50%,#7a4a18 100%)', tc: '#1a0800', glow: 'rgba(205,127,50,0.5)',  border: '#CD7F32' },
  ];

  const rowBg = [
    'linear-gradient(to right, rgba(245,197,24,0.12) 0%, rgba(0,0,0,0) 60%)',
    'linear-gradient(to right, rgba(192,192,192,0.08) 0%, rgba(0,0,0,0) 60%)',
    'linear-gradient(to right, rgba(205,127,50,0.10) 0%, rgba(0,0,0,0) 60%)',
  ];

  const placeLabel = ['PRIMER LUGAR', 'SEGUNDO LUGAR', 'TERCER LUGAR'];
  const dogs = [firstDog, secondDog, thirdDog];

  if (!resultsData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6 p-10 rounded-3xl glass-panel">
          <div className="w-14 h-14 border-4 border-pos-yellow border-t-transparent rounded-full animate-spin" />
          <span className="font-display font-black text-gradient-gold text-2xl tracking-widest uppercase">
            Calculando Resultados...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black select-none overflow-hidden" style={{ padding: '14px 20px 0' }}>

      {/* ── Título ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <span className="font-display font-black text-white uppercase tracking-wider" style={{ fontSize: 22 }}>
          Resultado Oficial&nbsp;
          <span className="text-pos-yellow">•</span>
          &nbsp;Carrera {raceNumber}
        </span>
        <span className="flex items-center gap-2 font-display font-black text-green-400 uppercase tracking-widest" style={{ fontSize: 16 }}>
          Finalizada
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="#22c55e" opacity="0.2" stroke="#22c55e" strokeWidth="1.5"/>
            <path d="M5.5 10l3 3 6-6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      <div className="gold-divider mb-3 shrink-0" />

      {/* ── Contenido principal ───────────────────────────────────────────── */}
      <div className="flex gap-4 overflow-hidden" style={{ flex: 1, minHeight: 0 }}>

        {/* Columna izquierda: 3 filas de resultado */}
        <div className="flex flex-col gap-3" style={{ flex: 1 }}>
          {dogs.map((dog, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-2xl border relative overflow-hidden"
              style={{
                flex: 1,
                background: rowBg[idx],
                borderColor: medals[idx].border + '55',
                boxShadow: `0 0 24px ${medals[idx].glow}, inset 0 0 12px ${medals[idx].glow}40`,
                padding: '0 16px',
              }}
            >
              {/* Medallón */}
              <div
                className="flex items-center justify-center font-display font-black shrink-0 rounded-full shadow-lg"
                style={{
                  width: 64, height: 64,
                  background: medals[idx].bg,
                  color: medals[idx].tc,
                  fontSize: 26,
                  boxShadow: `0 0 16px ${medals[idx].glow}`,
                  border: `2px solid ${medals[idx].border}80`,
                }}
              >
                {medals[idx].label}
              </div>

              {/* Badge número perro */}
              <div
                className="flex items-center justify-center font-display font-black rounded-xl shrink-0"
                style={{
                  width: 52, height: 52,
                  background: dog.isStripes
                    ? 'repeating-linear-gradient(45deg,#111 0,#111 6px,#fff 6px,#fff 12px)'
                    : dog.color,
                  color: dog.textColor,
                  fontSize: 28,
                  border: '2px solid rgba(0,0,0,0.4)',
                  boxShadow: dog.isStripes ? 'none' : `0 0 14px ${dog.color}66`,
                }}
              >
                {dog.id}
              </div>

              {/* Nombre */}
              <div className="flex flex-col justify-center" style={{ flex: 1 }}>
                <span className="font-display font-black text-white uppercase leading-none tracking-wide" style={{ fontSize: 30 }}>
                  {dog.name}
                </span>
                <span className="font-display font-bold text-gray-400 uppercase tracking-widest" style={{ fontSize: 11, marginTop: 4 }}>
                  {placeLabel[idx]}
                </span>
              </div>

              {/* Imagen del perro */}
              <div
                className="absolute right-0 top-0 bottom-0 flex items-center justify-end overflow-hidden pointer-events-none"
                style={{ width: 220 }}
              >
                {/* Gradiente de color del perro */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to left, ${dog.isStripes ? 'rgba(200,200,200,0.15)' : dog.color + '30'} 0%, transparent 60%)`,
                  }}
                />
                <img
                  src={dog.image}
                  alt={dog.name}
                  className="relative z-10 object-contain drop-shadow-xl"
                  style={{ height: '88%', marginRight: 8 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Columna derecha: GANADOR / EXACTA / TRIFECTA */}
        <div className="flex flex-col gap-3 shrink-0" style={{ width: 240 }}>
          {[
            { label: 'QUINIELA', val: String(firstId),                        odds: winOdds      },
            { label: 'PALE',     val: `${firstId} – ${secondId}`,             odds: exactaOdds   },
            { label: 'TRIPLETA', val: `${firstId} – ${secondId} – ${thirdId}`,odds: trifectaOdds },
          ].map((item, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col justify-center items-center rounded-2xl text-center glass-panel"
              style={{
                borderColor: 'rgba(245,197,24,0.35)',
                boxShadow: '0 0 20px rgba(245,197,24,0.2), inset 0 0 10px rgba(245,197,24,0.04)',
                padding: '10px 8px',
                animationDelay: `${0.6 + i * 0.2}s`,
              }}
            >
              <span className="font-display font-black tracking-widest uppercase text-gray-500" style={{ fontSize: 11, letterSpacing: '0.15em' }}>
                {item.label}
              </span>
              <div className="gold-divider my-1.5" style={{ width: '70%' }} />
              <span className="font-display font-black text-white font-mono tracking-wider" style={{ fontSize: item.label === 'TRIPLETA' ? 20 : 28 }}>
                {item.val}
              </span>
              <span className="font-display font-extrabold text-gradient-gold" style={{ fontSize: 22, marginTop: 2 }}>
                x{item.odds}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Barra inferior ────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center gap-4 rounded-2xl"
        style={{
          margin: '10px 0 6px',
          padding: '10px 20px',
          background: 'linear-gradient(to right, rgba(245,197,24,0.08), rgba(0,0,0,0.4), rgba(245,197,24,0.08))',
          border: '1px solid rgba(245,197,24,0.2)',
        }}
      >
        {/* Izquierda */}
        <div className="flex items-center gap-3 shrink-0">
          <span style={{ fontSize: 22 }}>📢</span>
          <div>
            <div className="font-display font-black text-white uppercase tracking-wider" style={{ fontSize: 13 }}>
              Sigue la Acción en Vivo
            </div>
            <div className="font-display font-bold text-gray-500 uppercase tracking-widest" style={{ fontSize: 9 }}>
              Apuestas · Emoción · Diversión
            </div>
          </div>
        </div>

        {/* Centro */}
        <div className="flex-1 text-center">
          <span className="font-display font-black text-white uppercase tracking-widest" style={{ fontSize: 15 }}>
            La <span className="text-gradient-gold">Emoción</span> Corre Por Nuestras <span className="text-gradient-gold">Venas</span>
          </span>
        </div>

        {/* Derecha: Próxima carrera */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-display font-bold text-gray-400 uppercase tracking-widest" style={{ fontSize: 11 }}>
            Próxima Carrera
          </span>
          <span className="font-mono font-black text-pos-yellow" style={{ fontSize: 20 }}>
            ⏱ {fmtCd(countdown)}
          </span>
        </div>
      </div>

    </div>
  );
};
