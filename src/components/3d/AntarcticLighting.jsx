/**
 * AntarcticLighting.jsx
 * Configures realistic Antarctic winter lighting for 3 modes (day/sunset/night):
 * - Day: bright warm directional + cool ambient
 * - Sunset: very warm orange directional + warm fill + warm fog
 * - Night: dim blue moonlight + dark ambient
 * - Dynamic fog blends with sky color
 */
import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SUN_POSITIONS = {
  day:     { main: [-40, 28, 50], fill: [10, 8, -8], mainColor: '#fff1c0', fillColor: '#b0c8e8', ambient: '#c8d8f0', hemiSky: '#8ab4e0', hemiGround: '#d8e4f0' },
  sunset:  { main: [50, 4, -30],  fill: [-15, 6, 8], mainColor: '#ff7733', fillColor: '#ff9966', ambient: '#ffb088', hemiSky: '#ff7a3d', hemiGround: '#5a2410' },
  night:   { main: [-30, 14, -40], fill: [10, 6, -8], mainColor: '#8aa2d6', fillColor: '#1a2a40', ambient: '#1a2a40', hemiSky: '#050814', hemiGround: '#112233' },
};

export default function AntarcticLighting({ temperature = -30, windSpeed = 50, timeOfDay = 'day' }) {
  const { scene } = useThree();

  // Dynamic fog blends with sky color per time of day
  useEffect(() => {
    const fogDensity = 0.005 + (windSpeed / 200) * 0.015;
    const stormFactor = Math.min(1, windSpeed / 150);

    if (timeOfDay === 'night') {
      scene.fog = new THREE.FogExp2(
        new THREE.Color(0.04, 0.06, 0.12),
        fogDensity * 1.5
      );
    } else if (timeOfDay === 'sunset') {
      // Warm orange fog
      const r = 0.85 - stormFactor * 0.10;
      const g = 0.45 - stormFactor * 0.10;
      const b = 0.25 - stormFactor * 0.08;
      scene.fog = new THREE.FogExp2(
        new THREE.Color(r, g, b),
        fogDensity * 1.1
      );
    } else {
      // Day: cool blue fog
      const r = 0.72 - stormFactor * 0.15;
      const g = 0.76 - stormFactor * 0.12;
      const b = 0.82 - stormFactor * 0.08;
      scene.fog = new THREE.FogExp2(
        new THREE.Color(r, g, b),
        fogDensity
      );
    }
  }, [scene, windSpeed, timeOfDay]);

  // Intensity based on temperature (colder = dimmer)
  const tempFactor = Math.max(0, Math.min(1, (temperature + 60) / 40));

  // Per-mode intensities
  const intensity = useMemo(() => {
    if (timeOfDay === 'night') {
      return {
        main: 0.2,
        fill: 0.1,
        ambient: 0.12,
        hemi: 0.15,
      };
    }
    if (timeOfDay === 'sunset') {
      return {
        main: 0.85 + tempFactor * 0.2,
        fill: 0.45,
        ambient: 0.32,
        hemi: 0.45,
      };
    }
    // day
    const base = 0.4 + tempFactor * 0.4;
    return {
      main: base,
      fill: base * 0.3,
      ambient: 0.25 + tempFactor * 0.15,
      hemi: 0.35,
    };
  }, [timeOfDay, tempFactor]);

  const colors = SUN_POSITIONS[timeOfDay] || SUN_POSITIONS.day;
  const pos = colors.main;

  return (
    <>
      {/* Main directional light (sun / moon) */}
      <directionalLight
        position={pos}
        intensity={intensity.main}
        color={colors.mainColor}
        castShadow={timeOfDay !== 'night'}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={colors.fill}
        intensity={intensity.fill}
        color={colors.fillColor}
      />

      {/* Ambient — tinted per mode */}
      <ambientLight intensity={intensity.ambient} color={colors.ambient} />

      {/* Hemisphere light: sky + snow ground bounce */}
      <hemisphereLight
        skyColor={colors.hemiSky}
        groundColor={colors.hemiGround}
        intensity={intensity.hemi}
      />
    </>
  );
}
