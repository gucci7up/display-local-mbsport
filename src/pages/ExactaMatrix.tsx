import React from 'react';
import { DOGS_METADATA } from './Lobby';

interface ExactaMatrixProps {
  liveOdds: any[];
  raceHistory: any[];
}

const COL_W = 80;
const HEAD_H = 82;
const HDR_BG = '#18181c';
const ROW_A = '#111113';
const ROW_B = '#0d0d10';
const DIAG_BG = '#050506';

export const ExactaMatrix: React.FC<ExactaMatrixProps> = ({ liveOdds, raceHistory }) => {
  const getWinOdds = (id: number) => {
    const o = liveOdds.find(x => x.betType === 'WINNER' && x.selection === String(id));
    return o && +o.currentOdds > 1 ? +o.currentOdds : DOGS_METADATA[id - 1].defaultOdds.win;
  };

  const getExactaOdds = (a: number, b: number) => {
    const o = liveOdds.find(x => x.betType === 'EXACTA' && x.selection === `${a}-${b}`);
    if (o && +o.currentOdds > 1) return +o.currentOdds;
    return Math.round(DOGS_METADATA[a - 1].defaultOdds.win * DOGS_METADATA[b - 1].defaultOdds.win * 1.8 * 100) / 100;
  };

  const cellVal = (r: number, c: number) => r === c ? getWinOdds(r) : getExactaOdds(r, c);

  const rowMin = (r: number) => {
    let m = Infinity;
    for (let c = 1; c <= 6; c++) if (c !== r) { const v = getExactaOdds(r, c); if (v < m) m = v; }
    return m;
  };

  const fmt = (v: number) => Number.isInteger(v) ? String(v) : v.toFixed(2);

  const dogGrad = (id: number) => {
    const d = DOGS_METADATA[id - 1];
    return d.isStripes
      ? 'repeating-linear-gradient(90deg,#333 0,#333 6px,#fff 6px,#fff 12px)'
      : d.color;
  };

  const fmtTime = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const fmtDate = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
  };

  const outside: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.4em',
    textTransform: 'uppercase',
    color: '#f5c518',
    fontFamily: "'Barlow Condensed', sans-serif",
    opacity: 0.85,
  };

  return (
    <div
      className="flex-1 flex select-none overflow-hidden z-10 relative"
      style={{ padding: '16px 16px 16px 16px', gap: 14 }}
    >
      {/* ── Panel izquierdo: Últimos Resultados ── */}
      <div
        className="glass-panel"
        style={{
          width: 320,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 10,
          overflow: 'hidden',
          padding: '16px 14px',
        }}
      >
        {/* Título */}
        <div style={{ marginBottom: 10 }}>
          <span
            className="text-gradient-gold font-display font-black uppercase tracking-widest"
            style={{ fontSize: 18, letterSpacing: '0.15em' }}
          >
            Últimos Resultados
          </span>
          <div className="gold-divider" style={{ marginTop: 8 }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {raceHistory.length === 0 ? (
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, textAlign: 'center', marginTop: 20 }}>
              Sin historial aún
            </span>
          ) : (
            raceHistory.map((race: any, ridx: number) => {
              const parts: string[] = race.resultado ? race.resultado.split('-') : [];
              const isEven = ridx % 2 === 0;
              return (
                <div
                  key={race.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 8px',
                    borderRadius: 8,
                    background: isEven ? 'rgba(255,255,255,0.03)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Número de carrera */}
                  <div style={{ flexShrink: 0, minWidth: 54 }}>
                    <div style={{ color: '#6b7280', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>
                      Carrera
                    </div>
                    <div style={{ color: '#D4AF37', fontFamily: 'monospace', fontWeight: 900, fontSize: 22, lineHeight: 1.1 }}>
                      #{race.numero}
                    </div>
                  </div>

                  {/* Badges de perros */}
                  <div style={{ display: 'flex', gap: 5, flex: 1, justifyContent: 'center' }}>
                    {parts.map((num, idx) => {
                      const n = Number(num);
                      const dog = DOGS_METADATA[n - 1];
                      if (!dog) return null;
                      const medals = ['🥇', '🥈', '🥉'];
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <span style={{ fontSize: 10, lineHeight: 1 }}>{medals[idx] ?? ''}</span>
                          <span
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: 20,
                              background: dog.isStripes
                                ? 'repeating-linear-gradient(90deg,#111 0,#111 5px,#fff 5px,#fff 10px)'
                                : dog.color,
                              color: dog.textColor,
                              boxShadow: `0 2px 8px ${dog.isStripes ? 'rgba(255,255,255,0.15)' : dog.color + '55'}`,
                              border: '1.5px solid rgba(0,0,0,0.25)',
                            }}
                          >
                            {num}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Hora */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ color: '#6b7280', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>
                      {fmtDate(race.finishedAt)}
                    </div>
                    <div style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>
                      {fmtTime(race.finishedAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Sección derecha: SEGUNDO + PRIMERO + Tabla ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* SEGUNDO — encima de la tabla */}
        <div
          style={{
            display: 'flex',
            paddingLeft: 22,
            marginBottom: 6,
            flexShrink: 0,
          }}
        >
          <div style={{ width: COL_W, flexShrink: 0 }} />
          <span style={{ ...outside, flex: 1, textAlign: 'center' }}>SEGUNDO</span>
        </div>

        {/* PRIMERO + Tabla */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, alignItems: 'stretch' }}>

          {/* PRIMERO — a la izquierda de la tabla */}
          <div
            style={{
              width: 22,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: HEAD_H,
            }}
          >
            <span style={{ ...outside, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              PRIMERO
            </span>
          </div>

          {/* Tabla EXACTA */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 6,
              boxShadow: '0 16px 64px rgba(0,0,0,0.8)',
            }}
          >
            {/* Encabezado de columnas */}
            <div
              style={{
                display: 'flex',
                height: HEAD_H,
                background: HDR_BG,
                flexShrink: 0,
                borderBottom: '2px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                style={{
                  width: COL_W,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  padding: '0 10px 10px 12px',
                  borderRight: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.13em', color: '#f5c518', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif", opacity: 0.9 }}>
                  EXACTA
                </span>
              </div>

              {[1, 2, 3, 4, 5, 6].map(col => (
                <div
                  key={col}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    borderLeft: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                    {col}
                  </span>
                  <div style={{ width: '50%', height: 7, borderRadius: 4, background: dogGrad(col) }} />
                </div>
              ))}
            </div>

            {/* Filas de datos */}
            {[1, 2, 3, 4, 5, 6].map(row => {
              const min = rowMin(row);
              return (
                <div
                  key={row}
                  style={{
                    display: 'flex',
                    flex: 1,
                    background: row % 2 === 1 ? ROW_A : ROW_B,
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div
                    style={{
                      width: COL_W,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      background: HDR_BG,
                      borderRight: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div style={{ width: 9, alignSelf: 'stretch', background: dogGrad(row), flexShrink: 0 }} />
                    <span style={{ flex: 1, textAlign: 'center', fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                      {row}
                    </span>
                  </div>

                  {[1, 2, 3, 4, 5, 6].map(col => {
                    const v = cellVal(row, col);
                    const diag = row === col;
                    const isMin = !diag && v === min;
                    return (
                      <div
                        key={col}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderLeft: '1px solid rgba(255,255,255,0.04)',
                          background: diag ? DIAG_BG : undefined,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 26,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            letterSpacing: '0.04em',
                            color: diag ? '#f87171' : isMin ? '#4ade80' : '#ffffff',
                          }}
                        >
                          {fmt(v)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
