import { useEffect, useState, useRef } from 'react';

const API = '/api-proxy';

type BetType = 'WINNER' | 'EXACTA' | 'TRIFECTA';
type TicketStatus = 'PENDING' | 'WON' | 'LOST' | 'PAID' | 'CANCELLED';

interface TicketDetail {
  betType: BetType;
  selection: string;
  amount: string;
  odds: string;
  potentialPrize: string;
}

interface PublicTicket {
  id: string;
  ticketNumber: number;
  status: TicketStatus;
  totalAmount: string;
  prizeAmount: string | null;
  createdAt: string;
  details: TicketDetail[];
  race: {
    numero: number;
    status: string;
    resultado: string | null;
    finishedAt: string | null;
  };
}

const STATUS_INFO: Record<TicketStatus, { icon: string; label: string; hint: string }> = {
  PENDING:   { icon: '⏳', label: 'Pendiente',   hint: 'La carrera aún no ha terminado' },
  WON:       { icon: '🏆', label: '¡Ganador!',   hint: 'Preséntate en ventanilla para cobrar tu premio' },
  LOST:      { icon: '❌', label: 'No Ganó',     hint: 'Mejor suerte en la próxima carrera' },
  PAID:      { icon: '✅', label: 'Cobrado',     hint: 'Este ticket ya fue pagado' },
  CANCELLED: { icon: '🚫', label: 'Anulado',     hint: 'Este ticket fue anulado' },
};

const BET_LABEL: Record<BetType, string> = {
  WINNER: 'GANAR', EXACTA: 'EXACTA', TRIFECTA: 'TRIFECTA',
};

const DOG_NAMES: Record<number, string> = {
  1: 'BRAVO', 2: 'RELAMPAGO', 3: 'TIGRE', 4: 'NEGRO', 5: 'FURIA', 6: 'BANDIDO',
};

function fmtMoney(n: string | number | null | undefined): string {
  if (n === null || n === undefined) return '$0.00';
  return `$${parseFloat(String(n)).toFixed(2)}`;
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' });
}

function fmtSelection(sel: string, betType: BetType): string {
  if (betType === 'WINNER') {
    const n = parseInt(sel);
    return `#${sel} ${DOG_NAMES[n] ?? ''}`.trim();
  }
  return sel.split('-').map((p) => `#${p}`).join(' → ');
}

function fmtResultado(r: string): string {
  return r.split('-').join(' – ');
}

export default function TicketPage() {
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idRef = useRef<string | null>(new URLSearchParams(window.location.search).get('id'));

  async function fetchTicket() {
    const id = idRef.current;
    if (!id) return;
    try {
      const res = await fetch(`${API}/tickets/public/${encodeURIComponent(id)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Ticket no encontrado');
      }
      const data: PublicTicket = await res.json();
      setTicket(data);
      setError(null);
      if (data.status !== 'PENDING' && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar el ticket');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!idRef.current) {
      setError('No se especificó el ID del ticket');
      setLoading(false);
      return;
    }
    fetchTicket();
    intervalRef.current = setInterval(fetchTicket, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const si = ticket ? STATUS_INFO[ticket.status] : null;
  const prize = ticket?.prizeAmount ? parseFloat(ticket.prizeAmount) : 0;
  const potentialTotal = ticket
    ? ticket.details.reduce((s, d) => s + parseFloat(d.potentialPrize), 0)
    : 0;

  return (
    <div className="t-page">
      {/* Brand */}
      <div className="t-brand">
        <div className="t-brand-name">RACING DOGS</div>
        <div className="t-brand-sub">mbsport.lat</div>
      </div>

      {/* Loading */}
      {loading && !ticket && (
        <div className="t-spinner-wrap">
          <div className="t-spinner" />
          <p className="t-spinner-text">Buscando ticket...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && !ticket && (
        <div className="t-error">
          <div className="t-error-title">Ticket no encontrado</div>
          <div className="t-error-msg">{error}</div>
        </div>
      )}

      {/* Ticket content */}
      {ticket && si && (
        <>
          {/* Status */}
          <div className={`t-status ${ticket.status}`}>
            <span className="t-status-icon">{si.icon}</span>
            <div className={`t-status-label ${ticket.status}`}>{si.label}</div>
            <div className="t-status-hint">{si.hint}</div>
          </div>

          {/* Pending auto-refresh indicator */}
          {ticket.status === 'PENDING' && (
            <div className="t-refresh">
              <span>🔄</span> Actualizando automáticamente...
            </div>
          )}

          {/* Prize card */}
          {(ticket.status === 'WON' || ticket.status === 'PAID') && prize > 0 && (
            <div className="t-prize">
              <div className="t-prize-label">Premio ganado</div>
              <div className="t-prize-amount">{fmtMoney(ticket.prizeAmount)}</div>
            </div>
          )}

          {/* Ticket info */}
          <div className="t-card">
            <div className="t-card-title">Información</div>
            <div className="t-row">
              <span className="t-row-label">N° Ticket</span>
              <span className="t-row-value gold">#{ticket.ticketNumber}</span>
            </div>
            <div className="t-row">
              <span className="t-row-label">Carrera</span>
              <span className="t-row-value">N° {ticket.race.numero}</span>
            </div>
            <div className="t-row">
              <span className="t-row-label">Fecha</span>
              <span className="t-row-value">{fmtDate(ticket.createdAt)}</span>
            </div>
            {ticket.race.resultado && (
              <div className="t-row">
                <span className="t-row-label">Resultado</span>
                <span className="t-row-value gold">{fmtResultado(ticket.race.resultado)}</span>
              </div>
            )}
          </div>

          {/* Bets */}
          <div className="t-card">
            <div className="t-card-title">Jugadas ({ticket.details.length})</div>
            {ticket.details.map((d, i) => (
              <div key={i} className="t-bet">
                <span className={`t-bet-type ${d.betType}`}>{BET_LABEL[d.betType]}</span>
                <span className="t-bet-sel">{fmtSelection(d.selection, d.betType)}</span>
                <span className="t-bet-amount">{fmtMoney(d.amount)}</span>
                <span className="t-bet-odds">×{parseFloat(d.odds).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="t-card">
            <div className="t-card-title">Resumen</div>
            <div className="t-row">
              <span className="t-row-label">Total invertido</span>
              <span className="t-row-value">{fmtMoney(ticket.totalAmount)}</span>
            </div>
            <div className="t-row">
              <span className="t-row-label">Premio potencial</span>
              <span className="t-row-value gold">{fmtMoney(String(potentialTotal.toFixed(2)))}</span>
            </div>
            {prize > 0 && (
              <div className="t-row">
                <span className="t-row-label">Premio ganado</span>
                <span className={`t-row-value ${prize >= parseFloat(ticket.totalAmount) ? 'green' : 'red'}`}>
                  {fmtMoney(ticket.prizeAmount)}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="t-footer">MBSPORT RACING DOGS 2026 · mbsport.lat</div>
    </div>
  );
}
