import { useState, useRef, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import SimulationView from './components/SimulationView.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import ActivePanel from './components/ActivePanel.jsx';
import ResultsModal from './components/ResultsModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import AdvancedStatsModal from './components/AdvancedStatsModal.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import ColorSettingsModal from './components/ColorSettingsModal.jsx';
import { SimulationEngine } from './simulation/Engine.js';

// Premium Penguin Logo component
function PenguinLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Body silhouette */}
      <ellipse cx="24" cy="26" rx="12" ry="16" fill="#0d0d14"/>
      {/* Belly */}
      <ellipse cx="24" cy="29" rx="7" ry="11" fill="#e8e0d0"/>
      {/* Head */}
      <circle cx="24" cy="12" r="8" fill="#0d0d14"/>
      {/* Orange ear patches */}
      <ellipse cx="17.5" cy="14" rx="2.5" ry="4" transform="rotate(-15 17.5 14)" fill="#f0a030"/>
      <ellipse cx="30.5" cy="14" rx="2.5" ry="4" transform="rotate(15 30.5 14)" fill="#f0a030"/>
      {/* Eyes */}
      <circle cx="21" cy="11" r="1.5" fill="white"/>
      <circle cx="27" cy="11" r="1.5" fill="white"/>
      <circle cx="21.3" cy="11.2" r="0.7" fill="#111"/>
      <circle cx="27.3" cy="11.2" r="0.7" fill="#111"/>
      {/* Beak */}
      <path d="M22.5 14.5 L24 17.5 L25.5 14.5 Z" fill="#e87a20"/>
      {/* Feet */}
      <ellipse cx="20" cy="42" rx="3" ry="1.5" fill="#e87a20"/>
      <ellipse cx="28" cy="42" rx="3" ry="1.5" fill="#e87a20"/>
      {/* Wings */}
      <path d="M12 22 Q10 30 14 38" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M36 22 Q38 30 34 38" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export const DEFAULT_CONFIG = {
  colonySize: 80,
  bodyTemp: 38,
  energy: 100,
  eggLossProb: 0.005,
  
  // Customization
  initialViewMode: '3d',
  eggColor: '#ff8800',
  searchColor: '#ff0000',
  criticalTemp: 34,
  searchRadius: 2,

  // Physiology — tuned for ~80% survival over 92 days
  hypothermiaTemp: 28,
  energyDecayBase: 0.0002,
  energyDecayBorder: 0.0008,
  maxThermogenesis: 0.008,
  thermogenesisEnergyFactor: 0.05,

  // Thermodynamics
  heatTransferRate: 0.15,
  heatLossInterior: 0.0002,
  heatLossBorderBase: 0.002,

  // Eggs
  eggLossProbBorder: 0.015,
  eggIncubationTemp: 36,
  eggSearchTimeLimit: 180,
  gridSize: 40,

  // Phase 0: Inicio Incubación
  phase0Duration: 30,
  phase0TempMin: -25,
  phase0TempMax: -35,
  phase0WindMin: 40,
  phase0WindMax: 80,
  phase0EnergyMultiplier: 1.0,

  // Phase 1: Invierno Profundo
  phase1Duration: 31,
  phase1TempMin: -40,
  phase1TempMax: -60,
  phase1WindMin: 80,
  phase1WindMax: 200,
  phase1EnergyMultiplier: 1.5,

  // Phase 2: Pre-Eclosión
  phase2Duration: 31,
  phase2TempMin: -30,
  phase2TempMax: -20,
  phase2WindMin: 50,
  phase2WindMax: 60,
  phase2EnergyMultiplier: 1.1
};

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [simState, setSimState] = useState(null);
  const [speed, setSpeed] = useState(20);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [viewMode, setViewMode] = useState('3d');
  const [isNightMode, setIsNightMode] = useState(false);
  const engineRef = useRef(null);
  const animRef = useRef(null);
  const runningRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const initEngine = useCallback((cfg = config) => {
    runningRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const engine = new SimulationEngine({
      ...cfg,
      stepsPerTick: speed
    });
    const state = engine.init();
    engineRef.current = engine;
    setSimState(state);
    return engine;
  }, [config, speed]);

  // Initialize on mount
  useEffect(() => {
    initEngine();
    if (location.pathname !== '/parameters') {
      navigate('/parameters', { replace: true });
    }
  }, []);

  // Sync hash changes (back button)
  useEffect(() => {
    if (location.pathname === '/parameters' && hasStarted) {
      // Stop simulation if going back to parameters
      runningRef.current = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setShowResultsModal(false);
      setShowAdvancedStats(false);
      setHasStarted(false);
      initEngine();
    }
  }, [location.pathname, hasStarted, initEngine]);

  // Live preview of parameters before starting
  useEffect(() => {
    if (!hasStarted && location.pathname === '/parameters') {
      initEngine(config);
    }
  }, [config, hasStarted, location.pathname]); // Removed initEngine from deps to avoid infinite loops if config changes

  // Show results modal when finished
  useEffect(() => {
    if (simState?.finished) {
      setShowResultsModal(true);
    }
  }, [simState?.finished]);

  const loop = useCallback(() => {
    if (!runningRef.current || !engineRef.current) return;
    const engine = engineRef.current;
    const state = engine.tick();
    setSimState(state);

    if (state.finished) {
      runningRef.current = false;
      return;
    }
    animRef.current = requestAnimationFrame(loop);
  }, []);

  const handleStart = useCallback(() => {
    if (!hasStarted) {
      navigate('/simulation');
      setIsStarting(true);
      setTimeout(() => {
        setIsStarting(false);
        setHasStarted(true);
        if (!engineRef.current || engineRef.current.finished) {
          initEngine();
        }
        const engine = engineRef.current;
        engine.running = true;
        runningRef.current = true;
        animRef.current = requestAnimationFrame(loop);
      }, 2000);
      return;
    }

    if (!engineRef.current || engineRef.current.finished) {
      initEngine();
    }
    const engine = engineRef.current;
    engine.running = true;
    runningRef.current = true;
    animRef.current = requestAnimationFrame(loop);
  }, [loop, initEngine, hasStarted]);

  const handlePause = useCallback(() => {
    runningRef.current = false;
    if (engineRef.current) engineRef.current.running = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (engineRef.current) setSimState(engineRef.current.getState());
  }, []);

  const handleReset = useCallback(() => {
    runningRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setShowResultsModal(false);
    setShowAdvancedStats(false);
    setHasStarted(false);
    navigate('/parameters');
    initEngine();
  }, [initEngine, navigate]);

  const handleResetDefaults = useCallback(() => {
    runningRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setShowResultsModal(false);
    setShowAdvancedStats(false);
    setHasStarted(false);
    navigate('/parameters');
    setConfig(DEFAULT_CONFIG);
    initEngine(DEFAULT_CONFIG);
  }, [navigate]);

  const handleForceEnd = useCallback(() => {
    if (!engineRef.current) return;
    runningRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const state = engineRef.current.forceFinish();
    setSimState(state);
    setShowResultsModal(true); // Automatically show modal if it's not already
  }, []);

  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed);
    if (engineRef.current) {
      engineRef.current.stepsPerTick = newSpeed;
    }
  }, []);

  const handleSaveSettings = useCallback((newConfig) => {
    setConfig(newConfig);
    runningRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    initEngine(newConfig);
  }, [speed]);

  const totalDays = simState?.environment?.phaseList
    ? simState.environment.phaseList.reduce((s, p) => s + p.durationDays, 0)
    : 92;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__left">
          <div className="app-header__icon-wrapper">
            <PenguinLogo size={36} />
          </div>
          <div>
            <h1 className="app-header__title">Pingüinos Emperador — Supervivencia Antártica</h1>
            <p className="app-header__subtitle">
              Simulación basada en agentes del huddle invernal · Modelo ABM
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {simState?.environment && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                Día {simState.day} / {totalDays}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                Paso {simState.step.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className={`main-content ${isStarting ? 'main-content--loading' : (hasStarted ? 'main-content--running' : 'main-content--initial')}`}>
        <Routes>
          <Route path="/parameters" element={
            isStarting ? <LoadingScreen /> : (
              <>
                <ControlPanel
                  config={config}
                  setConfig={setConfig}
                  onStart={handleStart}
                  onResetDefaults={handleResetDefaults}
                  onOpenSettings={() => setShowSettingsModal(true)}
                  onOpenColors={() => setShowColorModal(true)}
                />
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
                  <SimulationView simState={simState} config={config} viewMode={viewMode} setViewMode={setViewMode} isNightMode={isNightMode} setIsNightMode={setIsNightMode} />
                </div>
              </>
            )
          } />
          
          <Route path="/simulation" element={
            isStarting ? <LoadingScreen /> : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
                  <SimulationView simState={simState} config={config} viewMode={viewMode} setViewMode={setViewMode} isNightMode={isNightMode} setIsNightMode={setIsNightMode} />
                </div>

                <ActivePanel
                  simState={simState}
                  running={runningRef.current && simState?.running !== false && !simState?.finished}
                  speed={speed}
                  onPause={handlePause}
                  onStart={handleStart}
                  onForceEnd={handleForceEnd}
                  onSpeedChange={handleSpeedChange}
                  onShowAdvancedStats={() => setShowAdvancedStats(!showAdvancedStats)}
                />

                {/* Fallback button if they dismiss modal when finished */}
                {simState?.finished && (
                  <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', gap: '1rem', background: 'var(--surface)', padding: '0.8rem 1.5rem', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid var(--border)' }}>
                     <button className="btn btn--ghost" onClick={() => setShowResultsModal(true)}>
                       Ver Resultados
                     </button>
                     <button className="btn btn--primary" onClick={() => setShowResetConfirm(true)}>
                       Nueva Simulación (Ajustar Parám.)
                     </button>
                  </div>
                )}
              </>
            )
          } />

          <Route path="*" element={<Navigate to="/parameters" replace />} />
        </Routes>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          setShowResetConfirm(false);
          handleReset();
        }}
        title="Volver a los Parámetros"
        message="Regresar al panel principal descartará los resultados actuales y los datos de esta colonia. Podrás crear una nueva configuración de pingüinos o usar la anterior. ¿Deseas continuar?"
        confirmText="Ajustar y Nueva Simulación"
      />

      {/* Results Modal */}
      <ResultsModal 
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        simState={simState} 
        onReset={handleReset} 
      />

      <AdvancedStatsModal 
        isOpen={showAdvancedStats}
        onClose={() => setShowAdvancedStats(false)}
        simState={simState}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        config={config}
        onSave={handleSaveSettings}
        onForceEnd={handleForceEnd}
      />

      <ColorSettingsModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        config={config}
        setConfig={setConfig}
      />
    </div>
  );
}
