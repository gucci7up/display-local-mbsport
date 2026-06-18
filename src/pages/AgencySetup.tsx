import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface Agency {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

interface AgencySetupProps {
  onComplete: () => void;
}

export const AgencySetup: React.FC<AgencySetupProps> = ({ onComplete }) => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    api.getAgencies()
      .then(data => {
        setAgencies(data.filter(a => a.active));
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar las agencias. Reintentando...');
        setLoading(false);
        setTimeout(() => {
          setLoading(true);
          setError(null);
          api.getAgencies()
            .then(data => { setAgencies(data.filter(a => a.active)); setLoading(false); })
            .catch(() => { setError('No se pudo conectar al servidor.'); setLoading(false); });
        }, 4000);
      });
  }, []);

  const handleSelect = (agency: Agency) => {
    setSelecting(agency.id);
    api.setDisplayAgencyId(agency.id);
    setTimeout(() => onComplete(), 400);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-400/5 rounded-full blur-[140px]" />
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      {/* Logo */}
      <div className="flex flex-col items-center mb-10 z-10">
        <img src="/logo.png" alt="MBSport" className="h-16 object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]" />
        <span className="text-[11px] font-bold text-gray-500 tracking-[0.4em] uppercase mt-1">
          Racing Dogs · Configuración de Display
        </span>
      </div>

      {/* Card */}
      <div className="z-10 flex flex-col items-center gap-6 px-10 py-8 rounded-3xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm shadow-[0_0_60px_rgba(0,0,0,0.8)] max-w-lg w-full mx-4">
        <div className="text-center">
          <p className="text-sm font-bold text-gray-400 tracking-[0.2em] uppercase">
            Selecciona tu agencia
          </p>
          <p className="text-xs text-gray-600 mt-1 tracking-wider">
            Esta configuración se guardará en este equipo
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Cargando agencias...</span>
          </div>
        )}

        {error && !loading && (
          <div className="text-red-400 text-sm font-bold text-center animate-pulse">{error}</div>
        )}

        {!loading && !error && agencies.length === 0 && (
          <div className="text-gray-500 text-sm font-bold text-center py-4">
            No hay agencias activas disponibles.
          </div>
        )}

        {!loading && agencies.length > 0 && (
          <div className="flex flex-col gap-3 w-full">
            {agencies.map(agency => (
              <button
                key={agency.id}
                onClick={() => handleSelect(agency)}
                disabled={selecting !== null}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-200 select-none ${
                  selecting === agency.id
                    ? 'bg-amber-400/20 border-amber-400 scale-[0.98]'
                    : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-amber-400/40 active:scale-[0.98]'
                }`}
              >
                <div className="text-left">
                  <p className="text-white font-bold text-base tracking-wide">{agency.name}</p>
                  <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-0.5">{agency.code}</p>
                </div>
                {selecting === agency.id ? (
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-gray-600 text-lg">›</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
    </div>
  );
};
