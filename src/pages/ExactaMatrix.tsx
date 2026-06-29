import React, { useRef, useEffect } from 'react';
import { DOGS_METADATA } from './Lobby';

interface ExactaMatrixProps {
  liveOdds: any[];
  raceHistory: any[];
  currentRace: any;
}

export const ExactaMatrix: React.FC<ExactaMatrixProps> = ({ liveOdds, currentRace }) => {
  const prevOddsRef = useRef<Record<string, number>>({});
  const oddsChangeRef = useRef<Record<string, 'up' | 'down' | null>>({});

  const getWinOdds = (id: number): number => {
    const o = liveOdds.find(x => x.betType === 'WINNER' && x.selection === String(id));
    return o && +o.currentOdds > 1 ? +o.currentOdds : DOGS_METADATA[id - 1].defaultOdds.win;
  };

  const getExactaOdds = (a: number, b: number): number => {
    const o = liveOdds.find(x => x.betType === 'EXACTA' && x.selection === `${a}-${b}`);
    if (o && +o.currentOdds > 1) return +o.currentOdds;
    return Math.round(DOGS_METADATA[a - 1].defaultOdds.win * DOGS_METADATA[b - 1].defaultOdds.win * 1.8 * 100) / 100;
  };

  const cellVal = (r: number, c: number): number =>
    r === c ? getWinOdds(r) : getExactaOdds(r, c);

  const fmt = (v: number): string =>
    Number.isInteger(v) ? v.toFixed(2) : v.toFixed(2);

  // Detectar cambios de cuotas
  useEffect(() => {
    const newChanges: Record<string, 'up' | 'down' | null> = {};
    for (let r = 1; r <= 6; r++) {
      for (let c = 1; c <= 6; c++) {
        const key = `${r}-${c}`;
        const curr = cellVal(r, c);
        const prev = prevOddsRef.current[key];
        if (prev !== undefined && prev !== curr) {
          newChanges[key] = curr > prev ? 'up' : 'down';
        } else {
          newChanges[key] = null;
        }
        prevOddsRef.current[key] = curr;
      }
    }
    oddsChangeRef.current = newChanges;
  }, [liveOdds]);

  const getCellColor = (r: number, c: number): string => {
    if (r === c) return '#ef4444'; // diagonal rojo
    const key = `${r}-${c}`;
    const change = oddsChangeRef.current[key];
    if (change === 'up') return '#4ade80';
    if (change === 'down') return '#ef4444';
    return '#ffffff';
  };

  // Countdown
  const [timeLeft, setTimeLeft] = React.useState(0);
  useEffect(() => {
    const endAt = currentRace?.saleEndAt || currentRace?.closeAt;
    if (!endAt) return;
    const tick = () => {
      const openAt = currentRace?.openAt || currentRace?.saleStartAt;
      if (openAt) {
        const elapsed = Math.floor((Date.now() - new Date(openAt).getTime()) / 1000);
        setTimeLeft(Math.max(0, 300 - elapsed));
      } else {
        setTimeLeft(Math.max(0, Math.floor((new Date(endAt).getTime() - Date.now()) / 1000)));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [currentRace?.saleEndAt, currentRace?.closeAt]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  // Posiciones de celdas en la imagen 1920x1080
  // Grilla empieza ~x:170, y:275 — cada celda ~w:215, h:115
  const GRID_X = 175;
  const GRID_Y = 310;
  const CELL_W = 207;
  const CELL_H = 118;
  // Offset X adicional por columna (positivo = derecha, negativo = izquierda)
  const COL_OFFSET_X = [85, 150, 210, 270, 335, 410];
  const ROW_OFFSET_Y = [42, 35, 20, 0, 0, -20]; // fila 1,2,3,4,5,6 // col 1,2,3,4,5,6

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      <img
        src="/Pantalla Matriz.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Número de carrera */}
      <div className="absolute" style={{ top: '9%', left: '11%' }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '3.8vw', color: '#f5c518', textShadow: '0 0 20px rgba(245,197,24,0.7)', lineHeight: 1 }}>
          #{String(currentRace?.numero ?? '0').padStart(3, '0')}
        </span>
      </div>

      {/* Countdown */}
      <div className="absolute" style={{ top: '7%', right: '6%', textAlign: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '4.5vw', color: '#f5c518', textShadow: '0 0 20px rgba(245,197,24,0.8)', lineHeight: 1 }}>
          {mins}:{secs}
        </span>
      </div>

      {/* Cuotas en la grilla */}
      {[1, 2, 3, 4, 5, 6].map(row =>
        [1, 2, 3, 4, 5, 6].map(col => {
          const v = cellVal(row, col);
          const color = getCellColor(row, col);
          const x = GRID_X + (col - 1) * CELL_W + COL_OFFSET_X[col - 1];
          const y = GRID_Y + (row - 1) * CELL_H + ROW_OFFSET_Y[row - 1];

          return (
            <div
              key={`${row}-${col}`}
              className="absolute flex items-center justify-center"
              style={{
                left: `${(x / 1920) * 100}%`,
                top: `${(y / 1080) * 100}%`,
                width: `${(CELL_W / 1920) * 100}%`,
                height: `${(CELL_H / 1080) * 100}%`,
              }}
            >
              <span style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '2.4vw',
                color,
                textShadow: color !== '#ffffff' ? `0 0 15px ${color}88` : 'none',
                letterSpacing: '0.02em',
              }}>
                {fmt(v)}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
};
