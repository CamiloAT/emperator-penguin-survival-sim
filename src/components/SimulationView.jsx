/**
 * SimulationView.jsx
 * Wrapper that lets the user toggle between the 2D canvas and the 3D scene.
 * Both views receive the same simState from the Engine.
 *
 * El estado de transición (isSwitching) y el setter del modo de vista vienen
 * desde App.jsx, para que la animación del huevo se dispare igual desde el
 * botón aquí como desde el shortcut 'V'.
 */
import { lazy, Suspense, useState, useRef, useEffect } from 'react';
import SimulationCanvas from './SimulationCanvas.jsx';
import { Box, Layers, Sun, Sunset, Moon, Snowflake, Volume2, VolumeX } from 'lucide-react';

// Lazy-load the 3D scene to avoid loading Three.js if user stays in 2D
const SimulationScene3D = lazy(() => import('./3d/SimulationScene3D.jsx'));

const TIME_CYCLE = ['day', 'sunset', 'night'];
const TIME_ICONS = { day: Sun, sunset: Sunset, night: Moon };
const TIME_LABELS = { day: 'Día', sunset: 'Atardecer', night: 'Noche' };
const TIME_NEXT = { day: 'Atardecer', sunset: 'Noche', night: 'Día' };

export default function SimulationView({ simState, config, viewMode, setViewMode, isSwitching = false, timeOfDay, setTimeOfDay, isSnowEnabled, setIsSnowEnabled }) {
  const [isAmbientSoundOn, setIsAmbientSoundOn] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/environment-sound.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (viewMode === '2d' && audioRef.current) {
      audioRef.current.pause();
      setIsAmbientSoundOn(false);
    }
  }, [viewMode]);

  const toggleAmbientSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isAmbientSoundOn) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsAmbientSoundOn(prev => !prev);
  };

  const handleToggle = (mode) => {
    if (mode === viewMode || isSwitching) return;
    setViewMode(mode);
  };

  const cycleTimeOfDay = () => {
    const idx = TIME_CYCLE.indexOf(timeOfDay);
    const next = TIME_CYCLE[(idx + 1) % TIME_CYCLE.length];
    setTimeOfDay(next);
  };

  const TimeIcon = TIME_ICONS[timeOfDay] || Sun;
  const timeColor = { day: '#ffcc33', sunset: '#ff7733', night: '#8aa2d6' }[timeOfDay];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* View toggle button */}
      <div className="view-toggle">
        <button
          className={`view-toggle__btn ${viewMode === '2d' ? 'view-toggle__btn--active' : ''}`}
          onClick={() => handleToggle('2d')}
          title="Vista 2D"
          disabled={isSwitching}
        >
          <Layers size={14} />
          <span>2D</span>
        </button>
        <button
          className={`view-toggle__btn ${viewMode === '3d' ? 'view-toggle__btn--active' : ''}`}
          onClick={() => handleToggle('3d')}
          title="Vista 3D"
          disabled={isSwitching}
        >
          <Box size={14} />
          <span>3D</span>
        </button>

        {/* Time of day + snow controls visible only in 3D */}
        {viewMode === '3d' && (
          <>
            <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
            <button
              className="view-toggle__btn view-toggle__btn--icon"
              onClick={cycleTimeOfDay}
              title={`Cambiar a ${TIME_NEXT[timeOfDay]} (actual: ${TIME_LABELS[timeOfDay]})`}
              disabled={isSwitching}
              style={{ color: timeColor }}
            >
              <TimeIcon size={14} />
            </button>
            <button
              className="view-toggle__btn view-toggle__btn--icon"
              onClick={() => setIsSnowEnabled(!isSnowEnabled)}
              title={isSnowEnabled ? 'Desactivar nieve' : 'Activar nieve'}
              disabled={isSwitching}
              style={{ opacity: isSnowEnabled ? 1 : 0.5 }}
            >
              <Snowflake size={14} />
            </button>
            <button
              className="view-toggle__btn view-toggle__btn--icon"
              onClick={toggleAmbientSound}
              title={isAmbientSoundOn ? 'Desactivar sonido ambiente' : 'Activar sonido ambiente'}
              disabled={isSwitching}
              style={{ opacity: isAmbientSoundOn ? 1 : 0.5 }}
            >
              {isAmbientSoundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </>
        )}
      </div>

      {/* Render both but show/hide to preserve state */}
      <div style={{
        flex: 1,
        display: viewMode === '2d' && !isSwitching ? 'flex' : 'none',
        flexDirection: 'column',
        height: '100%'
      }}>
        <SimulationCanvas simState={simState} config={config} />
      </div>

      <div style={{
        flex: 1,
        display: viewMode === '3d' && !isSwitching ? 'flex' : 'none',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0
      }}>
        <div className="canvas-container" style={{ flex: 1, minHeight: 0 }}>
          <div className="canvas-wrapper" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <Suspense fallback={
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div className="pulse" style={{ fontSize: '2rem' }}>🐧</div>
                <span>Cargando escena 3D...</span>
              </div>
            }>
              <SimulationScene3D simState={simState} config={config} timeOfDay={timeOfDay} isSnowEnabled={isSnowEnabled} />
            </Suspense>

            {/* HUD overlay (same info badges as 2D) */}
            {simState?.environment && (
              <>
                <div className="canvas-overlay" style={{ pointerEvents: 'none' }}>
                  <span className="canvas-overlay__badge" style={{ color: 'var(--accent-cyan)' }}>
                    Día {simState.day} — {simState.environment.phase.month}
                  </span>
                  <span className="canvas-overlay__badge" style={{ color: 'var(--accent-orange)' }}>
                    {simState.environment.temperature.toFixed(1)}°C
                  </span>
                  <span className="canvas-overlay__badge" style={{ color: 'var(--text-secondary)' }}>
                    {simState.environment.windSpeed.toFixed(0)} km/h {simState.environment.windDirection}
                  </span>
                  <span className="canvas-overlay__badge" style={{ color: 'var(--accent-green)' }}>
                    🐧 {simState.colony?.alive || 0} vivos
                  </span>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none'
                }}>
                  <span className="canvas-overlay__badge" style={{ 
                    color: 'var(--text-muted)',
                    fontSize: '0.6rem',
                    opacity: 0.7
                  }}>
                    Click + arrastrar para rotar · Scroll para zoom · Click derecho para mover
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isSwitching && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          borderRadius: 'var(--radius-lg)'
        }}>
          <div className="penguin-anim" style={{ 
            width: '60px', height: '80px', 
            background: `radial-gradient(ellipse at 30% 30%, #fff 10%, ${config?.eggColor || '#ff8800'} 80%)`,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            boxShadow: `0 0 20px ${config?.eggColor || '#ff8800'}`,
            marginBottom: '1rem',
            animation: 'spinEgg 1.5s linear infinite'
          }} />
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            Transicionando a vista {viewMode.toUpperCase()}...
          </span>
        </div>
      )}
    </div>
  );
}
