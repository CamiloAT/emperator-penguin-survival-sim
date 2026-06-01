/**
 * PenguinInstances.jsx
 * Renders all penguins using THREE.InstancedMesh for maximum performance.
 * Each penguin's position, rotation, and color are updated every frame
 * based on the simulation state from Engine.js.
 */
import { Component, useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePenguinGeometry } from './PenguinModel.jsx';
import ImportedPenguinInstances from './ImportedPenguinInstances.jsx';
import { isGlbAvailable } from '../../utils/gltfAvailability.js';
import { getTerrainHeight } from './AntarcticTerrain.jsx';
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

const DEFAULT_IMPORTED_MODEL_PATH = '/assets/models/penguin.glb';

class ImportedPenguinErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default function PenguinInstances(props) {
  const wantsImported = props.config?.penguinModel === 'sketchfab';

  if (wantsImported) {
    return <ImportedPenguinGate {...props} />;
  }

  return <ProceduralPenguinInstances {...props} />;
}

function ImportedPenguinGate(props) {
  const modelPath = props.config?.penguinModelPath || DEFAULT_IMPORTED_MODEL_PATH;
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsAvailable(false);

    isGlbAvailable(modelPath).then((available) => {
      if (!cancelled) setIsAvailable(available);
    });

    return () => {
      cancelled = true;
    };
  }, [modelPath]);

  const fallback = <ProceduralPenguinInstances {...props} />;

  if (!isAvailable) return fallback;

  return (
    <ImportedPenguinErrorBoundary resetKey={modelPath} fallback={fallback}>
      <ImportedPenguinInstances {...props} />
    </ImportedPenguinErrorBoundary>
  );
}

function ProceduralPenguinInstances({ simState, gridSize, config }) {
  useEffect(() => {
    if (config?.searchColor) {
      COLORS.searching.set(config.searchColor);
    }
  }, [config?.searchColor]);
  const meshRef = useRef();
  const geometry = usePenguinGeometry();

  const maxCount = useMemo(() => {
    return Math.max(simState?.colony?.total || 200, 1000);
  }, [simState?.colony?.total]);

  const eggMeshRef = useRef();
  const eggGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.18, 16, 12); // Reduced size to be proportional but visible
    geo.scale(0.8, 1.2, 0.8);
    return geo;
  }, []);
  const eggMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: config?.eggColor || '#ff8800',
      emissive: config?.eggColor || '#ff8800',
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.1,
    });
  }, [config?.eggColor]);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.05,
      vertexColors: true,
    });
    
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      
      shader.vertexShader = `
        uniform float uTime;
        attribute float isEye;
        ${shader.vertexShader}
      `;
      
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        
        if (isEye > 0.5) {
          // Each penguin blinks rarely
          float t = uTime * 0.4 + float(gl_InstanceID) * 7.13;
          
          float blinkPattern = fract(t);
          float doubleBlink = fract(t * 3.0);
          
          // Blink happens only ~1% of the time, very occasionally
          bool isBlinking = blinkPattern < 0.01 || (mod(float(gl_InstanceID), 3.0) < 0.1 && doubleBlink < 0.01 && blinkPattern < 0.15);
          
          float blinkScale = isBlinking ? 0.02 : 1.0;
          
          // The eye's local Y center is roughly 0.7
          transformed.y = 0.7 + (transformed.y - 0.7) * blinkScale;
        }
        `
      );
      
      mat.userData.shader = shader;
    };
    
    return mat;
  }, []);

  // Update instance matrices and colors every frame
  useFrame(({ clock }) => {
    if (material.userData.shader) {
      material.userData.shader.uniforms.uTime.value = clock.getElapsedTime();
    }
    
    if (!meshRef.current || !eggMeshRef.current || !simState?.penguins) return;

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
        const wy = getTerrainHeight(wx, wz);

        _dummy.position.set(wx, wy, wz);
        _dummy.scale.set(1, 1, 1);

        const rotY = (p.id * 1.37) % (Math.PI * 2);
        _dummy.rotation.set(0, rotY, 0);

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

      // Update carried egg position
      if (p.hasEgg && p.state !== PENGUIN_STATE.DEAD && p.state !== PENGUIN_STATE.SEARCHING_EGG) {
        const rotY = (p.id * 1.37) % (Math.PI * 2);
        const wx = (p.x - halfGrid) * 0.8;
        const wz = (p.y - halfGrid) * 0.8;
        const wy = getTerrainHeight(wx, wz);
        const eggX = wx + Math.sin(rotY) * 0.22;
        const eggZ = wz + Math.cos(rotY) * 0.22;
        _dummy.position.set(eggX, wy + 0.15, eggZ);
        _dummy.scale.set(1, 1, 1);
        _dummy.rotation.set(0, 0, 0);
        _dummy.updateMatrix();
        eggMeshRef.current.setMatrixAt(i, _dummy.matrix);
      } else {
        _dummy.position.set(0, -10, 0);
        _dummy.scale.set(0.001, 0.001, 0.001);
        _dummy.updateMatrix();
        eggMeshRef.current.setMatrixAt(i, _dummy.matrix);
      }
    }

    for (let i = penguins.length; i < maxCount; i++) {
      _dummy.position.set(0, -10, 0);
      _dummy.scale.set(0.001, 0.001, 0.001);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
      eggMeshRef.current.setMatrixAt(i, _dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.count = penguins.length;

    eggMeshRef.current.instanceMatrix.needsUpdate = true;
    eggMeshRef.current.count = penguins.length;
  });

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, maxCount]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={eggMeshRef}
        args={[eggGeometry, eggMaterial, maxCount]}
        castShadow
      />
    </group>
  );
}
