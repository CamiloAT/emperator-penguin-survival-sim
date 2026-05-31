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
import { Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';

import PenguinInstances from './PenguinInstances.jsx';
import AntarcticTerrain from './AntarcticTerrain.jsx';
import SnowParticles from './SnowParticles.jsx';
import DroppedEggs3D from './DroppedEggs3D.jsx';
import AntarcticLighting from './AntarcticLighting.jsx';


// Animated sky background function
function Skydome({ isNightMode }) {
  const { scene } = useThree();
  
  useEffect(() => {
    // Transition background color based on day/night
    const targetColor = isNightMode ? new THREE.Color("#050814") : new THREE.Color("#8ab4e0");
    scene.background = targetColor;
  }, [isNightMode, scene]);
  
  return null;
}

function SceneContent({ simState, config, isNightMode }) {
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
      <AntarcticLighting temperature={temperature} windSpeed={windSpeed} isNightMode={isNightMode} />

      {/* Skydome color transitions */}
      <Skydome isNightMode={isNightMode} />

      {/* Stars (visible in Antarctic darkness) */}
      <Stars
        radius={80}
        depth={40}
        count={1500}
        factor={3}
        saturation={0.1}
        fade
        speed={0.5}
        visible={isNightMode}
      />

      {/* Lunar or Solar body */}
      <group position={isNightMode ? [-30, 4, -40] : [-40, 6, 40]}>
        {isNightMode ? (
          /* Crescent Moon */
          <mesh rotation={[0, 0, Math.PI / 4]}>
            {/* Base moon sphere (dark, slightly visible) */}
            <mesh>
              <sphereGeometry args={[2.5, 32, 32]} />
              <meshBasicMaterial color="#0a1525" />
            </mesh>
            {/* The bright crescent part constructed via a torus/tube trick or just using a second overlapped sphere for a boolean-like cut. Here we do an overlapped dark sphere to "cut" the light one */}
            <mesh>
              <sphereGeometry args={[2.51, 32, 32]} />
              <meshBasicMaterial color="#e0e8ff" transparent opacity={0.9} />
            </mesh>
            <mesh position={[0.6, 0.4, 0]}>
              <sphereGeometry args={[2.55, 32, 32]} />
              {/* This sphere matches the background color to create the crescent illusion */}
              <meshBasicMaterial color="#050814" />
            </mesh>
          </mesh>
        ) : (
          /* Sun */
          <mesh>
            <sphereGeometry args={[3, 32, 32]} />
            <meshBasicMaterial color="#ffcc33" />
          </mesh>
        )}
      </group>

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
          config={config}
        />
      )}

      {/* Dropped eggs */}
      {simState?.droppedEggs && (
        <DroppedEggs3D
          droppedEggs={simState.droppedEggs}
          gridSize={gridSize}
          config={config}
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
export default function SimulationScene3D({ simState, config, isNightMode }) {
  const cameraConfig = useMemo(() => ({
    position: [12, 7, 18],
    fov: 30,
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
        background: isNightMode ? '#050814' : '#8ab4e0',
        transition: 'background 2s ease-in-out'
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <SceneContent simState={simState} config={config} isNightMode={isNightMode} />
      </Suspense>
    </Canvas>
  );
}
