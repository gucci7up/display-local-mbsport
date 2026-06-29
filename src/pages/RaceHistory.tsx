import React, { useState, useEffect } from 'react';
import { DOGS_METADATA } from './Lobby';

interface RaceHistoryProps {
  raceHistory: any[];
}

const DOG_COLORS: Record<number, { bg: string; text: string; isStripes: boolean }> = {
  1: { bg: '#dc2626', text: '#fff', isStripes: false },
  2: { bg: '#2563eb', text: '#fff', isStripes: false },
  3: { bg: '#e5e7eb', text: '#111', isStripes: false },
  4: { bg: '#18181b', text: '#fff', isStripes: false },
  5: { bg: '#ea580c', text: '#fff', isStripes: false },
  6: { bg: '#18181b', text: '#fff', isStripes: true },
};

const DogBadge: React.FC<{ num: number }> = ({ num }) => {
  const dog = DOGS_METADATA[num - 1];
  const color = DOG_COLORS[num];
  if (!dog || !color) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 22, color: color.text, flexShrink: 0,
        background: color.isStripes
          ? 'repeating-linear-gradient(90deg,#111 0,#111 6px,#fff 6px,#fff 12px)'
          : color.bg,
        border: '2px solid rgba(255,255,255,0.2)',
      }}>
        {num}
      </div>
      <span style={{ fontWeight: 700, fontSize: '1.6vw', color: '#fff', letterSpacing: '0.05em' }}>
        {dog.name}
      </span>
    </div>
  );
};

export const RaceHistory: React.FC<RaceHistoryProps> = ({ raceHistory }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmtHora = (d: Date) => d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const fmtFecha = (d: Date) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  const fmtTime = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    return d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const rows = raceHistory.slice(0, 8);

  // Posiciones de filas en la imagen (1920x1080)
  const ROW_START_Y = 27;
  const ROW_H = 8.7;
  // Offset Y individual por fila (positivo = baja, negativo = sube)
  const ROW_OFFSET = [1.5, 1.2, 0.8, 0.5, 0, 0, 0, -0.5];

  // Posiciones X de cada columna
  const COL_CARRERA_X  = '6%';
  const COL_GANADOR_X  = '22%';
  const COL_SEGUNDO_X  = '52%';
  const COL_TERCERO_X  = '78%';

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      <img src="/Pantalla ultimos resultados.png" alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      {/* Fecha */}
      <div className="absolute" style={{ top: '10.5%', left: '7.5%' }}>
        <span style={{ fontWeight: 700, fontSize: '1.8vw', color: '#f5c518', letterSpacing: '0.12em', fontFamily: "'Segoe UI', Arial, sans-serif", textTransform: 'uppercase' }}>
          {fmtFecha(now)}
        </span>
      </div>

      {/* Hora actual */}
      <div className="absolute" style={{ top: '10.5%', right: '3%', left: '78%', textAlign: 'right' }}>
        <span style={{ fontWeight: 700, fontSize: '1.8vw', color: '#f5c518', letterSpacing: '0.12em', fontFamily: "'Arial Narrow', Arial, sans-serif" }}>
          {fmtHora(now)}
        </span>
      </div>

      {/* Filas de historial */}
      {rows.map((race, idx) => {
        const parts = race.resultado ? race.resultado.split('-').map(Number) : [];
        const top = `${ROW_START_Y + idx * ROW_H + (ROW_OFFSET[idx] || 0)}%`;

        return (
          <div key={race.id} className="absolute w-full" style={{ top, height: `${ROW_H}%` }}>

            {/* Carrera + hora */}
            <div className="absolute h-full flex flex-col justify-center" style={{ left: COL_CARRERA_X }}>
              <span style={{ fontWeight: 900, fontSize: '2vw', color: '#f5c518' }}>#{race.numero}</span>
              <span style={{ fontSize: '1.2vw', color: '#9ca3af' }}>{fmtTime(race.finishedAt)}</span>
            </div>

            {/* Ganador */}
            <div className="absolute h-full flex items-center" style={{ left: COL_GANADOR_X }}>
              {parts[0] ? <DogBadge num={parts[0]} /> : null}
            </div>

            {/* Segundo */}
            <div className="absolute h-full flex items-center" style={{ left: COL_SEGUNDO_X }}>
              {parts[1] ? <DogBadge num={parts[1]} /> : null}
            </div>

            {/* Tercero */}
            <div className="absolute h-full flex items-center" style={{ left: COL_TERCERO_X }}>
              {parts[2] ? <DogBadge num={parts[2]} /> : null}
            </div>

          </div>
        );
      })}
    </div>
  );
};
