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
import { Suspense, useMemo, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Sky } from 'three-stdlib';
import * as THREE from 'three';

import PenguinInstances from './PenguinInstances.jsx';
import AntarcticTerrain from './AntarcticTerrain.jsx';
import SnowParticles from './SnowParticles.jsx';
import DroppedEggs3D from './DroppedEggs3D.jsx';
import AntarcticLighting from './AntarcticLighting.jsx';


// Sun position based on time of day (spherical coordinates).
// skyElevation = where the sun "is" for atmospheric scattering (can be below horizon at night).
// bodyElevation/bodyAzimuth = where the visible sun/moon disc is rendered (always above horizon).
const TIME_OF_DAY_PARAMS = {
  day:     { skyElevation: 28,  bodyElevation: 30,  bodyAzimuth: 130, turbidity: 4,  rayleigh: 2,   mieCoeff: 0.005, mieDir: 0.80, bgColor: '#8ab4e0' },
  sunset:  { skyElevation: 0.5, bodyElevation: 1.5, bodyAzimuth: 300, turbidity: 14, rayleigh: 4,   mieCoeff: 0.012, mieDir: 0.97, bgColor: '#ff4a18' },
  night:   { skyElevation: -25, bodyElevation: 7,   bodyAzimuth: 200, turbidity: 20, rayleigh: 0.1, mieCoeff: 0.001, mieDir: 0.50, bgColor: '#020410' },
};

function computeSunVector(elevationDeg, azimuthDeg) {
  const phi = THREE.MathUtils.degToRad(90 - elevationDeg);
  const theta = THREE.MathUtils.degToRad(azimuthDeg);
  const v = new THREE.Vector3();
  v.setFromSphericalCoords(1, phi, theta);
  return v;
}

// Dynamic sky using the Sky shader for day/sunset; black bg + stars for night
function DynamicSky({ timeOfDay }) {
  const { scene } = useThree();

  const skyMesh = useMemo(() => {
    const s = new Sky();
    s.scale.setScalar(10000);
    s.renderOrder = -3; // drawn first (most back)
    return s;
  }, []);

  useEffect(() => {
    const p = TIME_OF_DAY_PARAMS[timeOfDay] || TIME_OF_DAY_PARAMS.day;
    const u = skyMesh.material.uniforms;
    u.turbidity.value = p.turbidity;
    u.rayleigh.value = p.rayleigh;
    u.mieCoefficient.value = p.mieCoeff;
    u.mieDirectionalG.value = p.mieDir;
    u.sunPosition.value.copy(computeSunVector(p.skyElevation, p.bodyAzimuth));
  }, [timeOfDay, skyMesh]);

  useEffect(() => {
    if (timeOfDay === 'night') {
      scene.background = new THREE.Color(TIME_OF_DAY_PARAMS.night.bgColor);
    } else {
      scene.background = null;
    }
  }, [timeOfDay, scene]);

  if (timeOfDay === 'night') return null;
  return <primitive object={skyMesh} />;
}

// Procedural cloud sphere - FBM noise + sun lighting
// Creates dramatic clouds that wrap the scene
const cloudVertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
    // Force z = w so the sphere always sits at the far plane
    // (avoids being clipped when the sphere is at scale 8000+ and far plane is small)
    gl_Position.z = gl_Position.w;
  }
