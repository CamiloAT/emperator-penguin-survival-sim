/**
 * PenguinInstances.jsx
 * Renders all penguins using THREE.InstancedMesh for maximum performance.
 * Each penguin's position, rotation, and color are updated every frame
 * based on the simulation state from Engine.js.
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePenguinGeometry } from './PenguinModel.jsx';
import { PENGUIN_STATE } from '../../simulation/Penguin.js';

// Temp objects to avoid per-frame allocations
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

// Color palette for penguin states
const COLORS = {
  normal: new THREE.Color('#ffffff'),       // White = no tint (shows vertex colors)
  border: new THREE.Color('#e0e8f5'),       // Very slight blue tint for exposed border
  cold: new THREE.Color('#88aadd'),         // Blue tint for critically cold
  searching: new THREE.Color('#ff0000'),    // Red tint for searching for egg
  dead: new THREE.Color('#555555'),         // Grey tint for dead
};

/**
 * Lerp a color from warm (dark) to cold (blue) based on body temperature
 */
function getTempColor(penguin) {
  if (penguin.state === PENGUIN_STATE.SEARCHING_EGG) return COLORS.searching;
  if (penguin.state === PENGUIN_STATE.DEAD) return COLORS.dead;

  const warmth = Math.max(0, Math.min(1, (penguin.bodyTemp - 28) / 10)); // 28–38 → 0–1
  if (warmth < 0.3) {
    _color.copy(COLORS.cold);
  } else if (penguin.isBorder) {
    _color.lerpColors(COLORS.cold, COLORS.border, warmth);
  } else {
    _color.copy(COLORS.normal);
  }
  return _color.clone();
}

export default function PenguinInstances({ simState, gridSize }) {
  const meshRef = useRef();
  const geometry = usePenguinGeometry();

  const maxCount = useMemo(() => {
    return simState?.colony?.total || 200;
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.05,
      vertexColors: true,
    });
  }, []);

  // Update instance matrices and colors every frame
  useFrame(() => {
    if (!meshRef.current || !simState?.penguins) return;

    const mesh = meshRef.current;
    const penguins = simState.penguins;
    const halfGrid = gridSize / 2;

    let visibleCount = 0;

    for (let i = 0; i < penguins.length; i++) {
      const p = penguins[i];

      if (p.state === PENGUIN_STATE.DEAD) {
        // Push dead penguins underground
        _dummy.position.set(0, -10, 0);
        _dummy.scale.set(0.001, 0.001, 0.001);
      } else {
        // Convert grid coords (x, y) to world coords (x, z) centered on origin
        const wx = (p.x - halfGrid) * 0.8;
        const wz = (p.y - halfGrid) * 0.8;

        _dummy.position.set(wx, 0, wz);
        _dummy.scale.set(1, 1, 1);

        // Slight random rotation for variation
        _dummy.rotation.set(0, (p.id * 1.37) % (Math.PI * 2), 0);

        // Gentle lean for searching penguins
        if (p.state === PENGUIN_STATE.SEARCHING_EGG) {
          _dummy.rotation.z = Math.sin(Date.now() * 0.005 + p.id) * 0.15;
        }

        visibleCount++;
      }

      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);

      // Set instance color
      const col = getTempColor(p);
      mesh.setColorAt(i, col);
    }

    // Hide unused instances
    for (let i = penguins.length; i < maxCount; i++) {
      _dummy.position.set(0, -10, 0);
      _dummy.scale.set(0.001, 0.001, 0.001);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.count = penguins.length;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, maxCount]}
      castShadow
      receiveShadow
    />
  );
}
