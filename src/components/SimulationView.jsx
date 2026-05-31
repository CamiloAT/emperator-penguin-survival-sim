/**
 * SimulationView.jsx
 * Wrapper that lets the user toggle between the 2D canvas and the 3D scene.
 * Both views receive the same simState from the Engine.
 */
import { useState, lazy, Suspense } from 'react';
import SimulationCanvas from './SimulationCanvas.jsx';
import { Box, Layers } from 'lucide-react';

// Lazy-load the 3D scene to avoid loading Three.js if user stays in 2D
const SimulationScene3D = lazy(() => import('./3d/SimulationScene3D.jsx'));

export default function SimulationView({ simState }) {
  const [viewMode, setViewMode] = useState('2d'); // '2d' | '3d'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* View toggle button */}
      <div className="view-toggle">
        <button
          className={`view-toggle__btn ${viewMode === '2d' ? 'view-toggle__btn--active' : ''}`}
          onClick={() => setViewMode('2d')}
          title="Vista 2D"
        >
          <Layers size={14} />
          <span>2D</span>
        </button>
        <button
          className={`view-toggle__btn ${viewMode === '3d' ? 'view-toggle__btn--active' : ''}`}
          onClick={() => setViewMode('3d')}
          title="Vista 3D"
        >
          <Box size={14} />
          <span>3D</span>
        </button>
      </div>

      {/* Render both but show/hide to preserve state */}
      <div style={{
        flex: 1,
        display: viewMode === '2d' ? 'flex' : 'none',
        flexDirection: 'column',
        height: '100%'
      }}>
        <SimulationCanvas simState={simState} />
      </div>

      <div style={{
        flex: 1,
        display: viewMode === '3d' ? 'flex' : 'none',
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
              <SimulationScene3D simState={simState} />
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
    </div>
  );
}
