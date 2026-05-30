import React from 'react';
import { X, AlertTriangle, Activity } from 'lucide-react';
import Charts from './Charts.jsx';

export default function AdvancedStatsModal({ isOpen, onClose, simState }) {
  if (!isOpen || !simState) return null;

  return (
    <div className="results-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="results-card" onClick={e => e.stopPropagation()} style={{
        maxWidth: '900px',
        width: '95%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--accent-cyan)" />
            Estadísticas Avanzadas
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <Charts stats={simState.stats} />

          {/* Event Log */}
          <div className="card">
            <div className="card__header">
              <AlertTriangle size={16} className="card__header-icon" />
              <span className="card__title">Registro de Eventos (Historial Completo)</span>
            </div>
            <div className="event-log" style={{ maxHeight: '300px' }}>
              {simState.events.length === 0 ? (
                <div className="no-data" style={{ padding: '1rem' }}>
                  <span>Sin eventos aún</span>
                </div>
              ) : (
                [...simState.events].reverse().map((evt, i) => (
                  <div key={i} className={`event-item event-item--${evt.type}`}>
                    <span className="event-item__day">D{evt.day}</span>
                    <span className="event-item__msg">{evt.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
