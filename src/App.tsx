import { useEffect, useState, useRef, Fragment } from 'react';
import { Header } from './components/Header';
import { JackpotAnimation } from './components/JackpotAnimation';
import { X2Animation } from './components/X2Animation';
import { BonusAnimation } from './components/BonusAnimation';
import { Lobby } from './pages/Lobby';
import { DogsPresentation } from './pages/DogsPresentation';
import { ExactaMatrix } from './pages/ExactaMatrix';
import { OfficialResults } from './pages/OfficialResults';
import { ResultsModal } from './components/ResultsModal';
import { VideoRace } from './pages/VideoRace';
import { RaceStartingScreen } from './pages/RaceStartingScreen';
import { LoginScreen, isDisplayUnlocked, lockDisplay } from './pages/LoginScreen';
import { AgencySetup } from './pages/AgencySetup';
import { api } from './services/api';
import { socket } from './services/socket';

type ScreenType = 'LOBBY' | 'DOGS' | 'ODDS' | 'RACE_STARTING' | 'VIDEO' | 'RESULTS';

function App() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    // Con ?agencyId= en URL → desbloqueado automáticamente (abierto desde POS)
    const urlAgencyId = new URLSearchParams(window.location.search).get('agencyId');
    if (urlAgencyId) return true;
    return isDisplayUnlocked();
  });
  const [agencyConfigured, setAgencyConfigured] = useState<boolean>(() => {
    // Sin ?agencyId= en URL → siempre pedir selección aunque haya localStorage
    // Con ?agencyId= en URL → configurado directo
    const urlAgencyId = new URLSearchParams(window.location.search).get('agencyId');
    return urlAgencyId !== null;
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('LOBBY');
  const [autoMode, setAutoMode] = useState<boolean>(true);

  // Operator debug Mode
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const debugParam = params.get('debug');
    if (debugParam !== null) {
      return debugParam === 'true' || debugParam === '1';
    }
    return import.meta.env.DEV;
  });

  useEffect(() => {
    (window as any).MODE_DEBUG = debugMode;
    (window as any).setModeDebug = setDebugMode;
  }, [debugMode]);

  // Dynamic status-aware messages for the bottom ESPN-style ticker
  const getTickerMessages = () => {
    const num = currentRace?.numero || '---';
    const status = (currentRace?.status || 'OPEN').toUpperCase();

    const baseMessages = [
      'Bienvenidos a MBSPORT Racing Dogs',
      'Sistema profesional de apuestas deportivas',
      'Juega responsablemente',
      'Pagos instantáneos de tickets ganadores',
      'Cuotas actualizadas en tiempo real'
    ];

    if (status === 'RUNNING') {
      return [
        `Carrera #${num} en curso - Transmisión en vivo`,
        ...baseMessages,
        'Resultados oficiales al finalizar'
      ];
    } else if (status === 'FINISHED' || status === 'OFFICIAL') {
      return [
        `Carrera #${num} finalizada - Resultados oficiales en pantalla`,
        ...baseMessages,
        'Resultados oficiales en tiempo real'
      ];
    } else if (status === 'CLOSED') {
      return [
        `Carrera #${num} en pista - Apuestas cerradas`,
        ...baseMessages,
        'Próxima carrera iniciando pronto'
      ];
    } else {
      return [
        `Carrera #${num} en preparación - Apuestas abiertas`,
        'Apuestas abiertas para la próxima carrera',
        ...baseMessages,
        'Resultados oficiales en tiempo real'
      ];
    }
  };

  // API State
  const [currentRace, setCurrentRace] = useState<any>(null);
  const [liveOdds, setLiveOdds] = useState<any[]>([]);
  const [raceHistory, setRaceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Resultados de la pantalla final: carrera que acaba de terminar (independiente de currentRace)
  const [finishedRaceResults, setFinishedRaceResults] = useState<any>(null);
  const [finishedRaceNumber, setFinishedRaceNumber] = useState<any>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  // Ref que captura la carrera que está en VIDEO para que handleVideoEnded la use aunque currentRace ya cambió
  const videoRaceRef = useRef<any>(null);


  // Overlay imagen "Ya va a comenzar" — se muestra encima del video durante 3s extra
  const [showStartingOverlay, setShowStartingOverlay] = useState(false);
  const [startingOverlayFading, setStartingOverlayFading] = useState(false);

  // Jackpot state
  const [jackpotAmount, setJackpotAmount] = useState<number>(0);
  const [trifectaBonusRate, setTrifectaBonusRate] = useState<number>(0);
  const [trifectaBonusPool, setTrifectaBonusPool] = useState<number>(0);
  const [showJackpotWin, setShowJackpotWin] = useState<boolean>(false);
  const [jackpotWinAmount, setJackpotWinAmount] = useState<number>(0);
  const jackpotWonRaceIdRef = useRef<string | null>(null);

  // X2 state
  const [showX2, setShowX2] = useState<boolean>(false);
  const [x2DogNum, setX2DogNum] = useState<number>(0);
  const x2ShownRaceIdRef = useRef<string | null>(null);

  // Bonus state
  const [showBonus, setShowBonus] = useState<boolean>(false);
  const [bonusLabelState, setBonusLabelState] = useState<string>('');
  const bonusShownRaceIdRef = useRef<string | null>(null);

  // Rotation cycle state (only used in OPEN status)
  const openScreens: ScreenType[] = ['LOBBY', 'DOGS', 'ODDS'];
  const openScreenIndexRef = useRef<number>(0);
  const rotationTimerRef = useRef<number | null>(null);

  // Prevent infinite video looping or results looping in autoMode
  const [playedVideoRaceId, setPlayedVideoRaceId] = useState<string | null>(null);
  const [shownResultsRaceId] = useState<string | null>(null);

  // Capturar la carrera cuando arranca el video (antes de que currentRace cambie a la siguiente)
  useEffect(() => {
    if (currentRace?.status === 'RUNNING') {
      videoRaceRef.current = currentRace;
    }
  }, [currentRace?.id, currentRace?.status]);

  const handleVideoEnded = () => {
    // Usar la carrera que estaba en VIDEO, no currentRace (que ya puede ser la siguiente)
    const finishedRace = videoRaceRef.current || currentRace;
    const raceId = finishedRace?.id;

    setPlayedVideoRaceId(raceId || null);
    setFinishedRaceResults(null);
    setFinishedRaceNumber(finishedRace?.numero ?? null);
    setShowResultsModal(false);

    if (!raceId) return;

    // Esperar que el backend tenga el resultado real (carrera liquidada)
    // Verificar que winners tenga datos antes de mostrar el modal
    const tryFetch = (attempt: number) => {
      api.getRaceResults(raceId)
        .then(results => {
          const hasRealData = results?.winners?.trifecta || results?.winners?.exacta || results?.winners?.winner || results?.resultado;
          if (hasRealData) {
            setFinishedRaceResults(results);
            setShowResultsModal(true);
          } else if (attempt < 10) {
            // Backend aún no liquidó — reintentar cada 1.5s
            setTimeout(() => tryFetch(attempt + 1), 1500);
          } else {
            // Máximo 10 intentos — mostrar igualmente
            if (results) setFinishedRaceResults(results);
            setShowResultsModal(true);
          }
        })
        .catch(() => {
          if (attempt < 10) setTimeout(() => tryFetch(attempt + 1), 1500);
          else setShowResultsModal(true);
        });
    };
    setTimeout(() => tryFetch(0), 2000); // 2s iniciales para que la carrera se liquide
  };

  // Contador de fallos consecutivos (ref para no causar re-renders)
  const consecutiveFailuresRef = useRef(0);
  const MAX_FAILURES = 3;

  // Intervalo adaptativo según estado de carrera
  const getPollInterval = (status: string) => {
    if (status === 'CLOSED' || status === 'RUNNING') return 2000;  // momento crítico
    if (status === 'OPEN') return 4000;                             // carrera abierta
    return 8000;                                                    // sin carrera
  };

  // 1. Fetch current race, history and game status
  const fetchData = async () => {
    try {
      const [race, history, gameStatus] = await Promise.all([
        api.getCurrentRace(),
        api.getRaceHistory(8).catch(() => []),
        api.getGameStatus().catch(() => null),
      ]);

      consecutiveFailuresRef.current = 0; // resetear al éxito

      if (gameStatus) {
        setJackpotAmount(Number(gameStatus.jackpotAmount ?? 0));
        setTrifectaBonusRate(Number(gameStatus.trifectaBonusRate ?? 0));
        setTrifectaBonusPool(Number(gameStatus.trifectaBonusPool ?? 0));
        if (race) race.x2Dog = gameStatus.x2Dog ?? 0;
      }

      setCurrentRace(race);
      setRaceHistory(history);
      setError(null);
    } catch (err: any) {
      consecutiveFailuresRef.current++;
      // Solo mostrar error después de 3 fallos consecutivos
      if (consecutiveFailuresRef.current >= MAX_FAILURES) {
        setError('Sin conexión');
      }
      // Los datos anteriores se mantienen en pantalla (no se borran)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.connect();
    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = async () => {
      await fetchData();
      // Intervalo adaptativo según estado actual de la carrera
      const status = (window as any).__raceStatus ?? 'IDLE';
      timeoutId = setTimeout(schedule, getPollInterval(status));
    };

    schedule();

    return () => {
      clearTimeout(timeoutId);
      socket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Exponer estado de carrera para el scheduler adaptativo
  useEffect(() => {
    (window as any).__raceStatus = currentRace?.status ?? 'IDLE';
  }, [currentRace?.status]);


  // Detect jackpot win from race history
  useEffect(() => {
    if (raceHistory.length === 0) return;
    const latest = raceHistory[0];
    const won = Number(latest.jackpotWon ?? 0);
    if (won > 0 && latest.id !== jackpotWonRaceIdRef.current) {
      jackpotWonRaceIdRef.current = latest.id;
      setJackpotWinAmount(won);
      setShowJackpotWin(true);
    }
  }, [raceHistory]);

  // Detect X2 multiplier activation
  useEffect(() => {
    if (!currentRace) return;
    const dog = Number(currentRace.x2Dog ?? 0);
    if (dog > 0 && currentRace.id !== x2ShownRaceIdRef.current) {
      x2ShownRaceIdRef.current = currentRace.id;
      setX2DogNum(dog);
      setShowX2(true);
    }
  }, [currentRace?.x2Dog, currentRace?.id]);

  // Detect trifecta bonus from race history
  useEffect(() => {
    if (raceHistory.length === 0) return;
    const latest = raceHistory[0];
    const bonus = latest.bonusLabel ?? '';
    if (bonus && latest.id !== bonusShownRaceIdRef.current) {
      bonusShownRaceIdRef.current = latest.id;
      setBonusLabelState(bonus);
      setShowBonus(true);
    }
  }, [raceHistory]);

  // 2. Fetch odds and results when current race changes
  useEffect(() => {
    if (!currentRace?.id) return;

    const fetchOddsAndResults = async () => {
      try {
        // Fetch odds
        const odds = await api.getLiveOdds(currentRace.id);
        setLiveOdds(odds);

        // Los resultados para la pantalla RESULTS se manejan en handleVideoEnded
      } catch (err) {
        console.error('Error fetching odds or results:', err);
      }
    };

    fetchOddsAndResults();
    const interval = setInterval(fetchOddsAndResults, 4000);
    return () => clearInterval(interval);
  }, [currentRace?.id, currentRace?.status]);

  // 3. Auto Mode rotation logic
  useEffect(() => {
    if (rotationTimerRef.current) {
      clearInterval(rotationTimerRef.current);
      rotationTimerRef.current = null;
    }

    if (!autoMode || !currentRace) return;

    const status = currentRace.status ? currentRace.status.toUpperCase() : 'OPEN';

    if (status === 'OPEN' || (status === 'FINISHED' && shownResultsRaceId === currentRace.id)) {
      // Tiempos por pantalla: ODDS = 30s protagonista, LOBBY/DOGS = 5s
      const screenDuration: Record<string, number> = {
        LOBBY: 5000,
        DOGS:  5000,
        ODDS:  30000,
      };

      if (!openScreens.includes(currentScreen)) {
        openScreenIndexRef.current = 0;
        setCurrentScreen('LOBBY');
      }

      // setTimeout encadenado — cada pantalla espera su propio tiempo
      const scheduleNext = (screen: string) => {
        const delay = screenDuration[screen] ?? 5000;
        rotationTimerRef.current = setTimeout(() => {
          openScreenIndexRef.current = (openScreenIndexRef.current + 1) % openScreens.length;
          const nextScreen = openScreens[openScreenIndexRef.current];
          setCurrentScreen(nextScreen);
          scheduleNext(nextScreen);
        }, delay) as unknown as number;
      };

      scheduleNext(currentScreen);
    } else if (status === 'CLOSED') {
      // Imagen "Ya va a comenzar" full screen
      setCurrentScreen('RACE_STARTING');
    } else if (status === 'RUNNING') {
      if (playedVideoRaceId !== currentRace.id) {
        // No interrumpir si estamos mostrando resultados de la carrera anterior
        if (currentScreen !== 'RESULTS') {
          setShowStartingOverlay(true);
          setStartingOverlayFading(false);
          setCurrentScreen('VIDEO');
        }
      } else {
        setCurrentScreen('RESULTS');
      }
    } else if (status === 'FINISHED' && shownResultsRaceId !== currentRace.id) {
      setCurrentScreen('RESULTS');
    }

    return () => {
      if (rotationTimerRef.current) {
        clearTimeout(rotationTimerRef.current);
      }
    };
  }, [autoMode, currentRace?.id, currentRace?.status, playedVideoRaceId, shownResultsRaceId]);

  // 4b. Anticipar RACE_STARTING cuando el countdown llega a 0 localmente
  useEffect(() => {
    if (!currentRace || currentRace.status !== 'OPEN') return;
    const endAt = currentRace.saleEndAt || currentRace.closeAt;
    if (!endAt) return;
    const msLeft = new Date(endAt).getTime() - Date.now();
    if (msLeft <= 0) { setCurrentScreen('RACE_STARTING'); return; }
    const t = setTimeout(() => setCurrentScreen('RACE_STARTING'), msLeft);
    return () => clearTimeout(t);
  }, [currentRace?.id, currentRace?.saleEndAt, currentRace?.closeAt]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4c. Ocultar overlay imagen con fade después de 3s cuando el video empieza
  useEffect(() => {
    if (!showStartingOverlay) return;
    const fadeTimer = setTimeout(() => setStartingOverlayFading(true), 3000);
    const hideTimer = setTimeout(() => setShowStartingOverlay(false), 3800); // 800ms fade
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, [showStartingOverlay]);

  // El timer de resultados ahora está dentro del componente ResultsModal

  // Toggle Auto Mode
  const toggleAutoMode = () => {
    setAutoMode((prev) => {
      const next = !prev;
      if (!next) {
        console.log('Manual navigation mode active');
      }
      return next;
    });
  };

  const handleLock = () => {
    lockDisplay();
    setUnlocked(false);
  };

  const handleChangeAgency = () => {
    api.setDisplayAgencyId(null);
    setAgencyConfigured(false);
  };

  // Render active screen with professional TV transition wraps
  const renderScreen = () => {
    if (loading && !currentRace) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-black">
          <div className="w-12 h-12 border-4 border-pos-yellow border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 mt-4 font-semibold">Cargando MBSport Display...</span>
        </div>
      );
    }

    let screenComponent: React.ReactNode;
    let transitionClass = '';

    switch (currentScreen) {
      case 'LOBBY':
        screenComponent = <Lobby raceHistory={raceHistory} liveOdds={liveOdds} />;
        transitionClass = 'animate-fade-in-lobby';
        break;
      case 'DOGS':
        screenComponent = <DogsPresentation liveOdds={liveOdds} />;
        transitionClass = 'animate-fade-slide-dogs';
        break;
      case 'ODDS':
        screenComponent = <ExactaMatrix liveOdds={liveOdds} raceHistory={raceHistory} />;
        transitionClass = 'animate-fade-odds';
        break;
      case 'RACE_STARTING':
      case 'VIDEO':
        // Estos se renderizan como overlays fuera del layout principal
        screenComponent = null;
        break;
      case 'RESULTS':
        screenComponent = (
          <OfficialResults
            raceNumber={finishedRaceNumber ?? currentRace?.numero ?? '---'}
            resultsData={finishedRaceResults}
            liveOdds={liveOdds}
          />
        );
        transitionClass = 'animate-fade-out-slide-up-results';
        break;
      default:
        screenComponent = <Lobby raceHistory={raceHistory} liveOdds={liveOdds} />;
        transitionClass = 'animate-fade-in-lobby';
    }

    return (
      <div key={currentScreen} className={`flex-1 flex flex-col min-h-0 relative w-full h-full ${transitionClass}`}>
        {screenComponent}
      </div>
    );
  };

  if (!unlocked) return <LoginScreen onUnlock={() => setUnlocked(true)} />;

  if (!agencyConfigured) {
    return (
      <AgencySetup
        onComplete={() => setAgencyConfigured(true)}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-white relative stadium-bg" style={{ isolation: 'auto' }}>
      {/* Stadium lights breathing top-glow */}
      <div className="stadium-lights-breath" />

      {/* Background Image with subtle overlay for broadcast feel */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-20 z-0"
        style={{ backgroundImage: "url('/greyhound_bg.png')" }}
      />
      {/* Solid black backdrop color overlay */}
      <div className="absolute inset-0 bg-black/80 z-0" />

      {/* Main Container */}
      <div className="relative flex flex-col h-full w-full z-10">
        {/* HEADER - Absolute position during video to achieve true fullscreen overlay */}
        <div className={currentScreen === 'VIDEO' ? 'absolute top-0 left-0 right-0 z-30' : ''}>
          <Header
            raceNumber={currentRace?.numero || '---'}
            status={currentRace?.status || 'OPEN'}
            closeAt={currentRace?.closeAt || null}
            autoMode={autoMode}
            toggleAutoMode={toggleAutoMode}
            onLock={handleLock}
            onChangeAgency={handleChangeAgency}
            debugMode={debugMode}
            isTransparent={currentScreen === 'VIDEO'}
            jackpotAmount={jackpotAmount}
            trifectaBonusRate={trifectaBonusRate}
            trifectaBonusPool={trifectaBonusPool}
          />
        </div>

        {/* SCREEN CONTENT */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {error && (
            <div className="absolute top-2 right-2 z-50 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full border border-red-500/50">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-[10px] font-mono">Sin conexión</span>
            </div>
          )}
          {renderScreen()}
        </div>

        {/* PREMIUM TICKER: dark broadcast bar with gold accents */}
        <div className="h-10 bg-gradient-to-r from-surface-2 via-pos-bg to-surface-2 border-t border-white/[0.06] text-pos-text font-sans text-sm flex items-center overflow-hidden shrink-0 z-20 relative select-none">
          {/* Top gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gold-line" />

          {/* Label fixed left */}
          <div className="h-full bg-black/60 text-gradient-gold px-5 flex items-center shrink-0 z-30 font-extrabold border-r border-white/[0.06] uppercase tracking-widest text-xs gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#dc2626]" />
            INFO EN VIVO
          </div>
          {/* Loop horizontal text */}
          <div className="relative w-full overflow-hidden h-full flex items-center z-10">
            <div className="animate-ticker-slide whitespace-nowrap flex items-center gap-16 pl-8 uppercase tracking-wider font-semibold text-[13px] shrink-0 text-gray-300">
              {getTickerMessages().map((msg, idx) => (
                <Fragment key={idx}>
                  {idx > 0 && <span className="text-pos-yellow/40 text-base font-black shrink-0">•</span>}
                  <span className="shrink-0">{msg}</span>
                </Fragment>
              ))}
              <span className="text-pos-yellow/40 text-base font-black shrink-0">•</span>
              {/* Duplicating for seamless loop */}
              {getTickerMessages().map((msg, idx) => (
                <Fragment key={`dup-${idx}`}>
                  {idx > 0 && <span className="text-pos-yellow/40 text-base font-black shrink-0">•</span>}
                  <span className="shrink-0">{msg}</span>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RACE STARTING — full screen al cerrar carrera */}
      {currentScreen === 'RACE_STARTING' && currentRace && (
        <RaceStartingScreen raceNumber={currentRace.numero ?? '---'} />
      )}

      {/* OVERLAY imagen encima del video durante 3s extra al arrancar */}
      {showStartingOverlay && currentRace && (
        <div
          style={{
            transition: 'opacity 0.8s ease-out',
            opacity: startingOverlayFading ? 0 : 1,
            pointerEvents: 'none',
          }}
        >
          <RaceStartingScreen raceNumber={currentRace.numero ?? '---'} />
        </div>
      )}

      {/* VIDEO — full screen fuera del layout */}
      {currentScreen === 'VIDEO' && (
        <VideoRace currentRace={currentRace} onVideoEnded={handleVideoEnded} />
      )}

      {/* MODAL DE RESULTADOS — superpuesto, 15s, no interrumpe la pantalla de fondo */}
      {showResultsModal && (
        <ResultsModal
          raceNumber={finishedRaceNumber ?? currentRace?.numero ?? '---'}
          resultsData={finishedRaceResults}
          liveOdds={liveOdds}
          onClose={() => setShowResultsModal(false)}
        />
      )}

      {/* JACKPOT WIN ANIMATION OVERLAY */}
      {showJackpotWin && (
        <JackpotAnimation
          amount={jackpotWinAmount}
          onClose={() => setShowJackpotWin(false)}
        />
      )}

      {/* X2 MULTIPLIER ANIMATION OVERLAY */}
      {showX2 && (
        <X2Animation
          dog={x2DogNum}
          onClose={() => setShowX2(false)}
        />
      )}

      {/* TRIFECTA BONUS ANIMATION OVERLAY */}
      {showBonus && (
        <BonusAnimation
          bonusLabel={bonusLabelState}
          onClose={() => setShowBonus(false)}
        />
      )}

    </div>
  );
}

export default App;
