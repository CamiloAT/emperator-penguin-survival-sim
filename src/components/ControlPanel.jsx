import { Settings, Users, Thermometer, Zap, Egg, Play, Pause, RotateCcw, FastForward, Square, RefreshCw, Award, Palette, Monitor, UserRound } from 'lucide-react';

export default function ControlPanel({ config, setConfig, running, onStart, onPause, onReset, onSpeedChange, speed, finished, onOpenSettings, onOpenColors, onOpenCharacterSelect, onResetDefaults, onForceEnd, onShowResults, viewMode }) {
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



      {/* Action buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>

        {/* Advanced settings */}
        <button
          type="button"
          className="btn btn--ghost btn--full"
          onClick={onOpenSettings}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
        >
          <Settings size={14} /> Parámetros Avanzados
        </button>

        <button
          type="button"
          className="btn btn--ghost btn--full"
          onClick={onOpenColors}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
        >
          <Palette size={14} /> Personalizar Colores
        </button>

        <button
          type="button"
          className="btn btn--ghost btn--full"
          onClick={onOpenCharacterSelect}
          disabled={viewMode === '2d'}
          title={viewMode === '2d' ? 'Cambia a vista 3D para seleccionar el modelo de pingüino' : ''}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', opacity: viewMode === '2d' ? 0.4 : 1 }}
        >
          <UserRound size={14} /> Seleccionar Pingüino
        </button>

        {/* Reset to defaults */}
        <button
          type="button"
          className="btn btn--ghost btn--full"
          onClick={onResetDefaults}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontSize: '0.72rem' }}
        >
          <RefreshCw size={13} /> Restaurar Por Defecto
        </button>

        <button className="btn btn--primary btn--full" onClick={onStart} style={{ marginTop: '0.5rem' }}>
          <Play size={14} /> Iniciar Simulación
        </button>
      </div>
    </div>
  );
}
