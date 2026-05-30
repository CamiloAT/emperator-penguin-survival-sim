import { Award, Heart, Egg, Shield, RotateCcw } from 'lucide-react';

export default function ResultsModal({ isOpen, onClose, simState, onReset }) {
  if (!isOpen || !simState?.finished) return null;

  const { colony, eggs } = simState;
  const totalTime = simState.penguins.reduce((acc, p) => {
    acc.border += p.timeBorder;
    acc.interior += p.timeInterior;
    acc.searching += p.timeSearching;
    return acc;
  }, { border: 0, interior: 0, searching: 0 });

  const totalAll = totalTime.border + totalTime.interior + totalTime.searching || 1;

  return (
    <div className="results-overlay" onClick={onReset}>
      <div className="results-card" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <Award size={40} style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <h2>Resultados de la Simulación</h2>

        <div className="results-grid">
          <div className="result-item">
            <div className="result-item__value" style={{ color: 'var(--accent-green)' }}>
              {colony.survivalRate.toFixed(1)}%
            </div>
            <div className="result-item__label">Supervivencia Padres</div>
          </div>

          <div className="result-item">
            <div className="result-item__value" style={{ color: 'var(--accent-yellow)' }}>
              {colony.eggSurvivalRate.toFixed(1)}%
            </div>
            <div className="result-item__label">Éxito Incubación</div>
          </div>

          <div className="result-item">
            <div className="result-item__value" style={{ color: 'var(--accent-red)' }}>
              {eggs.frozen}
            </div>
            <div className="result-item__label">Huevos Congelados</div>
          </div>

          <div className="result-item">
            <div className="result-item__value" style={{ color: 'var(--accent-cyan)' }}>
              {eggs.rescueEfficiency.toFixed(1)}%
            </div>
            <div className="result-item__label">Eficiencia Rescate</div>
          </div>
        </div>

        {/* Mortality causes */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Causas de Mortalidad Embrionaria
          </div>
          <div className="stat-mini">
            <span className="stat-mini__label">Congelación directa</span>
            <span className="stat-mini__value stat-mini__value--cyan">{eggs.frozen}</span>
          </div>
          <div className="stat-mini">
            <span className="stat-mini__label">Inanición del progenitor</span>
            <span className="stat-mini__value stat-mini__value--red">{colony.dead}</span>
          </div>
        </div>

        {/* Time distribution */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Distribución Tiempo Conductual
          </div>
          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ width: `${(totalTime.interior/totalAll)*100}%`, background: 'var(--accent-cyan)' }} />
            <div style={{ width: `${(totalTime.border/totalAll)*100}%`, background: 'var(--accent-orange)' }} />
            <div style={{ width: `${(totalTime.searching/totalAll)*100}%`, background: 'var(--accent-purple)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>Interior {((totalTime.interior/totalAll)*100).toFixed(1)}%</span>
            <span style={{ color: 'var(--accent-orange)' }}>Borde {((totalTime.border/totalAll)*100).toFixed(1)}%</span>
            <span style={{ color: 'var(--accent-purple)' }}>Búsqueda {((totalTime.searching/totalAll)*100).toFixed(1)}%</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn--ghost btn--full" onClick={onClose}>
            Ver Modal / Mapa
          </button>
          <button className="btn btn--primary btn--full" onClick={() => {
            if(window.confirm('¿Iniciar nueva simulación? Se aplicarán variaciones.')) {
              onReset();
            }
          }}>
            <RotateCcw size={14} /> Nueva Simulación
          </button>
        </div>
      </div>
    </div>
  );
}