`;

const cloudFragmentShader = /* glsl */ `
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform vec3 uSunPos;
  uniform float uDensity;
  uniform vec3 uHighlight;
  uniform vec3 uMid;
  uniform vec3 uShadow;

  // Hash and smooth noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // FBM with 6 octaves
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p = rot * p * 2.05;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vWorldPos);

    // Spherical UV mapping - clouds "wrap" around the sky
    float u = atan(dir.x, dir.z) / 3.14159;
    float v = clamp(dir.y, -0.2, 1.0);

    // Drift over time (clouds slowly move)
    vec2 uv = vec2(u * 3.0 + uTime * 0.008, v * 4.0);

    // Domain warp for more organic cloud shapes
    vec2 warp = vec2(
      fbm(uv * 0.7 + 11.0),
      fbm(uv * 0.7 + 31.0)
    );
    float n = fbm(uv + warp * 0.6);

    // Soft cloud mask with multiple thresholds for variety
    float cloud = smoothstep(0.42, 0.72, n);

    // Fade clouds toward horizon for a "ground" effect
    float horizonFade = smoothstep(-0.05, 0.25, dir.y);
    cloud *= horizonFade;

    // Sun lighting
    vec3 sunDir = normalize(uSunPos);
    float sunDot = max(0.0, dot(dir, sunDir));
    float sunGlow = pow(sunDot, 4.0);
    float backlit = pow(max(0.0, -dot(dir, sunDir) * 0.5 + 0.5), 2.0);

    // Color blending: highlight (sun side) -> mid -> shadow (away from sun)
    vec3 color = uMid;
    color = mix(color, uHighlight, sunGlow * 1.3);
    color = mix(color, uShadow, (1.0 - sunDot) * 0.4);

    // Boost brightness near sun for dramatic glow
    float sunProximity = smoothstep(0.5, 1.0, sunDot);
    color += uHighlight * sunProximity * 0.5;

    // Final output with density
    float alpha = cloud * uDensity;
    gl_FragColor = vec4(color, alpha);
  }
