import React, { useState } from 'react';
import { api } from '../services/api';

interface AgencySetupProps {
  onComplete: () => void;
}

export const AgencySetup: React.FC<AgencySetupProps> = ({ onComplete }) => {
  const [agencyId, setAgencyId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const id = agencyId.trim();
    if (!id) { setError('Ingresa el ID de la agencia.'); return; }

    setLoading(true);
    setError(null);
    try {
      // Verificar que la agencia existe
      const agencies = await api.getAgencies();
      const found = agencies.find((a: any) => a.id === id);
      if (!found) {
        setError('No se encontró ninguna agencia con ese ID.');
        setLoading(false);
        return;
      }
      api.setDisplayAgencyId(id);
      onComplete();
    } catch {
      setError('No se pudo conectar al servidor. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-400/5 rounded-full blur-[140px]" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      {/* Logo */}
      <div className="flex flex-col items-center mb-10 z-10">
        <img src="/logo.png" alt="MBSport" className="h-16 object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]" />
        <span className="text-[11px] font-bold text-gray-500 tracking-[0.4em] uppercase mt-1">
          Racing Dogs · Configuración de Display
        </span>
      </div>

      {/* Card */}
      <div className="z-10 flex flex-col gap-5 px-10 py-8 rounded-3xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm shadow-[0_0_60px_rgba(0,0,0,0.8)] max-w-md w-full mx-4">
        <div className="text-center">
          <p className="text-sm font-bold text-gray-400 tracking-[0.2em] uppercase">ID de Agencia</p>
          <p className="text-xs text-gray-600 mt-1 tracking-wider">
            Ingresa el ID de la agencia que deseas mostrar
          </p>
        </div>

        <input
          type="text"
          value={agencyId}
          onChange={(e) => { setAgencyId(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          autoFocus
          spellCheck={false}
          className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl px-4 py-3 text-white text-sm font-mono tracking-wider placeholder-gray-600 outline-none focus:border-amber-400/60 focus:bg-white/[0.07] transition-all"
        />

        {error && (
          <p className="text-red-400 text-xs font-bold text-center">{error}</p>
        )}

        <button
          onClick={handleConfirm}
          disabled={loading || !agencyId.trim()}
          className="w-full py-3 rounded-xl bg-amber-400 text-black font-bold text-sm tracking-widest uppercase transition-all hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Verificando...' : 'CONFIRMAR'}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
    </div>
  );
};
