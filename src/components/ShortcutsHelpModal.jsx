import React from 'react';
import { useHotkey } from '@tanstack/react-hotkeys';
import { X, Keyboard, Settings, Palette, UserRound, RefreshCw, Play, Layers, Sun, Snowflake, Pause, FastForward, Square, BarChart2, HelpCircle } from 'lucide-react';

function Kbd({ children }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      background: 'rgba(20, 28, 48, 0.85)',
      border: '1px solid var(--border-glow, rgba(120, 180, 255, 0.45))',
      borderBottomWidth: '2px',
      borderRadius: '6px',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.72rem',
      fontWeight: 700,
      color: 'var(--accent-cyan)',
      letterSpacing: '0.03em',
      minWidth: '22px',
      textAlign: 'center',
      lineHeight: 1.4,
      boxShadow: '0 1px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      {children}
    </span>
  );
}

function Combo({ keys }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          <Kbd>{k}</Kbd>
          {i < keys.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>+</span>}
        </React.Fragment>
      ))}
    </span>
  );
}

function Row({ icon: Icon, keys, label, hint }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '24px 1fr auto',
      gap: '0.75rem',
      alignItems: 'center',
      padding: '0.55rem 0.75rem',
      borderRadius: 'var(--radius-md, 8px)',
      background: 'rgba(20, 20, 35, 0.35)',
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }}>
        {Icon && <Icon size={15} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600 }}>{label}</span>
        {hint && <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{hint}</span>}
      </div>
      <Combo keys={keys} />
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        fontWeight: 700,
        color: color || 'var(--accent-cyan)',
        marginBottom: '0.5rem',
        paddingLeft: '0.25rem',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {children}
      </div>
    </div>
  );
}

export default function ShortcutsHelpModal({ isOpen, onClose }) {
  useHotkey('Escape', () => onClose(), { enabled: isOpen });

  if (!isOpen) return null;

  return (
    <div className="results-overlay" onClick={onClose} style={{ zIndex: 200 }}>
      <div
        className="results-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'left',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(0, 220, 255, 0.13)',
              color: 'var(--accent-cyan)',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Keyboard size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', textAlign: 'left' }}>Atajos de Teclado</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Controla la simulación sin usar el ratón
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
            aria-label="Cerrar"
            title="Cerrar (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>

          <Section title="Panel de Parámetros" color="var(--accent-cyan)">
            <Row icon={Settings} keys={['Shift', 'A']} label="Parámetros Avanzados" hint="Abre el modal de configuración avanzada" />
            <Row icon={Palette} keys={['Shift', 'C']} label="Personalizar Colores" hint="Color de huevo y de búsqueda" />
            <Row icon={UserRound} keys={['Shift', 'P']} label="Cambiar Pingüino" hint="Solo disponible en vista 3D" />
            <Row icon={RefreshCw} keys={['Shift', 'R']} label="Restaurar Por Defecto" hint="Vuelve a los valores iniciales" />
            <Row icon={Play} keys={['Shift', 'Enter']} label="Iniciar Simulación" hint="Lanza la simulación con la configuración actual" />
          </Section>

          <Section title="Vista" color="var(--accent-orange)">
            <Row icon={Layers} keys={['V']} label="Alternar 2D / 3D" hint="Cambia entre el canvas 2D y la escena 3D" />
            <Row icon={Sun} keys={['T']} label="Ciclar Día → Atardecer → Noche" hint="Solo en vista 3D" />
            <Row icon={Snowflake} keys={['N']} label="Activar / Desactivar Nieve" hint="Solo en vista 3D" />
          </Section>

          <Section title="Panel de Simulación" color="var(--accent-green)">
            <Row icon={Pause} keys={['Space']} label="Pausar / Reanudar" />
            <Row icon={FastForward} keys={['9']} label="Aumentar Velocidad" hint="+10 pasos/tick" />
            <Row icon={FastForward} keys={['8']} label="Disminuir Velocidad" hint="−10 pasos/tick" />
            <Row icon={Square} keys={['E']} label="Terminar Simulación" hint="Fuerza el final y muestra resultados" />
            <Row icon={BarChart2} keys={['S']} label="Estadísticas Avanzadas" hint="Abre/cierra el panel de gráficas detalladas" />
          </Section>

          <Section title="Globales" color="var(--accent-purple)">
            <Row icon={HelpCircle} keys={['?']} label="Mostrar esta ayuda" hint="Shift + '" />
            <Row icon={X} keys={['Esc']} label="Cerrar modal activo" hint="Funciona en cualquier modal" />
          </Section>

          <div style={{
            marginTop: '0.5rem',
            padding: '0.7rem 0.85rem',
            background: 'rgba(255, 200, 70, 0.07)',
            border: '1px solid rgba(255, 200, 70, 0.25)',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            <strong style={{ color: 'var(--accent-yellow, #ffcc33)' }}>Tip:</strong>{' '}
            Los atajos de tecla simple (<Kbd>V</Kbd> <Kbd>T</Kbd> <Kbd>N</Kbd> <Kbd>S</Kbd> <Kbd>E</Kbd> <Kbd>8</Kbd> <Kbd>9</Kbd>)
            se ignoran mientras estás escribiendo en un campo de texto, para no interferir.
            Los que usan <Kbd>Shift</Kbd> funcionan en cualquier contexto.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
          <button className="btn btn--primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