`;

function CloudSphere({ timeOfDay }) {
  const matRef = useRef();
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSunPos: { value: new THREE.Vector3(1, 0, 0) },
      uDensity: { value: 0 },
      uHighlight: { value: new THREE.Color('#fff5d8') },
      uMid: { value: new THREE.Color('#e0e8f0') },
      uShadow: { value: new THREE.Color('#5a6080') },
    },
    vertexShader: cloudVertexShader,
    fragmentShader: cloudFragmentShader,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
  }), []);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
    const p = TIME_OF_DAY_PARAMS[timeOfDay] || TIME_OF_DAY_PARAMS.day;
    const sun = computeSunVector(p.elevation, p.azimuth);
    material.uniforms.uSunPos.value.copy(sun);
  });

  useEffect(() => {
    if (timeOfDay === 'sunset') {
      material.uniforms.uDensity.value = 0.85;
      material.uniforms.uHighlight.value.set('#ffd28a');
      material.uniforms.uMid.value.set('#ff7a3a');
      material.uniforms.uShadow.value.set('#3a1230');
    } else if (timeOfDay === 'day') {
      material.uniforms.uDensity.value = 0.4;
      material.uniforms.uHighlight.value.set('#fff8e0');
      material.uniforms.uMid.value.set('#dde4f0');
      material.uniforms.uShadow.value.set('#6a7088');
    } else {
      material.uniforms.uDensity.value = 0;
    }
  }, [timeOfDay, material]);

  return (
    <mesh scale={[8000, 8000, 8000]} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive ref={matRef} object={material} attach="material" />
    </mesh>
  );
}

// Sun/moon disc visible in the sky
function CelestialBody({ timeOfDay }) {
  const p = TIME_OF_DAY_PARAMS[timeOfDay] || TIME_OF_DAY_PARAMS.day;
  const sunVec = useMemo(
    () => computeSunVector(p.bodyElevation, p.bodyAzimuth),
    [p.bodyElevation, p.bodyAzimuth]
  );
  // Place far in the body direction
  const position = [sunVec.x * 60, sunVec.y * 60, sunVec.z * 60];

  if (timeOfDay === 'day') {
    return (
      <group position={position}>
        {/* Outer glow */}
        <mesh>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial color="#ffe0a0" transparent opacity={0.12} />
        </mesh>
        <mesh>
          <sphereGeometry args={[4.2, 32, 32]} />
          <meshBasicMaterial color="#fff1c0" transparent opacity={0.25} />
        </mesh>
        {/* Sun disc */}
        <mesh>
          <sphereGeometry args={[2.8, 48, 48]} />
          <meshBasicMaterial color="#fff8d8" />
        </mesh>
      </group>
    );
  }

  if (timeOfDay === 'sunset') {
    return (
      <group position={position}>
        {/* Massive warm glow halo - the sunburst from the reference photo */}
        <mesh>
          <sphereGeometry args={[14, 32, 32]} />
          <meshBasicMaterial color="#ff3010" transparent opacity={0.08} />
        </mesh>
        <mesh>
          <sphereGeometry args={[10, 32, 32]} />
          <meshBasicMaterial color="#ff5a20" transparent opacity={0.14} />
        </mesh>
        <mesh>
          <sphereGeometry args={[7, 32, 32]} />
          <meshBasicMaterial color="#ff8030" transparent opacity={0.22} />
        </mesh>
        <mesh>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ffb050" transparent opacity={0.38} />
        </mesh>
        <mesh>
          <sphereGeometry args={[3.6, 32, 32]} />
          <meshBasicMaterial color="#ffd070" transparent opacity={0.6} />
        </mesh>
        {/* Sun disc - hot orange */}
        <mesh>
          <sphereGeometry args={[2.8, 48, 48]} />
          <meshBasicMaterial color="#ffe090" />
        </mesh>
      </group>
    );
  }

  // night - well-defined crescent moon at horizon
  return (
    <group position={position} rotation={[0, 0, -0.3]}>
      {/* Outer halo */}
      <mesh>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshBasicMaterial color="#3a4a78" transparent opacity={0.05} />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshBasicMaterial color="#5a6ea0" transparent opacity={0.08} />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#8aa0d0" transparent opacity={0.13} />
      </mesh>
      {/* Dark side of moon (visible silhouette) */}
      <mesh>
        <sphereGeometry args={[2.6, 64, 64]} />
        <meshBasicMaterial color="#0a1018" />
      </mesh>
      {/* Bright side of moon */}
      <mesh>
        <sphereGeometry args={[2.62, 64, 64]} />
        <meshBasicMaterial color="#fffaf0" />
      </mesh>
      {/* Strong cutting sphere - offset more for a clear thin crescent */}
      <mesh position={[1.55, 0.65, 0.1]}>
        <sphereGeometry args={[2.95, 64, 64]} />
        <meshBasicMaterial color="#020410" />
      </mesh>
    </group>
  );
}

// Subtle milky way band - large sphere with diagonal noise stripe
const milkyWayVertex = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
    // Force z = w so the sphere always sits at the far plane
    gl_Position.z = gl_Position.w;
  }
`;

const milkyWayFragment = /* glsl */ `
  varying vec3 vWorldPos;
  uniform float uTime;

  // Smooth 2D value noise (Hermite interpolation, no high-freq grid artifacts)
  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 33.33);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // FBM with 3 octaves - smoother dust variation
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vWorldPos);

    // Wider diagonal band covering more of the sky
    float bandY = dir.y * 1.2;
    float bandX = (dir.x - dir.z) * 0.5;
    float bandDist = abs(bandY - bandX);

    // Soft falloff = wide band, no banding artifacts
    float band = exp(-bandDist * bandDist * 1.6);

    // Low-frequency dust (no high-freq cell noise = no blocky patterns)
    vec2 uv = vec2(atan(dir.x, dir.z) * 1.5, dir.y * 2.5) + uTime * 0.001;
    float dust = fbm(uv * 1.5) * 0.7 + 0.45;
    dust = clamp(dust, 0.0, 1.2);

    // Hide below horizon
    float horizonFade = smoothstep(-0.05, 0.35, dir.y);

    // Milky way color: cool violet/blue with hints of warm
    vec3 color = mix(vec3(0.25, 0.28, 0.5), vec3(0.55, 0.45, 0.7), dust);

    float alpha = band * dust * 0.55 * horizonFade;
    gl_FragColor = vec4(color, alpha);
  }
`;

