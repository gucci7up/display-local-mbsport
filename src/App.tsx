import { useEffect, useState, useRef, Fragment } from 'react';
import { Header } from './components/Header';
import { JackpotAnimation } from './components/JackpotAnimation';
import { X2Animation } from './components/X2Animation';
import { BonusAnimation } from './components/BonusAnimation';
import { Lobby } from './pages/Lobby';
import { DogsPresentation } from './pages/DogsPresentation';
import { ExactaMatrix } from './pages/ExactaMatrix';
import { OfficialResults } from './pages/OfficialResults';
import { VideoRace } from './pages/VideoRace';
import { LoginScreen, isDisplayUnlocked, lockDisplay } from './pages/LoginScreen';
import { AgencySetup } from './pages/AgencySetup';
import { api } from './services/api';
import { socket } from './services/socket';

type ScreenType = 'LOBBY' | 'DOGS' | 'ODDS' | 'VIDEO' | 'RESULTS';

function App() {
  const [unlocked, setUnlocked] = useState<boolean>(() => isDisplayUnlocked());
  const [agencyConfigured, setAgencyConfigured] = useState<boolean>(
    () => api.getDisplayAgencyId() !== null,
  );

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
  // Ref que captura la carrera que está en VIDEO para que handleVideoEnded la use aunque currentRace ya cambió
  const videoRaceRef = useRef<any>(null);


  // Jackpot state
  const [jackpotAmount, setJackpotAmount] = useState<number>(0);
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
  const [shownResultsRaceId, setShownResultsRaceId] = useState<string | null>(null);

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
    setFinishedRaceResults(null);   // limpiar mientras carga
    setFinishedRaceNumber(finishedRace?.numero ?? null);
    setCurrentScreen('RESULTS');

    if (!raceId) return;
    const tryFetch = (attempt: number) => {
      api.getRaceResults(raceId)
        .then(results => { if (results) setFinishedRaceResults(results); })
        .catch(() => {});
      if (attempt < 8) setTimeout(() => tryFetch(attempt + 1), 3000);
    };
    tryFetch(0);
  };

  // 1. Fetch current race, history and game status
  const fetchData = async () => {
    try {
      const [race, history, gameStatus] = await Promise.all([
        api.getCurrentRace(),
        api.getRaceHistory(8).catch(() => []),
        api.getGameStatus().catch(() => null),
      ]);

      setCurrentRace(race);
      setRaceHistory(history);

      if (gameStatus) {
        setJackpotAmount(Number(gameStatus.jackpotAmount ?? 0));
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching basic race data:', err);
      setError('Error al conectar con la API. Reintentando...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Connect websocket
    socket.connect();

    // Poll current race data every 4 seconds
    const interval = setInterval(fetchData, 4000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);


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

    if (status === 'OPEN' || status === 'CLOSED' || (status === 'FINISHED' && shownResultsRaceId === currentRace.id)) {
      // Rotate screens every 12 seconds in OPEN or CLOSED status (or if RESULTS was already shown for 15s)
      const rotate = () => {
        openScreenIndexRef.current = (openScreenIndexRef.current + 1) % openScreens.length;
        const nextScreen = openScreens[openScreenIndexRef.current];
        setCurrentScreen(nextScreen);
      };

      // Set initial screen if we are not on one of the open screens
      if (!openScreens.includes(currentScreen)) {
        openScreenIndexRef.current = 0;
        setCurrentScreen('LOBBY');
      }

      rotationTimerRef.current = setInterval(rotate, 12000) as unknown as number;
    } else if (status === 'RUNNING') {
      if (playedVideoRaceId !== currentRace.id) {
        setCurrentScreen('VIDEO');
      } else {
        setCurrentScreen('RESULTS');
      }
    } else if (status === 'FINISHED' && shownResultsRaceId !== currentRace.id) {
      setCurrentScreen('RESULTS');
    }

    return () => {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    };
  }, [autoMode, currentRace?.id, currentRace?.status, playedVideoRaceId, shownResultsRaceId]);

  // 4. Timer to exit RESULTS screen after 35 seconds in autoMode
  useEffect(() => {
    if (!autoMode || !currentRace) return;

    const isPostRace = currentRace.status === 'FINISHED' || currentRace.status === 'OFFICIAL' || currentRace.status === 'RUNNING';
    if (currentScreen === 'RESULTS' && isPostRace && shownResultsRaceId !== currentRace.id) {
      const timer = setTimeout(() => {
        setShownResultsRaceId(currentRace.id);
        setCurrentScreen('LOBBY');
      }, 35000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, currentRace?.id, currentRace?.status, autoMode, shownResultsRaceId]);

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
      case 'VIDEO':
        screenComponent = (
          <VideoRace
            currentRace={currentRace}
            onVideoEnded={handleVideoEnded}
          />
        );
        transitionClass = 'animate-cinematic-video';
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

  if (!unlocked) {
    return <LoginScreen onUnlock={() => setUnlocked(true)} />;
  }

  if (!agencyConfigured) {
    return (
      <AgencySetup
        onComplete={() => setAgencyConfigured(true)}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-white relative stadium-bg">
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
          />
        </div>

        {/* SCREEN CONTENT */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {error && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-red-600/90 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-lg border border-red-500 animate-pulse">
              ⚠️ {error}
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
