import { useState } from 'react';
import { useHotkey } from '@tanstack/react-hotkeys';
import { X, Save, RotateCcw, Activity, Shield, Egg, CloudSnow, Square } from 'lucide-react';
import { DEFAULT_CONFIG } from '../App.jsx';

export default function SettingsModal({ isOpen, onClose, config, onSave, onForceEnd }) {
  const [localConfig, setLocalConfig] = useState({ ...config });
  const [activeTab, setActiveTab] = useState('physiology');
  useHotkey('Escape', () => onClose(), { enabled: isOpen });

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const handleResetDefaults = () => {
    setLocalConfig({ ...DEFAULT_CONFIG });
  };

  const handleForceEnd = () => {
    if (onForceEnd) onForceEnd();
    onClose();
  };

  const tabs = [
    { id: 'physiology', name: 'Fisiología', icon: <Shield size={14} /> },
    { id: 'thermodynamics', name: 'Termodinámica', icon: <Activity size={14} /> },
    { id: 'eggs', name: 'Huevos', icon: <Egg size={14} /> },
    { id: 'phases', name: 'Fases Climáticas', icon: <CloudSnow size={14} /> }
  ];

  return (
    <div className="results-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="results-card" style={{
        maxWidth: '750px',
        width: '95%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', textAlign: 'left' }}>Ajustes y Parámetros de Simulación</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? 'btn--primary' : 'btn--ghost'}`}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : 'none'
              }}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.25rem' }}>

          {/* TAB 1: PHYSIOLOGY */}
          {activeTab === 'physiology' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Fisiología y Metabolismo del Pingüino
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="control-group">
                  <label>
                    Umbral de Hipotermia
                    <span className="control-value">{localConfig.hypothermiaTemp}°C</span>
                  </label>
                  <input type="range" min="20" max="35" step="0.5" value={localConfig.hypothermiaTemp}
                    onChange={e => handleChange('hypothermiaTemp', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Temp. corporal a la cual el pingüino muere instantáneamente.</span>
                </div>

                <div className="control-group">
                  <label>
                    Capacidad Máx. Termogénesis
                    <span className="control-value">{localConfig.maxThermogenesis}</span>
                  </label>
                  <input type="range" min="0.005" max="0.05" step="0.001" value={localConfig.maxThermogenesis}
                    onChange={e => handleChange('maxThermogenesis', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Calor máximo por minuto que el pingüino genera quemando grasa.</span>
                </div>

                <div className="control-group">
                  <label>
                    Costo Energético Termogénesis
                    <span className="control-value">{localConfig.thermogenesisEnergyFactor}</span>
                  </label>
                  <input type="range" min="0.005" max="0.1" step="0.005" value={localConfig.thermogenesisEnergyFactor}
                    onChange={e => handleChange('thermogenesisEnergyFactor', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Multiplicador del consumo de grasa por grado de calor generado.</span>
                </div>

                <div className="control-group">
                  <label>
                    Consumo Energía Base (Interior)
                    <span className="control-value">{localConfig.energyDecayBase}</span>
                  </label>
                  <input type="range" min="0.00002" max="0.0005" step="0.00002" value={localConfig.energyDecayBase}
                    onChange={e => handleChange('energyDecayBase', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Gasto de lípidos por paso en el centro protegido del huddle.</span>
                </div>

                <div className="control-group">
                  <label>
                    Consumo Energía Borde
                    <span className="control-value">{localConfig.energyDecayBorder}</span>
                  </label>
                  <input type="range" min="0.0001" max="0.002" step="0.0001" value={localConfig.energyDecayBorder}
                    onChange={e => handleChange('energyDecayBorder', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Gasto de lípidos base por paso al estar expuesto en el borde.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THERMODYNAMICS */}
          {activeTab === 'thermodynamics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Termodinámica e Intercambio de Calor
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="control-group">
                  <label>
                    Tasa de Transferencia de Calor
                    <span className="control-value">{localConfig.heatTransferRate}</span>
                  </label>
                  <input type="range" min="0.01" max="0.5" step="0.01" value={localConfig.heatTransferRate}
                    onChange={e => handleChange('heatTransferRate', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Velocidad a la cual se comparte el calor corporal entre vecinos directos.</span>
                </div>

                <div className="control-group">
                  <label>
                    Pérdida Calor Base (Borde)
                    <span className="control-value">{localConfig.heatLossBorderBase}</span>
                  </label>
                  <input type="range" min="0.0005" max="0.01" step="0.0005" value={localConfig.heatLossBorderBase}
                    onChange={e => handleChange('heatLossBorderBase', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tasa de enfriamiento base por paso para pingüinos del borde.</span>
                </div>

                <div className="control-group">
                  <label>
                    Pérdida Calor Interior
                    <span className="control-value">{localConfig.heatLossInterior}</span>
                  </label>
                  <input type="range" min="0.00005" max="0.001" step="0.00005" value={localConfig.heatLossInterior}
                    onChange={e => handleChange('heatLossInterior', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tasa de enfriamiento base por paso para pingüinos protegidos.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EGGS */}
          {activeTab === 'eggs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Física del Huevo y Reglas de Pérdida
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="control-group">
                  <label>
                    P. Pérdida Huevo Borde
                    <span className="control-value">{(localConfig.eggLossProbBorder * 100).toFixed(1)}%</span>
                  </label>
                  <input type="range" min="0.005" max="0.1" step="0.005" value={localConfig.eggLossProbBorder}
                    onChange={e => handleChange('eggLossProbBorder', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Probabilidad estocástica de perder el huevo por movimiento al estar en el borde exterior.</span>
                </div>

                <div className="control-group">
                  <label>
                    Temperatura Incubación Huevo
                    <span className="control-value">{localConfig.eggIncubationTemp}°C</span>
                  </label>
                  <input type="range" min="30" max="40" step="0.5" value={localConfig.eggIncubationTemp}
                    onChange={e => handleChange('eggIncubationTemp', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Temperatura ideal que el huevo mantiene en la bolsa protectora.</span>
                </div>

                <div className="control-group">
                  <label>
                    Tiempo Límite de Búsqueda
                    <span className="control-value">{localConfig.eggSearchTimeLimit} seg.</span>
                  </label>
                  <input type="range" min="60" max="300" step="10" value={localConfig.eggSearchTimeLimit}
                    onChange={e => handleChange('eggSearchTimeLimit', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tiempo límite (en seg./pasos) que tiene el padre para recuperar el huevo en el hielo.</span>
                </div>

                <div className="control-group">
                  <label>
                    Tamaño Grilla (Mallas NxN)
                    <span className="control-value">{localConfig.gridSize} celdas</span>
                  </label>
                  <input type="range" min="20" max="60" step="5" value={localConfig.gridSize}
                    onChange={e => handleChange('gridSize', +e.target.value)} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tamaño del mapa de la simulación. Cambiarlo reiniciará las posiciones.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHASES (CLIMATE) */}
          {activeTab === 'phases' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', margin: 0, textTransform: 'uppercase' }}>
                Configuración del Clima por Fase de Invierno
              </h3>

              {/* Phase 0 */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', margin: '0 0 0.5rem 0' }}>Fase 1: Inicio de Incubación (Junio)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="control-group">
                    <label>Duración (Días)<span className="control-value">{localConfig.phase0Duration}d</span></label>
                    <input type="range" min="10" max="60" value={localConfig.phase0Duration} onChange={e => handleChange('phase0Duration', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Temperatura Mín (°C)<span className="control-value">{localConfig.phase0TempMax}°C</span></label>
                    <input type="range" min="-65" max="-10" value={localConfig.phase0TempMax} onChange={e => handleChange('phase0TempMax', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Temperatura Máx (°C)<span className="control-value">{localConfig.phase0TempMin}°C</span></label>
                    <input type="range" min="-45" max="-5" value={localConfig.phase0TempMin} onChange={e => handleChange('phase0TempMin', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Viento Mín (km/h)<span className="control-value">{localConfig.phase0WindMin}</span></label>
                    <input type="range" min="10" max="100" value={localConfig.phase0WindMin} onChange={e => handleChange('phase0WindMin', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Viento Máx (km/h)<span className="control-value">{localConfig.phase0WindMax}</span></label>
                    <input type="range" min="30" max="150" value={localConfig.phase0WindMax} onChange={e => handleChange('phase0WindMax', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Mult. Consumo Energía<span className="control-value">{localConfig.phase0EnergyMultiplier}x</span></label>
                    <input type="range" min="0.5" max="3" step="0.1" value={localConfig.phase0EnergyMultiplier} onChange={e => handleChange('phase0EnergyMultiplier', +e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Phase 1 */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', margin: '0 0 0.5rem 0' }}>Fase 2: Invierno Profundo (Julio)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="control-group">
                    <label>Duración (Días)<span className="control-value">{localConfig.phase1Duration}d</span></label>
                    <input type="range" min="10" max="60" value={localConfig.phase1Duration} onChange={e => handleChange('phase1Duration', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Temperatura Mín (°C)<span className="control-value">{localConfig.phase1TempMax}°C</span></label>
                    <input type="range" min="-75" max="-20" value={localConfig.phase1TempMax} onChange={e => handleChange('phase1TempMax', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Temperatura Máx (°C)<span className="control-value">{localConfig.phase1TempMin}°C</span></label>
                    <input type="range" min="-50" max="-10" value={localConfig.phase1TempMin} onChange={e => handleChange('phase1TempMin', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Viento Mín (km/h)<span className="control-value">{localConfig.phase1WindMin}</span></label>
                    <input type="range" min="20" max="120" value={localConfig.phase1WindMin} onChange={e => handleChange('phase1WindMin', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Viento Máx (km/h)<span className="control-value">{localConfig.phase1WindMax}</span></label>
                    <input type="range" min="50" max="250" value={localConfig.phase1WindMax} onChange={e => handleChange('phase1WindMax', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Mult. Consumo Energía<span className="control-value">{localConfig.phase1EnergyMultiplier}x</span></label>
                    <input type="range" min="0.5" max="4" step="0.1" value={localConfig.phase1EnergyMultiplier} onChange={e => handleChange('phase1EnergyMultiplier', +e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Phase 2 */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-green)', margin: '0 0 0.5rem 0' }}>Fase 3: Pre-Eclosión (Agosto)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="control-group">
                    <label>Duración (Días)<span className="control-value">{localConfig.phase2Duration}d</span></label>
                    <input type="range" min="10" max="60" value={localConfig.phase2Duration} onChange={e => handleChange('phase2Duration', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Temperatura Mín (°C)<span className="control-value">{localConfig.phase2TempMax}°C</span></label>
                    <input type="range" min="-50" max="-10" value={localConfig.phase2TempMax} onChange={e => handleChange('phase2TempMax', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Temperatura Máx (°C)<span className="control-value">{localConfig.phase2TempMin}°C</span></label>
                    <input type="range" min="-30" max="-5" value={localConfig.phase2TempMin} onChange={e => handleChange('phase2TempMin', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Viento Mín (km/h)<span className="control-value">{localConfig.phase2WindMin}</span></label>
                    <input type="range" min="10" max="80" value={localConfig.phase2WindMin} onChange={e => handleChange('phase2WindMin', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Viento Máx (km/h)<span className="control-value">{localConfig.phase2WindMax}</span></label>
                    <input type="range" min="20" max="120" value={localConfig.phase2WindMax} onChange={e => handleChange('phase2WindMax', +e.target.value)} />
                  </div>
                  <div className="control-group">
                    <label>Mult. Consumo Energía<span className="control-value">{localConfig.phase2EnergyMultiplier}x</span></label>
                    <input type="range" min="0.5" max="3" step="0.1" value={localConfig.phase2EnergyMultiplier} onChange={e => handleChange('phase2EnergyMultiplier', +e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Info label */}
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', textAlign: 'center' }}>
          ⚠️ Guardar los cambios aplicará el nuevo modelo biológico e iniciará una nueva simulación con estos parámetros.
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn--ghost btn--sm" onClick={handleResetDefaults} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RotateCcw size={13} /> Por Defecto
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancelar</button>
            <button className="btn btn--primary btn--sm" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={14} /> Guardar y Aplicar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
