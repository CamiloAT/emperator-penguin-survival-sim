/**
 * AntarcticTerrain.jsx
 * Procedural snow/ice terrain with displacement for a realistic Antarctic surface.
 * Uses Perlin-like noise to create subtle rolling dunes.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Simple 2D pseudo-noise function (no external dependency)
 */
function hash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) & 0x7fffffff;
}

function noise2D(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = hash(ix, iy) / 0x7fffffff;
  const n10 = hash(ix + 1, iy) / 0x7fffffff;
  const n01 = hash(ix, iy + 1) / 0x7fffffff;
  const n11 = hash(ix + 1, iy + 1) / 0x7fffffff;

  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);
  return nx0 + sy * (nx1 - nx0);
}

function fbm(x, y, octaves = 4) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / maxValue;
}

export function getTerrainHeight(x, z) {
  // Make dunes MASSIVE and highly exaggerated
  const height = fbm(x * 0.015, z * 0.015, 5) * 6.0 + fbm(x * 0.08, z * 0.08, 3) * 1.5;
  return height - 3.0;
}

export default function AntarcticTerrain({ gridSize = 40, windAngle = 0, windSpeed = 50 }) {
  const meshRef = useRef();
  const planeSize = gridSize * 0.8 + 10;

  const [geometry, colorAttr] = useMemo(() => {
    const segments = 128;
    const geo = new THREE.PlaneGeometry(planeSize * 2, planeSize * 2, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const height = getTerrainHeight(x, z);
      pos.setY(i, height);

      // Soft icy blue in valleys, fading to white snow on peaks
      // Map height roughly from -3 to +3 into a 0 to 1 factor
      const hFactor = Math.max(0, Math.min(1, (height + 3) / 6));
      
      // Valley (soft light blue): r=0.82, g=0.92, b=0.98
      // Peak (white snow): r=0.98, g=0.98, b=1.0
      const r = 0.82 + hFactor * 0.16;
      const g = 0.92 + hFactor * 0.06;
      const b = 0.98 + hFactor * 0.02;
      
      colors[i * 3] = Math.min(1, Math.max(0, r));
      colors[i * 3 + 1] = Math.min(1, Math.max(0, g));
      colors[i * 3 + 2] = Math.min(1, Math.max(0, b));
    }

    geo.computeVertexNormals();
    const colAttr = new THREE.BufferAttribute(colors, 3);
    geo.setAttribute('color', colAttr);

    return [geo, colAttr];
  }, [planeSize]);

  const snowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const imgData = context.createImageData(256, 256);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const noise = Math.random() * 255;
      imgData.data[i] = noise;
      imgData.data[i + 1] = noise;
      imgData.data[i + 2] = noise;
      imgData.data[i + 3] = 255;
    }
    context.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(24, 24);
    return texture;
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.05,
      bumpMap: snowTexture,
      bumpScale: 0.03,
      flatShading: false,
      side: THREE.DoubleSide,
    });
  }, [snowTexture]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      receiveShadow
      position={[0, 0, 0]}
    />
  );
}
