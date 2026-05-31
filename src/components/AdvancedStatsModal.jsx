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
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Left Column: Charts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Charts stats={simState.stats} />
          </div>

          {/* Right Column: Event Log */}
          <div className="card" style={{ height: '100%', maxHeight: 'calc(90vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="card__header" style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <AlertTriangle size={16} className="card__header-icon" />
              <span className="card__title">Registro de Eventos</span>
            </div>
            <div className="event-log" style={{ flex: 1, overflowY: 'auto', maxHeight: 'none', paddingRight: '4px' }}>
              {!simState.events || simState.events.length === 0 ? (
                <div className="no-data" style={{ padding: '1rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span>Sin eventos aún</span>
                </div>
              ) : (
                [...simState.events].reverse().map((evt, i) => (
                  <div key={i} className={`event-item event-item--${evt.type}`} style={{ marginBottom: '0.5rem' }}>
                    <span className="event-item__day" style={{ minWidth: '35px', fontWeight: 'bold' }}>D{evt.day}</span>
                    <span className="event-item__msg" style={{ lineHeight: '1.3' }}>{evt.message}</span>
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
