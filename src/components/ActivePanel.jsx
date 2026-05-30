import React from 'react';
import Dashboard from './Dashboard.jsx';
import { Play, Pause, Square, BarChart2, FastForward } from 'lucide-react';

export default function ActivePanel({ 
  simState, running, speed, onPause, onStart, onForceEnd, onSpeedChange, onShowAdvancedStats 
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
      {/* Scrollable Dashboard Stats */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        <Dashboard simState={simState} hideEventLog={true} />
      </div>

      {/* Controls stick to bottom */}
      <div className="card" style={{ marginTop: 'auto', flexShrink: 0 }}>
        <div className="card__header" style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem' }}>
          <span className="card__title">Controles de Simulación</span>
        </div>

        <div className="control-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span><FastForward size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Velocidad</span>
            <span style={{ color: 'var(--accent-cyan)' }}>{speed} pasos/tick</span>
          </label>
          <input
            type="range"
            min="1"
            max="1200"
            step="10"
            value={speed}
            onChange={e => onSpeedChange(+e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {!running ? (
            <button className="btn btn--primary btn--full" onClick={onStart}>
              <Play size={14} /> Reanudar
            </button>
          ) : (
            <button className="btn btn--ghost btn--full" onClick={onPause}>
              <Pause size={14} /> Pausar
            </button>
          )}
          <button 
            className="btn btn--sm" 
            onClick={onForceEnd}
            style={{
              padding: '0 1rem',
              background: 'rgba(239, 71, 111, 0.15)', color: 'var(--accent-red)',
              border: '1px solid rgba(239, 71, 111, 0.3)'
            }}
            title="Terminar Simulación"
          >
            <Square size={14} />
          </button>
        </div>

        <button 
          className="btn btn--ghost btn--full" 
          onClick={onShowAdvancedStats}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
        >
          <BarChart2 size={14} /> Estadísticas Avanzadas
        </button>
      </div>
    </div>
  );
}
