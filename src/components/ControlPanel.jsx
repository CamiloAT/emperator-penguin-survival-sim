import { Settings, Users, Thermometer, Zap, Egg, Play, Pause, RotateCcw, FastForward } from 'lucide-react';

export default function ControlPanel({ config, setConfig, running, onStart, onPause, onReset, onSpeedChange, speed, finished }) {
  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div className="card__header">
        <Settings size={16} className="card__header-icon" />
        <span className="card__title">Parámetros de Entrada</span>
      </div>

      <div className="control-group">
        <label>
          <Users size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Colonia (N)
          <span className="control-value">{config.colonySize}</span>
        </label>
        <input type="range" min="20" max="200" step="5" value={config.colonySize}
          onChange={e => handleChange('colonySize', +e.target.value)}
          disabled={running} />
      </div>

      <div className="control-group">
        <label>
          <Thermometer size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Temp. Corporal Inicial
          <span className="control-value">{config.bodyTemp}°C</span>
        </label>
        <input type="range" min="35" max="40" step="0.5" value={config.bodyTemp}
          onChange={e => handleChange('bodyTemp', +e.target.value)}
          disabled={running} />
      </div>

      <div className="control-group">
        <label>
          <Zap size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Energía Inicial
          <span className="control-value">{config.energy}%</span>
        </label>
        <input type="range" min="50" max="100" step="5" value={config.energy}
          onChange={e => handleChange('energy', +e.target.value)}
          disabled={running} />
      </div>

      <div className="control-group">
        <label>
          <Egg size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          P. Pérdida Huevo (%)
          <span className="control-value">{(config.eggLossProb * 100).toFixed(1)}%</span>
        </label>
        <input type="range" min="0.001" max="0.05" step="0.001" value={config.eggLossProb}
          onChange={e => handleChange('eggLossProb', +e.target.value)}
          disabled={running} />
      </div>

      <div className="control-group">
        <label>
          Umbral Crítico Temp.
          <span className="control-value">{config.criticalTemp}°C</span>
        </label>
        <input type="range" min="30" max="37" step="0.5" value={config.criticalTemp}
          onChange={e => handleChange('criticalTemp', +e.target.value)}
          disabled={running} />
      </div>

      <div className="control-group">
        <label>
          Radio Búsqueda Huevo
          <span className="control-value">{config.searchRadius} celdas</span>
        </label>
        <input type="range" min="1" max="5" step="1" value={config.searchRadius}
          onChange={e => handleChange('searchRadius', +e.target.value)}
          disabled={running} />
      </div>

      {/* Speed control */}
      <div className="control-group" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <FastForward size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Velocidad de Simulación ({speed} pasos/tick)
        </label>
        <div className="speed-control" style={{ marginTop: '0.35rem' }}>
          <input 
            type="range" 
            min="1" 
            max="1200" 
            step="10" 
            value={speed}
            onChange={e => onSpeedChange(+e.target.value)} 
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="btn-group" style={{ marginTop: 'auto' }}>
        {!running ? (
          <button className="btn btn--primary btn--full" onClick={onStart} disabled={finished}>
            <Play size={14} /> {finished ? 'Finalizado' : 'Iniciar'}
          </button>
        ) : (
          <button className="btn btn--ghost btn--full" onClick={onPause}>
            <Pause size={14} /> Pausar
          </button>
        )}
        <button className="btn btn--danger btn--sm" onClick={onReset}>
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
