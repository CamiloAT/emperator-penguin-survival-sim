/**
 * AntarcticLighting.jsx
 * Configures realistic Antarctic winter lighting:
 * - Dim directional "sun" (low angle winter light)
 * - Cool-toned ambient
 * - Fog for atmospheric depth
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function AntarcticLighting({ temperature = -30, windSpeed = 50, isNightMode = false }) {
  const { scene } = useThree();

  // Dynamic fog based on wind (blizzard effect)
  useEffect(() => {
    const fogDensity = 0.005 + (windSpeed / 200) * 0.015;
    // Lighter fog color during "calmer" weather, darker during storms
    const stormFactor = Math.min(1, windSpeed / 150);
    const fogR = 0.72 - stormFactor * 0.15;
    const fogG = 0.76 - stormFactor * 0.12;
    const fogB = 0.82 - stormFactor * 0.08;
    
    if (isNightMode) {
      scene.fog = new THREE.FogExp2(
        new THREE.Color(0.05, 0.08, 0.15),
        fogDensity * 1.5
      );
    } else {
      scene.fog = new THREE.FogExp2(
        new THREE.Color(fogR, fogG, fogB),
        fogDensity
      );
    }
  }, [scene, windSpeed, isNightMode]);

  // Intensity based on temperature (colder = dimmer, more desolate)
  const tempFactor = Math.max(0, Math.min(1, (temperature + 60) / 40)); // -60→0, -20→1
  const baseIntensity = isNightMode ? 0.05 : 0.4;
  const sunIntensity = baseIntensity + (isNightMode ? 0 : tempFactor * 0.4);
  const ambientIntensity = isNightMode ? 0.1 : 0.25 + tempFactor * 0.15;

  return (
    <>
      {/* Low-angle directional sun (Antarctic winter sun barely rises) */}
      <directionalLight
        position={isNightMode ? [-30, 4, -40] : [-40, 6, 40]}
        intensity={isNightMode ? 0.2 : sunIntensity}
        color={isNightMode ? "#8aa2d6" : "#ffcc33"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />

      {/* Cool fill light from opposite side */}
      <directionalLight
        position={[-10, 6, -8]}
        intensity={sunIntensity * 0.3}
        color={isNightMode ? "#1a2a40" : "#b0c8e8"}
      />

      {/* Ambient — cool blue tint */}
      <ambientLight intensity={ambientIntensity} color={isNightMode ? "#1a2a40" : "#c8d8f0"} />

      {/* Hemisphere light: sky blue + snow ground bounce */}
      <hemisphereLight
        skyColor={isNightMode ? "#050814" : "#8ab4e0"}
        groundColor={isNightMode ? "#112233" : "#d8e4f0"}
        intensity={isNightMode ? 0.15 : 0.35}
      />
    </>
  );
}
