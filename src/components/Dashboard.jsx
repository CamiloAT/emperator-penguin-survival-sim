import { 
  Heart, Egg, Thermometer, Zap, Shield, AlertTriangle, 
  Activity, Clock, TrendingDown 
} from 'lucide-react';
import { PHASE_LIST } from '../simulation/constants.js';

export default function Dashboard({ simState }) {
  if (!simState || !simState.environment) {
    return (
      <div className="card">
        <div className="no-data">
          <Activity size={24} />
          <span>Configura e inicia la simulación</span>
        </div>
      </div>
    );
  }

  const { colony, eggs, environment } = simState;
  const phase = environment.phase;
  const currentPhaseList = environment.phaseList || PHASE_LIST;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Phase Indicator */}
      <div className="card">
        <div className="card__header">
          <Clock size={16} className="card__header-icon" />
          <span className="card__title">Fase del Invierno</span>
        </div>
        <div className="phase-label">
          <span className="phase-label__name">{phase.name}</span>
          <span className="phase-label__month">{phase.month}</span>
        </div>
        <div className="phase-indicator">
          {currentPhaseList.map((p, i) => {
            let fill = 0;
            if (i < environment.phaseIndex) fill = 100;
            else if (i === environment.phaseIndex) fill = environment.phaseProgress * 100;
            return (
              <div key={i} className={`phase-step phase-step--${i}`}>
                <div className="phase-step__fill" style={{ width: `${fill}%` }} />
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {phase.description}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
          Progreso total: {(environment.totalProgress * 100).toFixed(1)}%
        </div>
      </div>

      {/* Survival Stats */}
      <div className="card">
        <div className="card__header">
          <Heart size={16} className="card__header-icon" />
          <span className="card__title">Supervivencia</span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">
            <Shield size={12} /> Pingüinos Vivos
          </span>
          <span className="stat-mini__value stat-mini__value--green">
            {colony.alive}/{colony.total}
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">
            <TrendingDown size={12} /> Fallecidos
          </span>
          <span className="stat-mini__value stat-mini__value--red">
            {colony.dead}
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">
            <Heart size={12} /> Tasa Supervivencia
          </span>
          <span className={`stat-mini__value ${colony.survivalRate > 80 ? 'stat-mini__value--green' : colony.survivalRate > 50 ? 'stat-mini__value--yellow' : 'stat-mini__value--red'}`}>
            {colony.survivalRate.toFixed(1)}%
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">
            <Thermometer size={12} /> Temp. Promedio
          </span>
          <span className={`stat-mini__value ${colony.avgTemp > 35 ? 'stat-mini__value--green' : colony.avgTemp > 32 ? 'stat-mini__value--yellow' : 'stat-mini__value--red'}`}>
            {colony.avgTemp.toFixed(1)}°C
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">
            <Zap size={12} /> Energía Promedio
          </span>
          <span className={`stat-mini__value ${colony.avgEnergy > 50 ? 'stat-mini__value--green' : colony.avgEnergy > 25 ? 'stat-mini__value--orange' : 'stat-mini__value--red'}`}>
            {colony.avgEnergy.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Huddle Distribution */}
      <div className="card">
        <div className="card__header">
          <Activity size={16} className="card__header-icon" />
          <span className="card__title">Distribución Huddle</span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">Interior (protegidos)</span>
          <span className="stat-mini__value stat-mini__value--cyan">
            {colony.interiorCount}
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">Borde (expuestos)</span>
          <span className="stat-mini__value stat-mini__value--orange">
            {colony.borderCount}
          </span>
        </div>

        {colony.alive > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
              <div style={{
                width: `${(colony.interiorCount / colony.alive) * 100}%`,
                background: 'var(--accent-cyan)',
                transition: 'width 0.3s ease'
              }} />
              <div style={{
                width: `${(colony.borderCount / colony.alive) * 100}%`,
                background: 'var(--accent-orange)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Egg Status */}
      <div className="card">
        <div className="card__header">
          <Egg size={16} className="card__header-icon" />
          <span className="card__title">Estado de Huevos</span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">Huevos Viables</span>
          <span className="stat-mini__value stat-mini__value--green">
            {eggs.viable}
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">
            <AlertTriangle size={12} /> En el Hielo
          </span>
          <span className={`stat-mini__value ${eggs.dropped > 0 ? 'stat-mini__value--orange pulse' : 'stat-mini__value--cyan'}`}>
            {eggs.dropped}
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">Congelados</span>
          <span className="stat-mini__value stat-mini__value--red">
            {eggs.frozen}
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">Recuperados</span>
          <span className="stat-mini__value stat-mini__value--green">
            {eggs.recovered}
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">Total Desprendidos</span>
          <span className="stat-mini__value stat-mini__value--yellow">
            {eggs.totalDropped}
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">Eficiencia Rescate</span>
          <span className={`stat-mini__value ${eggs.rescueEfficiency > 70 ? 'stat-mini__value--green' : 'stat-mini__value--red'}`}>
            {eggs.rescueEfficiency.toFixed(1)}%
          </span>
        </div>

        <div className="stat-mini">
          <span className="stat-mini__label">Tasa Éxito Incubación</span>
          <span className={`stat-mini__value ${colony.eggSurvivalRate > 80 ? 'stat-mini__value--green' : colony.eggSurvivalRate > 50 ? 'stat-mini__value--yellow' : 'stat-mini__value--red'}`}>
            {colony.eggSurvivalRate.toFixed(1)}%
          </span>
        </div>
      </div>

    </div>
  );
}
