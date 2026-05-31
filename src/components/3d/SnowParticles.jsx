/**
 * SnowParticles.jsx
 * GPU-instanced falling snow particles using THREE.Points.
 * Snow direction and density respond to wind speed/angle from the simulation.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 2000;

export default function SnowParticles({ windAngle = 0, windSpeed = 50, bounds = 25 }) {
  const pointsRef = useRef();

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random starting positions in a box above the terrain
      pos[i * 3] = (Math.random() - 0.5) * bounds * 2;
      pos[i * 3 + 1] = Math.random() * 15 + 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * bounds * 2;

      // Base fall velocity (randomized)
      vel[i * 3] = 0;
      vel[i * 3 + 1] = -(0.5 + Math.random() * 1.5); // Fall speed
      vel[i * 3 + 2] = 0;
    }

    return [pos, vel];
  }, [bounds]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const pos = pointsRef.current.geometry.attributes.position.array;
    const windX = Math.cos(windAngle) * windSpeed * 0.015;
    const windZ = Math.sin(windAngle) * windSpeed * 0.015;
    const dt = Math.min(delta, 0.05); // Cap delta to prevent jumps

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Apply wind + gravity
      pos[i3] += (velocities[i3] + windX) * dt;
      pos[i3 + 1] += velocities[i3 + 1] * dt;
      pos[i3 + 2] += (velocities[i3 + 2] + windZ) * dt;

      // Add slight swirl/turbulence
      pos[i3] += Math.sin(pos[i3 + 1] * 0.5 + i * 0.1) * 0.01;
      pos[i3 + 2] += Math.cos(pos[i3 + 1] * 0.3 + i * 0.07) * 0.01;

      // Reset particle when it hits the ground or goes out of bounds
      if (pos[i3 + 1] < -0.5 ||
          Math.abs(pos[i3]) > bounds ||
          Math.abs(pos[i3 + 2]) > bounds) {
        pos[i3] = (Math.random() - 0.5) * bounds * 2;
        pos[i3 + 1] = 12 + Math.random() * 5;
        pos[i3 + 2] = (Math.random() - 0.5) * bounds * 2;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}
