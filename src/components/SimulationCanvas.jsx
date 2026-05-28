import { useRef, useEffect, useCallback } from 'react';
import { PENGUIN_STATE } from '../simulation/Penguin.js';
import { EGG_STATE } from '../simulation/Egg.js';
import { Wind } from 'lucide-react';

const CELL = 14;
const HALF = CELL / 2;

/**
 * Pre-render penguin sprites to offscreen canvases for performance.
 * Returns a cache object with all sprite variations.
 */
function createSpriteCache() {
  const cache = {};
  const states = ['interior', 'border', 'cold', 'searching', 'withEgg_interior', 'withEgg_border', 'withEgg_cold'];
  
  for (const state of states) {
    const oc = document.createElement('canvas');
    oc.width = CELL;
    oc.height = CELL;
    const ctx = oc.getContext('2d');
    drawPenguinSprite(ctx, state, CELL);
    cache[state] = oc;
  }

  // Egg sprite
  const eggCanvas = document.createElement('canvas');
  eggCanvas.width = CELL;
  eggCanvas.height = CELL;
  const eggCtx = eggCanvas.getContext('2d');
  drawDroppedEggSprite(eggCtx, CELL);
  cache['droppedEgg'] = eggCanvas;

  // Dead penguin
  const deadCanvas = document.createElement('canvas');
  deadCanvas.width = CELL;
  deadCanvas.height = CELL;
  // empty — we skip dead ones
  cache['dead'] = deadCanvas;

  return cache;
}