// Custom starfield using THREE.Points - guaranteed visible regardless of drei Stars behavior
function Starfield({ count = 4000, radius = 80 }) {
  const pointsRef = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const colorWarm = new THREE.Color('#fff4d6');
    const colorCool = new THREE.Color('#c8d8ff');
    const colorWhite = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      // Distribute uniformly on a sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      // Bias radius slightly for depth
      const r = radius * (0.85 + Math.random() * 0.3);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Vary color temperature: most white, some warm, some cool
      const t = Math.random();
      let c;
      if (t < 0.15) c = colorWarm;
      else if (t < 0.3) c = colorCool;
      else c = colorWhite;

      // Random brightness multiplier (some stars are dim, some bright)
      const brightness = 0.4 + Math.random() * 0.6;
      colors[i * 3] = c.r * brightness;
      colors[i * 3 + 1] = c.g * brightness;
      colors[i * 3 + 2] = c.b * brightness;

      // Size: most small, a few big
      const sizeRoll = Math.random();
      if (sizeRoll > 0.97) sizes[i] = 1.4 + Math.random() * 0.8; // big bright stars
      else if (sizeRoll > 0.85) sizes[i] = 0.7 + Math.random() * 0.4;
      else sizes[i] = 0.25 + Math.random() * 0.3;
    }
    return { positions, colors, sizes };
  }, [count, radius]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, colors, sizes]);

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.8,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  // Cleanup
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Slow rotation for subtle parallax
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.005;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} renderOrder={-1} frustumCulled={false} />;
}

function MilkyWayBand() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: milkyWayVertex,
    fragmentShader: milkyWayFragment,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
  }), []);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh scale={[8500, 8500, 8500]} renderOrder={-2} frustumCulled={false}>
      <sphereGeometry args={[1, 128, 128]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function SceneContent({ simState, config, timeOfDay, isSnowEnabled }) {
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
      <AntarcticLighting temperature={temperature} windSpeed={windSpeed} timeOfDay={timeOfDay} />

      {/* Procedural sky (day/sunset use Sky shader, night uses background + stars) */}
      <DynamicSky timeOfDay={timeOfDay} />

      {/* Procedural cloud layer (FBM noise shader) */}
      <CloudSphere timeOfDay={timeOfDay} />

      {/* Custom starfield (guaranteed visible) only at night */}
      {timeOfDay === 'night' && <Starfield count={4000} radius={80} />}

      {/* Subtle milky way band */}
      {timeOfDay === 'night' && <MilkyWayBand />}

      {/* Sun or Moon disc */}
      <CelestialBody timeOfDay={timeOfDay} />

      {/* Antarctic terrain */}
      <AntarcticTerrain
        gridSize={gridSize}
        windAngle={windAngle}
        windSpeed={windSpeed}
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

      {/* Snow particles (optional) */}
      {isSnowEnabled && (
        <SnowParticles
          windAngle={windAngle}
          windSpeed={windSpeed}
          bounds={bounds}
        />
      )}
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
export default function SimulationScene3D({ simState, config, timeOfDay, isSnowEnabled }) {
  const cameraConfig = useMemo(() => ({
    position: [12, 3, 20],
    fov: 35,
    near: 0.1,
    far: 500,
  }), []);

  const bgColor = TIME_OF_DAY_PARAMS[timeOfDay]?.bgColor || TIME_OF_DAY_PARAMS.day.bgColor;

  return (
    <Canvas
      camera={cameraConfig}
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: timeOfDay === 'sunset' ? 0.95 : 1.1,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        borderRadius: 'inherit',
        background: bgColor,
        transition: 'background 1.5s ease-in-out'
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <SceneContent simState={simState} config={config} timeOfDay={timeOfDay} isSnowEnabled={isSnowEnabled} />
      </Suspense>
    </Canvas>
  );
}
