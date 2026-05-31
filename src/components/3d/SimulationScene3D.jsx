/**
 * SimulationScene3D.jsx
 * The main 3D scene that composes all sub-components:
 * - Antarctic terrain
 * - Instanced penguins
 * - Dropped eggs
 * - Snow particles
 * - Lighting + environment
 * - Camera controls
 */
import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';

import PenguinInstances from './PenguinInstances.jsx';
import AntarcticTerrain from './AntarcticTerrain.jsx';
import SnowParticles from './SnowParticles.jsx';
import DroppedEggs3D from './DroppedEggs3D.jsx';
import AntarcticLighting from './AntarcticLighting.jsx';

function SceneContent({ simState }) {
  const gridSize = simState?.gridSize || 40;
  const env = simState?.environment;
  const windAngle = env?.windAngle || 0;
  const windSpeed = env?.windSpeed || 50;
  const temperature = env?.temperature || -30;
  const bounds = (gridSize * 0.8) / 2 + 5;

  return (
    <>
      {/* Camera controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={0.2}
        target={[0, 0, 0]}
      />

      {/* Lighting system */}
      <AntarcticLighting temperature={temperature} windSpeed={windSpeed} />

      {/* Stars (visible in Antarctic darkness) */}
      <Stars
        radius={80}
        depth={40}
        count={1500}
        factor={3}
        saturation={0.1}
        fade
        speed={0.5}
      />

      {/* Antarctic terrain */}
      <AntarcticTerrain
        gridSize={gridSize}
        windAngle={windAngle}
        windSpeed={windSpeed}
      />

      {/* Contact shadows under the colony */}
      <ContactShadows
        position={[0, -0.35, 0]}
        opacity={0.35}
        scale={50}
        blur={2}
        far={4}
        color="#1a2a40"
      />

      {/* Penguin colony (instanced) */}
      {simState?.penguins && (
        <PenguinInstances
          simState={simState}
          gridSize={gridSize}
        />
      )}

      {/* Dropped eggs */}
      {simState?.droppedEggs && (
        <DroppedEggs3D
          droppedEggs={simState.droppedEggs}
          gridSize={gridSize}
        />
      )}

      {/* Snow particles */}
      <SnowParticles
        windAngle={windAngle}
        windSpeed={windSpeed}
        bounds={bounds}
      />
    </>
  );
}

/**
 * Fallback while scene loads
 */
function LoadingFallback() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#ffaa00" wireframe />
    </mesh>
  );
}

/**
 * Main exported component — the Canvas + Scene
 */
export default function SimulationScene3D({ simState }) {
  const cameraConfig = useMemo(() => ({
    position: [12, 14, 18],
    fov: 50,
    near: 0.1,
    far: 200,
  }), []);

  return (
    <Canvas
      camera={cameraConfig}
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        borderRadius: 'inherit',
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <SceneContent simState={simState} />
      </Suspense>
    </Canvas>
  );
}
