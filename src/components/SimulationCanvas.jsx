import { useRef, useEffect, useCallback } from 'react';
import { PENGUIN_STATE } from '../simulation/Penguin.js';
import { EGG_STATE } from '../simulation/Egg.js';
import { Wind } from 'lucide-react';

const CELL = 32;
const HALF = CELL / 2;

/**
 * Draw a detailed emperor penguin sprite at the given cell size.
 * Designed for ~32px so features are clearly visible.
 */
function drawPenguinSprite(ctx, state, size) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size / 32; // scale factor relative to 32px base

  const isSearching = state === 'searching';
  const isCold = state.includes('cold');
  const isBorder = state.includes('border');
  const hasEgg = state.includes('withEgg');

  let bodyColor, bellyColor, headColor, earPatch, flipperColor;
  if (isCold) {
    bodyColor = '#1a3a5c';
    bellyColor = '#6a9ab8';
    headColor = '#0f2840';
    earPatch = 'rgba(160, 140, 80, 0.7)';
    flipperColor = '#14304a';
  } else if (isBorder) {
    bodyColor = '#1c1c30';
    bellyColor = '#c8c8d8';
    headColor = '#111122';
    earPatch = 'rgba(240, 190, 60, 0.8)';
    flipperColor = '#16162a';
  } else {
    bodyColor = '#0e0e18';
    bellyColor = '#f0e8d8';
    headColor = '#08080f';
    earPatch = 'rgba(255, 200, 50, 0.9)';
    flipperColor = '#0a0a14';
  }

  ctx.save();

  // === Drop shadow ===
  ctx.beginPath();
  ctx.ellipse(cx + 1 * s, cy + 12 * s, 8 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  // === Flippers (behind body) ===
  // Left flipper
  ctx.beginPath();
  ctx.ellipse(cx - 8.5 * s, cy + 2 * s, 3 * s, 8 * s, 0.15, 0, Math.PI * 2);
  ctx.fillStyle = flipperColor;
  ctx.fill();
  // Right flipper
  ctx.beginPath();
  ctx.ellipse(cx + 8.5 * s, cy + 2 * s, 3 * s, 8 * s, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = flipperColor;
  ctx.fill();

  // === Main body (black outer oval) ===
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2 * s, 9 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyColor;
  ctx.fill();

  // === White belly (inner oval) ===
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4 * s, 5.5 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = bellyColor;
  ctx.fill();

  // === Head (circle on top) ===
  ctx.beginPath();
  ctx.arc(cx, cy - 9 * s, 6.5 * s, 0, Math.PI * 2);
  ctx.fillStyle = headColor;
  ctx.fill();

  // === Yellow/orange ear patches (emperor hallmark) ===
  // Left patch
  ctx.beginPath();
  ctx.ellipse(cx - 5 * s, cy - 7 * s, 2.5 * s, 4 * s, -0.25, 0, Math.PI * 2);
  ctx.fillStyle = earPatch;
  ctx.fill();
  // Right patch
  ctx.beginPath();
  ctx.ellipse(cx + 5 * s, cy - 7 * s, 2.5 * s, 4 * s, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = earPatch;
  ctx.fill();

  // === Yellow chest gradient (emperor penguin upper chest) ===
  const chestGrad = ctx.createLinearGradient(cx, cy - 4 * s, cx, cy + 2 * s);
  chestGrad.addColorStop(0, 'rgba(255, 210, 80, 0.5)');
  chestGrad.addColorStop(1, 'rgba(255, 210, 80, 0)');
  ctx.beginPath();
  ctx.ellipse(cx, cy - 1 * s, 5 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = chestGrad;
  ctx.fill();

  // === Eyes ===
  const eyeY = cy - 10 * s;
  const eyeSpacing = 3 * s;
  // White part
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - eyeSpacing, eyeY, 1.4 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeSpacing, eyeY, 1.4 * s, 0, Math.PI * 2);
  ctx.fill();
  // Pupil
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx - eyeSpacing, eyeY, 0.7 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeSpacing, eyeY, 0.7 * s, 0, Math.PI * 2);
  ctx.fill();

  // === Beak (orange-yellow, two triangles) ===
  ctx.fillStyle = '#e89020';
  ctx.beginPath();
  ctx.moveTo(cx - 2 * s, cy - 7.5 * s);
  ctx.lineTo(cx + 2 * s, cy - 7.5 * s);
  ctx.lineTo(cx, cy - 4.5 * s);
  ctx.closePath();
  ctx.fill();
  // Beak highlight
  ctx.fillStyle = '#f8b040';
  ctx.beginPath();
  ctx.moveTo(cx - 1 * s, cy - 7.5 * s);
  ctx.lineTo(cx + 1 * s, cy - 7.5 * s);
  ctx.lineTo(cx, cy - 5.5 * s);
  ctx.closePath();
  ctx.fill();

  // === Feet (orange) ===
  ctx.fillStyle = '#d08030';
  ctx.beginPath();
  ctx.ellipse(cx - 3 * s, cy + 13 * s, 2.5 * s, 1.2 * s, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 3 * s, cy + 13 * s, 2.5 * s, 1.2 * s, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // === Egg on belly ===
  if (hasEgg) {
    // Egg glow
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6 * s, 5 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 245, 255, 0.4)';
    ctx.fill();
    // Egg shape
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6 * s, 3 * s, 4 * s, 0, 0, Math.PI * 2);
    const eggGrad = ctx.createRadialGradient(cx - 1 * s, cy + 5 * s, 0, cx, cy + 6 * s, 4 * s);
    eggGrad.addColorStop(0, '#ffffff');
    eggGrad.addColorStop(0.5, '#00f5ff'); // Bright neon cyan
    eggGrad.addColorStop(1, '#0088aa');
    ctx.fillStyle = eggGrad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8 * s;
    ctx.stroke();
  }

  // === Searching ring ===
  if (isSearching) {
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 15 * s, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawDroppedEggSprite(ctx, size) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size / 32;

  // Glow on ice
  ctx.beginPath();
  ctx.arc(cx, cy, 11 * s, 0, Math.PI * 2);
  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 11 * s);
  glowGrad.addColorStop(0, 'rgba(255, 0, 85, 0.5)'); // vibrant pink/magenta
  glowGrad.addColorStop(1, 'rgba(255, 0, 85, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fill();

  // Shadow
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4 * s, 4 * s, 1.5 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();

  // Egg shape
  ctx.beginPath();
  ctx.ellipse(cx, cy, 4 * s, 5.5 * s, 0, 0, Math.PI * 2);
  const eggGrad = ctx.createRadialGradient(cx - 1 * s, cy - 2 * s, 0, cx, cy, 6 * s);
  eggGrad.addColorStop(0, '#ffffff');
  eggGrad.addColorStop(0.4, '#ff0055');
  eggGrad.addColorStop(1, '#aa0033');
  ctx.fillStyle = eggGrad;
  ctx.fill();

  // Highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 0.8 * s;
  ctx.stroke();

  // Specular highlight
  ctx.beginPath();
  ctx.ellipse(cx - 1 * s, cy - 2 * s, 1.5 * s, 2 * s, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();
}

/**
 * Pre-render penguin sprites to offscreen canvases for performance.
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

  // Dead penguin (empty)
  const deadCanvas = document.createElement('canvas');
  deadCanvas.width = CELL;
  deadCanvas.height = CELL;
  cache['dead'] = deadCanvas;

  return cache;
}

function getSpriteKey(p) {
  const tempState = p.bodyTemp < 32 ? 'cold' : (p.isBorder ? 'border' : 'interior');
  if (p.state === PENGUIN_STATE.SEARCHING_EGG) return 'searching';
  if (p.hasEgg) return `withEgg_${tempState}`;
  return tempState;
}

/**
 * Compute bounding box of all alive penguins to auto-zoom the camera.
 */
function getColonyBounds(penguins, droppedEggs) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let count = 0;
  for (const p of penguins) {
    if (p.state === PENGUIN_STATE.DEAD) continue;
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    count++;
  }
  for (const e of droppedEggs) {
    if (e.state === EGG_STATE.EXPOSED) {
      if (e.x < minX) minX = e.x;
      if (e.y < minY) minY = e.y;
      if (e.x > maxX) maxX = e.x;
      if (e.y > maxY) maxY = e.y;
    }
  }
  if (count === 0) return null;
  // Add padding
  const pad = 2;
  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
  };
}

