import { X, Check } from 'lucide-react';

const COLOR_OPTIONS = [
  { name: 'Naranja Vivo', value: '#ff8800' },
  { name: 'Rojo Carmesí', value: '#ff0000' },
  { name: 'Cian Neón', value: '#00ffff' },
  { name: 'Verde Esmeralda', value: '#00ffaa' },
  { name: 'Morado Galáctico', value: '#cc00ff' },
  { name: 'Amarillo Eléctrico', value: '#ffcc00' },
  { name: 'Rosa Chicle', value: '#ff66b2' },
];

export default function ColorSettingsModal({ isOpen, onClose, config, setConfig }) {
  if (!isOpen) return null;

  const handleColorChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="results-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="results-card" style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', textAlign: 'left' }}>Personalizar Colores</h2>
          <button className="btn btn--ghost" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Color de Huevo (Cargado y Suelo)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={`egg-${c.value}`}
                title={c.name}
                onClick={() => handleColorChange('eggColor', c.value)}
                style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: c.value,
                  border: config.eggColor === c.value ? '3px solid white' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: config.eggColor === c.value ? `0 0 12px ${c.value}` : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {config.eggColor === c.value && <Check size={16} color="black" />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Color de Alerta (Buscando Huevo)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={`search-${c.value}`}
                title={c.name}
                onClick={() => handleColorChange('searchColor', c.value)}
                style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: c.value,
                  border: config.searchColor === c.value ? '3px solid white' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: config.searchColor === c.value ? `0 0 12px ${c.value}` : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {config.searchColor === c.value && <Check size={16} color="black" />}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn--primary btn--full" onClick={onClose}>
          Listo
        </button>
      </div>
    </div>
  );
}
