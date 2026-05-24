import { useState, useRef, useCallback, useEffect } from 'react';
import { Snowflake } from 'lucide-react';
import SimulationCanvas from './components/SimulationCanvas.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import Dashboard from './components/Dashboard.jsx';
import Charts from './components/Charts.jsx';
import ResultsModal from './components/ResultsModal.jsx';
import { SimulationEngine } from './simulation/Engine.js';

const DEFAULT_CONFIG = {
  colonySize: 80,
  bodyTemp: 38,
  energy: 100,
  eggLossProb: 0.005,
  criticalTemp: 34,
  searchRadius: 2
};

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [simState, setSimState] = useState(null);
  const [speed, setSpeed] = useState(60);
  const engineRef = useRef(null);
  const animRef = useRef(null);
  const runningRef = useRef(false);

  const initEngine = useCallback(() => {
    const engine = new SimulationEngine({
      colonySize: config.colonySize,
      stepsPerTick: speed
    });
    const state = engine.init();
    engineRef.current = engine;
    setSimState(state);
    return engine;
  }, [config.colonySize, speed]);

  // Initialize on mount
  useEffect(() => {
    initEngine();
  }, []);

  const loop = useCallback(() => {
    if (!runningRef.current || !engineRef.current) return;
    const engine = engineRef.current;
    engine.stepsPerTick = speed;
    const state = engine.tick();
    setSimState(state);

    if (state.finished) {
      runningRef.current = false;
      return;
    }
    animRef.current = requestAnimationFrame(loop);
  }, [speed]);

  const handleStart = useCallback(() => {
    if (!engineRef.current || engineRef.current.finished) {
      initEngine();
    }
    const engine = engineRef.current;
    engine.running = true;
    runningRef.current = true;
    animRef.current = requestAnimationFrame(loop);
  }, [loop, initEngine]);

  const handlePause = useCallback(() => {
    runningRef.current = false;
    if (engineRef.current) engineRef.current.running = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (engineRef.current) setSimState(engineRef.current.getState());
  }, []);

  const handleReset = useCallback(() => {
    runningRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    initEngine();
  }, [initEngine]);

  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed);
    if (engineRef.current) {
      engineRef.current.stepsPerTick = newSpeed;
    }
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__left">
          <div className="app-header__icon">
            <Snowflake size={22} color="white" />
          </div>
          <div>
            <h1 className="app-header__title">Pingüinos Emperador — Supervivencia Antártica</h1>
            <p className="app-header__subtitle">
              Simulación basada en agentes del huddle invernal · Modelo ABM
            </p>
          </div>
        </div>
        {simState?.environment && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                Día {simState.day} / 92
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                Paso {simState.step.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left: Controls */}
        <ControlPanel
          config={config}
          setConfig={setConfig}
          running={runningRef.current && simState?.running !== false}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
          speed={speed}
          finished={simState?.finished}
        />

        {/* Center: Simulation Canvas + Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SimulationCanvas simState={simState} />
          <Charts stats={simState?.stats} />
        </div>

        {/* Right: Dashboard */}
        <Dashboard simState={simState} />
      </div>

      {/* Results Modal */}
      <ResultsModal simState={simState} onReset={handleReset} />
    </div>
  );
}