export default function SimulationCanvas({ simState }) {
  const canvasRef = useRef(null);
  const spriteCacheRef = useRef(null);

  // Create sprite cache once
  useEffect(() => {
    spriteCacheRef.current = createSpriteCache();
  }, []);

  const draw = useCallback(() => {
    if (!simState || !canvasRef.current || !spriteCacheRef.current) return;
    const canvas = canvasRef.current;
    const wrapper = canvas.parentElement;
    const ctx = canvas.getContext('2d', { alpha: false });
    const gs = simState.gridSize;
    const sprites = spriteCacheRef.current;

    // Resize canvas to container
    const rect = wrapper.getBoundingClientRect();
    const width = Math.max(10, Math.floor(rect.width));
    const height = Math.max(10, Math.floor(rect.height));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // === Auto-zoom: compute view around the colony ===
    const droppedEggs = simState.droppedEggs || [];
    const bounds = getColonyBounds(simState.penguins, droppedEggs);

    let viewMinX = 0, viewMinY = 0, viewW = gs, viewH = gs;
    if (bounds) {
      viewMinX = Math.max(0, bounds.minX);
      viewMinY = Math.max(0, bounds.minY);
      viewW = Math.min(gs, bounds.maxX) - viewMinX;
      viewH = Math.min(gs, bounds.maxY) - viewMinY;
      // Enforce minimum view size
      const minView = 15;
      if (viewW < minView) { const cx = viewMinX + viewW / 2; viewMinX = cx - minView / 2; viewW = minView; }
      if (viewH < minView) { const cy = viewMinY + viewH / 2; viewMinY = cy - minView / 2; viewH = minView; }
      // Keep aspect ratio to fill canvas
      const canvasAspect = width / height;
      const viewAspect = viewW / viewH;
      if (viewAspect > canvasAspect) {
        const newH = viewW / canvasAspect;
        viewMinY -= (newH - viewH) / 2;
        viewH = newH;
      } else {
        const newW = viewH * canvasAspect;
        viewMinX -= (newW - viewW) / 2;
        viewW = newW;
      }
    }

    const scale = Math.min(width / (viewW * CELL), height / (viewH * CELL));

    // === Antarctic Background ===
    // Uniform snowy/icy surface fills the entire canvas
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#d4e2f0');   // Lighter snow top
    bgGrad.addColorStop(0.3, '#ccdaeb'); // Mid snow
    bgGrad.addColorStop(0.6, '#c0d0e2'); // Packed snow
    bgGrad.addColorStop(1, '#b4c6da');   // Slightly shadowed ice
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle large-scale light variation across the canvas
    const lightGrad = ctx.createRadialGradient(
      width * 0.4, height * 0.35, 0,
      width * 0.4, height * 0.35, width * 0.6
    );
    lightGrad.addColorStop(0, 'rgba(240, 248, 255, 0.2)');
    lightGrad.addColorStop(1, 'rgba(240, 248, 255, 0)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(viewMinX + viewW / 2) * CELL, -(viewMinY + viewH / 2) * CELL);

    // === Visible area bounds ===
    const visMinX = Math.max(0, Math.floor(viewMinX));
    const visMaxX = Math.min(gs, Math.ceil(viewMinX + viewW));
    const visMinY = Math.max(0, Math.floor(viewMinY));
    const visMaxY = Math.min(gs, Math.ceil(viewMinY + viewH));

    // === Procedural snow texture (cell-based) ===
    for (let x = visMinX; x < visMaxX; x++) {
      for (let y = visMinY; y < visMaxY; y++) {
        const hash = ((x * 7919 + y * 104729) & 0xFFFF);
        const brightness = (hash % 30) - 15; // -15 to +14
        const r = 195 + brightness;
        const g = 210 + brightness;
        const b = 230 + brightness;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    // === Ice cracks (procedural lines across the surface) ===
    ctx.strokeStyle = 'rgba(120, 160, 200, 0.15)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 12; i++) {
      const seed = i * 31337;
      let cx = ((seed * 13) % (visMaxX - visMinX)) + visMinX;
      let cy = ((seed * 17) % (visMaxY - visMinY)) + visMinY;
      ctx.beginPath();
      ctx.moveTo(cx * CELL, cy * CELL);
      for (let j = 0; j < 6; j++) {
        cx += ((seed + j * 7) % 5) - 2;
        cy += ((seed + j * 11) % 4) - 1;
        ctx.lineTo(cx * CELL, cy * CELL);
      }
      ctx.stroke();
    }

    // === Snow drifts (soft white ellipses) ===
    for (let i = 0; i < 8; i++) {
      const seed = i * 48271;
      const dx = (((seed * 7) % (visMaxX - visMinX)) + visMinX) * CELL;
      const dy = (((seed * 13) % (visMaxY - visMinY)) + visMinY) * CELL;
      const dw = (3 + (seed % 5)) * CELL;
      const dh = (1 + (seed % 2)) * CELL;
      const driftGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, dw);
      driftGrad.addColorStop(0, 'rgba(230, 240, 250, 0.25)');
      driftGrad.addColorStop(1, 'rgba(230, 240, 250, 0)');
      ctx.fillStyle = driftGrad;
      ctx.beginPath();
      ctx.ellipse(dx, dy, dw, dh, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // === Subtle grid overlay (faint cell boundaries like packed snow tiles) ===
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 0.3;
    const gridStep = 2;
    for (let x = visMinX; x <= visMaxX; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, visMinY * CELL);
      ctx.lineTo(x * CELL, visMaxY * CELL);
      ctx.stroke();
    }
    for (let y = visMinY; y <= visMaxY; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(visMinX * CELL, y * CELL);
      ctx.lineTo(visMaxX * CELL, y * CELL);
      ctx.stroke();
    }

    // === Wind-blown snow streaks ===
    if (simState.environment) {
      const angle = simState.environment.windAngle;
      const windSpeed = simState.environment.windSpeed;
      const streakAlpha = Math.min(0.12, windSpeed * 0.0008);
      ctx.strokeStyle = `rgba(220, 235, 255, ${streakAlpha})`;
      ctx.lineWidth = 0.6;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      for (let i = 0; i < 20; i++) {
        const seed = i * 9973;
        const sx = (((seed * 7) % (visMaxX - visMinX)) + visMinX) * CELL;
        const sy = (((seed * 13) % (visMaxY - visMinY)) + visMinY) * CELL;
        const len = (20 + (seed % 40)) * (windSpeed / 100);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + cos * len, sy + sin * len);
        ctx.stroke();
      }

      // Wind chill shadow on the windward side
      const gridCx = (gs * CELL) / 2, gridCy = (gs * CELL) / 2;
      const windGrad = ctx.createRadialGradient(
        gridCx + cos * gs * CELL * 0.3,
        gridCy + sin * gs * CELL * 0.3,
        0, gridCx, gridCy, gs * CELL * 0.5
      );
      windGrad.addColorStop(0, 'rgba(140, 180, 220, 0.08)');
      windGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = windGrad;
      ctx.fillRect(0, 0, gs * CELL, gs * CELL);
    }

    // === Draw dropped eggs ===
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
      if (alpha < 0.99) ctx.globalAlpha = alpha;

      ctx.drawImage(sprite, px, py);

      // Border glow
      if (p.isBorder) {
        ctx.strokeStyle = 'rgba(76, 201, 240, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px + HALF, py + HALF, CELL * 0.48, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Searching animation
      if (p.state === PENGUIN_STATE.SEARCHING_EGG) {
        const pulse = 0.4 + 0.6 * Math.sin(Date.now() * 0.008);
        ctx.strokeStyle = `rgba(255, 0, 85, ${pulse})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px + HALF, py + HALF, CELL * 0.55, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    // === Falling snow particles ===
    const time = Date.now() * 0.001;
    for (let i = 0; i < 40; i++) {
      const totalW = gs * CELL;
      const sx = ((Math.sin(time + i * 73) * 0.5 + 0.5) * totalW + time * 12 * (i % 3 + 1)) % totalW;
      const sy = ((Math.cos(time * 0.7 + i * 37) * 0.5 + 0.5) * totalW + time * 18 * (i % 2 + 1)) % totalW;
      const radius = 0.8 + (i % 3) * 0.6;
      // Shadow under each snowflake for visibility on white surface
      ctx.fillStyle = 'rgba(100, 130, 170, 0.15)';
      ctx.beginPath();
      ctx.arc(sx + 0.5, sy + 0.5, radius, 0, Math.PI * 2);
      ctx.fill();
      // Snowflake
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + (i % 4) * 0.1})`;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [simState]);

  useEffect(() => {
    draw();

    // Re-draw when the container resizes (fixes navigation/layout render bugs)
    const wrapper = canvasRef.current?.parentElement;
    if (!wrapper) return;
    
    const resizeObserver = new ResizeObserver(() => {
      draw();
    });
    
    resizeObserver.observe(wrapper);
    return () => resizeObserver.disconnect();
  }, [draw]);

  const env = simState?.environment;

  return (
    <div className="canvas-container">
      <div className="canvas-wrapper" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

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
          <div className="legend__dot" style={{ background: '#00f5ff', boxShadow: '0 0 4px #00f5ff', borderRadius: '50%' }} />
          Huevo protegido
        </div>
        <div className="legend__item">
          <div className="legend__dot" style={{ background: '#ff0055', boxShadow: '0 0 6px #ff0055', borderRadius: '50%' }} />
          Huevo expuesto
        </div>
        <div className="legend__item">
          <div className="legend__dot" style={{ background: 'rgba(255,0,85,0.4)', borderRadius: '50%', border: '1px solid #ff0055' }} />
          Buscando huevo
        </div>
      </div>
    </div>
  );
}
