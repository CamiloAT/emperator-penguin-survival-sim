import { useRef, useEffect } from 'react';
import { PENGUIN_STATE } from '../simulation/Penguin.js';
import { EGG_STATE } from '../simulation/Egg.js';
import { Wind } from 'lucide-react';

const CELL = 14;

function tempToColor(temp) {
  // Rango: Azul (muy frio <= 30) -> Negro/Gris -> Naranja/Amarillo (caliente >= 38)
  const t = Math.max(0, Math.min(1, (temp - 30) / 8));
  // Interpolacion manual simple
  let r, g, b;
  if(t < 0.5) {
    // Azul a Gris oscuro (30 a 34)
    const t2 = t * 2;
    r = Math.round(0 * (1 - t2) + 80 * t2);
    g = Math.round(100 * (1 - t2) + 80 * t2);
    b = Math.round(255 * (1 - t2) + 80 * t2);
  } else {
    // Gris oscuro a Naranja/Amarillo (34 a 38)
    const t2 = (t - 0.5) * 2;
    r = Math.round(80 * (1 - t2) + 255 * t2);
    g = Math.round(80 * (1 - t2) + 170 * t2);
    b = Math.round(80 * (1 - t2) + 0 * t2);
  }
  return `rgb(${r},${g},${b})`;
}

function energyToAlpha(energy) {
  return 0.4 + (energy / 100) * 0.6;
}

export default function SimulationCanvas({ simState }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!simState || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gs = simState.gridSize;
    const size = gs * CELL;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.fillStyle = '#0d1520';
    ctx.fillRect(0, 0, size, size);

    // Grid lines (very subtle)
    ctx.strokeStyle = 'rgba(76, 201, 240, 0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gs; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(size, i * CELL);
      ctx.stroke();
    }

    // Draw wind direction indicator on ground
    if (simState.environment) {
      const angle = simState.environment.windAngle;
      const cx = size / 2, cy = size / 2;
      const windGrad = ctx.createRadialGradient(
        cx + Math.cos(angle) * size * 0.3,
        cy + Math.sin(angle) * size * 0.3,
        0,
        cx, cy, size * 0.5
      );
      windGrad.addColorStop(0, 'rgba(76, 201, 240, 0.06)');
      windGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = windGrad;
      ctx.fillRect(0, 0, size, size);
    }

    // Draw dropped eggs
    for (const egg of (simState.droppedEggs || [])) {
      if (egg.state === EGG_STATE.EXPOSED) {
        const ex = egg.x * CELL + CELL / 2;
        const ey = egg.y * CELL + CELL / 2;
        const progress = egg.exposureProgress;

        // Pulsing glow
        ctx.beginPath();
        ctx.arc(ex, ey, CELL * 0.6, 0, Math.PI * 2);
        const pulseAlpha = 0.3 + Math.sin(Date.now() * 0.005) * 0.2;
        ctx.fillStyle = `rgba(248, 150, 30, ${pulseAlpha})`;
        ctx.fill();

        // Egg shape
        ctx.beginPath();
        ctx.ellipse(ex, ey, 3, 4, 0, 0, Math.PI * 2);
        const eggR = Math.round(248 * (1 - progress) + 200 * progress);
        const eggG = Math.round(150 * (1 - progress) + 60 * progress);
        const eggB = Math.round(30 * (1 - progress) + 60 * progress);
        ctx.fillStyle = `rgb(${eggR},${eggG},${eggB})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // Draw penguins
    for (const p of simState.penguins) {
      if (p.state === PENGUIN_STATE.DEAD) continue;
      const px = p.x * CELL;
      const py = p.y * CELL;
      const alpha = energyToAlpha(p.energy);
      const color = tempToColor(p.bodyTemp);

      // Body
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(px + 1, py + 1, CELL - 2, CELL - 2, 2);
      ctx.fill();

      // Border glow for border penguins
      if (p.isBorder) {
        ctx.strokeStyle = 'rgba(76, 201, 240, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Egg indicator
      if (p.hasEgg) {
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.ellipse(px + CELL / 2, py + CELL / 2 + 2, 2, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Searching state - flashing outline
      if (p.state === PENGUIN_STATE.SEARCHING_EGG) {
        const flash = Math.sin(Date.now() * 0.01) > 0;
        if (flash) {
          ctx.strokeStyle = '#f8961e';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1);
        }
      }

      ctx.globalAlpha = 1;
    }

    // Snow particles effect
    const time = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 30; i++) {
      const sx = ((Math.sin(time + i * 73) * 0.5 + 0.5) * size + time * 10 * (i % 3 + 1)) % size;
      const sy = ((Math.cos(time * 0.7 + i * 37) * 0.5 + 0.5) * size + time * 15 * (i % 2 + 1)) % size;
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [simState]);

  const env = simState?.environment;
  const colony = simState?.colony;

  return (
    <div className="canvas-container">
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', maxHeight: '560px' }} />

        <div className="canvas-overlay">
          {env && (
            <>
              <span className="canvas-overlay__badge" style={{ color: 'var(--accent-cyan)' }}>
                Día {simState.day} — {env.phase.month}
              </span>
              <span className="canvas-overlay__badge" style={{ color: 'var(--accent-orange)' }}>
                {env.temperature.toFixed(1)}°C
              </span>
              <span className="canvas-overlay__badge" style={{ color: 'var(--text-secondary)' }}>
                {env.windSpeed.toFixed(0)} km/h {env.windDirection}
              </span>
            </>
          )}
        </div>

        {env && (
          <div className="wind-compass">
            <Wind
              size={24}
              className="wind-compass__arrow"
              style={{ transform: `rotate(${(env.windAngle * 180 / Math.PI) + 90}deg)` }}
            />
            <span className="wind-compass__label">{env.windSpeed.toFixed(0)} km/h</span>
          </div>
        )}
      </div>

      <div className="legend" style={{ flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
        <div style={{ width: '100%', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          Guía de Temperatura de los Pingüinos:
        </div>
        <div className="legend__item" style={{ fontSize: '0.75rem' }}>
          <div className="legend__dot" style={{ background: 'rgb(0, 100, 255)' }} />
          Frío Extremo (≤ 30°C)
        </div>
        <div className="legend__item" style={{ fontSize: '0.75rem' }}>
          <div className="legend__dot" style={{ background: 'rgb(80, 80, 80)' }} />
          Riesgo (34°C)
        </div>
        <div className="legend__item" style={{ fontSize: '0.75rem' }}>
          <div className="legend__dot" style={{ background: 'rgb(255, 170, 0)' }} />
          Óptimo (≥ 38°C)
        </div>
        
        <div style={{ width: '100%', height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
        
        <div className="legend__item">
          <div className="legend__dot" style={{ background: '#ffd166', borderRadius: '50%' }} />
          Huevo protegido
        </div>
        <div className="legend__item">
          <div className="legend__dot" style={{ background: '#f8961e', boxShadow: '0 0 4px #f8961e', borderRadius: '50%' }} />
          Huevo expuesto
        </div>
        <div className="legend__item">
          <div className="legend__dot" style={{ background: 'rgba(255,255,255,0.2)' }} />
          Nieve
        </div>
      </div>
    </div>
  );
}