function drawPenguinSprite(ctx, state, size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  const isSearching = state === 'searching';
  const isCold = state.includes('cold');
  const isBorder = state.includes('border');
  const hasEgg = state.includes('withEgg');

  // === Body (teardrop/oval shape) ===
  ctx.save();
  
  // Body color based on temperature state
  let bodyColor, bellyColor, headColor;
  if (isCold) {
    bodyColor = '#1a3a5c';  // Dark blue-black
    bellyColor = '#4a7a9a'; // Pale cold blue
    headColor = '#0f2840';
  } else if (isBorder) {
    bodyColor = '#1a1a2e';  // Dark charcoal
    bellyColor = '#b8b8c8'; // Light grey belly
    headColor = '#0d0d1a';
  } else {
    bodyColor = '#0d0d14';  // Rich black
    bellyColor = '#e8e0d0'; // Warm cream belly
    headColor = '#050508';
  }

  // Shadow
  ctx.beginPath();
  ctx.ellipse(cx + 0.5, cy + 0.5, r * 0.9, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  // Main body (black outer)
  ctx.beginPath();
  ctx.ellipse(cx, cy - 0.5, r * 0.88, r * 0.95, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyColor;
  ctx.fill();

  // Belly (white/cream inner oval)
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.15, r * 0.5, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = bellyColor;
  ctx.fill();

  // Head (small circle on top)
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.7, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = headColor;
  ctx.fill();

  // Eyes (two tiny white dots)
  const eyeY = cy - r * 0.75;
  const eyeSpacing = r * 0.25;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - eyeSpacing, eyeY, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeSpacing, eyeY, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Beak (tiny orange triangle)
  ctx.fillStyle = '#f0a030';
  ctx.beginPath();
  ctx.moveTo(cx - 1, eyeY + 1.5);
  ctx.lineTo(cx + 1, eyeY + 1.5);
  ctx.lineTo(cx, eyeY + 3);
  ctx.closePath();
  ctx.fill();

  // Orange ear patches (emperor penguin hallmark)
  ctx.fillStyle = 'rgba(240, 180, 40, 0.7)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.45, eyeY + 1.5, 1.2, 1.8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.45, eyeY + 1.5, 1.2, 1.8, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === Egg indicator (golden oval on belly) ===
  if (hasEgg) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.35, 1.8, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 0.4;
    ctx.stroke();
  }

  // === Searching state — orange pulsing ring drawn at render time ===
  if (isSearching) {
    ctx.strokeStyle = '#f8961e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 1.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawDroppedEggSprite(ctx, size) {
  const cx = size / 2;
  const cy = size / 2;

  // Glow
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(248, 150, 30, 0.25)';
  ctx.fill();

  // Egg shape
  ctx.beginPath();
  ctx.ellipse(cx, cy, 2.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f8c060';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

function getSpriteKey(p) {
  const tempState = p.bodyTemp < 32 ? 'cold' : (p.isBorder ? 'border' : 'interior');
  if (p.state === PENGUIN_STATE.SEARCHING_EGG) return 'searching';
  if (p.hasEgg) return `withEgg_${tempState}`;
  return tempState;
}

export default function SimulationCanvas({ simState }) {
  const canvasRef = useRef(null);
  const spriteCacheRef = useRef(null);
  const animFrameRef = useRef(null);

  // Create sprite cache once
  useEffect(() => {
    spriteCacheRef.current = createSpriteCache();
  }, []);

  const draw = useCallback(() => {
    if (!simState || !canvasRef.current || !spriteCacheRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const gs = simState.gridSize;
    const size = gs * CELL;

    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size;
      canvas.height = size;
    }

    const sprites = spriteCacheRef.current;

    // === Background ===
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, size, size);

    // Subtle grid (draw fewer lines for performance)
    ctx.strokeStyle = 'rgba(76, 201, 240, 0.025)';
    ctx.lineWidth = 0.5;
    const gridStep = Math.max(2, Math.floor(gs / 20));
    for (let i = 0; i <= gs; i += gridStep) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(size, i * CELL);
      ctx.stroke();
    }

    // === Wind gradient ===
    if (simState.environment) {
      const angle = simState.environment.windAngle;
      const cx = size / 2, cy = size / 2;
      const windGrad = ctx.createRadialGradient(
        cx + Math.cos(angle) * size * 0.3,
        cy + Math.sin(angle) * size * 0.3,
        0, cx, cy, size * 0.5
      );
      windGrad.addColorStop(0, 'rgba(76, 201, 240, 0.04)');
      windGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = windGrad;
      ctx.fillRect(0, 0, size, size);
    }

    // === Draw dropped eggs ===
    const droppedEggs = simState.droppedEggs || [];
    for (let i = 0; i < droppedEggs.length; i++) {
      const egg = droppedEggs[i];
      if (egg.state === EGG_STATE.EXPOSED) {
        ctx.drawImage(sprites.droppedEgg, egg.x * CELL, egg.y * CELL);
      }
    }

    // === Draw penguins ===
    const penguins = simState.penguins;
    for (let i = 0; i < penguins.length; i++) {
      const p = penguins[i];
      if (p.state === PENGUIN_STATE.DEAD) continue;

      const key = getSpriteKey(p);
      const sprite = sprites[key];
      if (!sprite) continue;

      const px = p.x * CELL;
      const py = p.y * CELL;

      // Alpha based on energy
      const alpha = 0.5 + (p.energy / 100) * 0.5;
      if (alpha < 0.99) {
        ctx.globalAlpha = alpha;
      }

      ctx.drawImage(sprite, px, py);

      // Border glow (subtle cyan outline for border penguins)
      if (p.isBorder) {
        ctx.strokeStyle = 'rgba(76, 201, 240, 0.25)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(px + HALF, py + HALF, CELL * 0.45, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Searching animation (pulsing ring, drawn live for animation)
      if (p.state === PENGUIN_STATE.SEARCHING_EGG) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
        ctx.strokeStyle = `rgba(248, 150, 30, ${pulse})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px + HALF, py + HALF, CELL * 0.55, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    // === Snow particles (reduced count) ===
    const time = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < 20; i++) {
      const sx = ((Math.sin(time + i * 73) * 0.5 + 0.5) * size + time * 10 * (i % 3 + 1)) % size;
      const sy = ((Math.cos(time * 0.7 + i * 37) * 0.5 + 0.5) * size + time * 15 * (i % 2 + 1)) % size;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [simState]);

  useEffect(() => {
    draw();
  }, [draw]);

  const env = simState?.environment;

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
          Estado visual de cada pingüino:
        </div>
        <div className="legend__item" style={{ fontSize: '0.75rem' }}>
          <div className="legend__dot" style={{ background: '#0d0d14', border: '1px solid #555' }} />
          Interior (cálido)
        </div>
        <div className="legend__item" style={{ fontSize: '0.75rem' }}>
          <div className="legend__dot" style={{ background: '#1a1a2e', border: '1px solid rgba(76,201,240,0.4)' }} />
          Borde (expuesto)
        </div>
        <div className="legend__item" style={{ fontSize: '0.75rem' }}>
          <div className="legend__dot" style={{ background: '#1a3a5c' }} />
          Frío Crítico (≤ 32°C)
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
          <div className="legend__dot" style={{ background: 'rgba(248,150,30,0.5)', borderRadius: '50%', border: '1px solid #f8961e' }} />
          Buscando huevo
        </div>
      </div>
    </div>
  );
}
