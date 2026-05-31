/**
 * DroppedEggs3D.jsx
 * Renders dropped/exposed eggs in the 3D scene as glowing spheroids.
 * Uses simple mesh instances (not InstancedMesh since count is usually low).
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EGG_STATE } from '../../simulation/Egg.js';

const eggGeometry = new THREE.SphereGeometry(0.15, 12, 8);
eggGeometry.scale(0.8, 1.2, 0.8);

const eggMaterial = new THREE.MeshStandardMaterial({
  color: '#ff8800',
  emissive: '#cc5500',
  emissiveIntensity: 0.6,
  roughness: 0.3,
  metalness: 0.1,
});

const glowMaterial = new THREE.MeshBasicMaterial({
  color: '#ffaa00',
  transparent: true,
  opacity: 0.15,
  side: THREE.DoubleSide,
});

const glowGeometry = new THREE.SphereGeometry(0.35, 8, 6);

export default function DroppedEggs3D({ droppedEggs = [], gridSize = 40 }) {
  const groupRef = useRef();
  const halfGrid = gridSize / 2;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Pulse glow spheres
    groupRef.current.children.forEach((child, idx) => {
      if (child.userData.isGlow) {
        const pulse = 0.12 + Math.sin(t * 3 + idx) * 0.08;
        child.material.opacity = pulse;
        child.scale.setScalar(1 + Math.sin(t * 4 + idx * 0.5) * 0.15);
      }
      // Gentle bobbing for the egg
      if (child.userData.isEgg) {
        child.position.y = 0.12 + Math.sin(t * 2 + idx * 0.7) * 0.03;
      }
    });
  });

  const exposedEggs = droppedEggs.filter(e => e.state === EGG_STATE.EXPOSED);

  return (
    <group ref={groupRef}>
      {exposedEggs.map((egg) => {
        const wx = (egg.x - halfGrid) * 0.8;
        const wz = (egg.y - halfGrid) * 0.8;
        return (
          <group key={egg.id} position={[wx, 0, wz]}>
            {/* Egg mesh */}
            <mesh
              geometry={eggGeometry}
              material={eggMaterial}
              position={[0, 0.12, 0]}
              castShadow
              userData={{ isEgg: true }}
            />
            {/* Glow sphere */}
            <mesh
              geometry={glowGeometry}
              material={glowMaterial.clone()}
              position={[0, 0.1, 0]}
              userData={{ isGlow: true }}
            />
            {/* Ground point light for dramatic effect */}
            <pointLight
              color="#ffaa00"
              intensity={0.3}
              distance={2}
              position={[0, 0.3, 0]}
            />
          </group>
        );
      })}
    </group>
  );
}
