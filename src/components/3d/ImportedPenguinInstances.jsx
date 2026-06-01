import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getTerrainHeight } from './AntarcticTerrain.jsx';
import { PENGUIN_STATE } from '../../simulation/Penguin.js';

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

const COLORS = {
  normal: new THREE.Color('#ffffff'),
  border: new THREE.Color('#e0e8f5'),
  cold: new THREE.Color('#88aadd'),
  searching: new THREE.Color('#ff0000'),
  dead: new THREE.Color('#555555'),
};

function getTempColor(penguin) {
  if (penguin.state === PENGUIN_STATE.SEARCHING_EGG) return COLORS.searching;
  if (penguin.state === PENGUIN_STATE.DEAD) return COLORS.dead;

  const warmth = Math.max(0, Math.min(1, (penguin.bodyTemp - 28) / 10));
  if (warmth < 0.3) {
    _color.copy(COLORS.cold);
  } else if (penguin.isBorder) {
    _color.lerpColors(COLORS.cold, COLORS.border, warmth);
  } else {
    _color.copy(COLORS.normal);
  }
  return _color.clone();
}

export default function ImportedPenguinInstances({ simState, gridSize, config }) {
  useEffect(() => {
    if (config?.searchColor) {
      COLORS.searching.set(config.searchColor);
    }
  }, [config?.searchColor]);

  const gltf = useGLTF(config?.penguinModelPath || '/assets/models/penguin.glb');
  const eggMeshRef = useRef();

  const maxCount = useMemo(() => {
    return Math.max(simState?.colony?.total || 200, 1000);
  }, [simState?.colony?.total]);

  const penguinPool = useMemo(() => {
    const pool = [];
    for (let i = 0; i < maxCount; i++) {
      const clone = gltf.scene.clone(true);
      clone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const mat of mats) {
            mat.userData.originalColor = mat.color.clone();
          }
        }
      });
      clone.visible = false;
      pool.push(clone);
    }
    return pool;
  }, [gltf.scene, maxCount]);

  const eggGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.18, 16, 12);
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

  useFrame(() => {
    if (!eggMeshRef.current || !simState?.penguins) return;

    const penguins = simState.penguins;
    const halfGrid = gridSize / 2;

    for (let i = 0; i < penguins.length; i++) {
      const p = penguins[i];
      const clone = penguinPool[i];

      if (p.state === PENGUIN_STATE.DEAD) {
        clone.visible = false;
        _dummy.position.set(0, -10, 0);
        _dummy.scale.set(0.001, 0.001, 0.001);
        _dummy.updateMatrix();
        eggMeshRef.current.setMatrixAt(i, _dummy.matrix);
        continue;
      }

      clone.visible = true;

      const wx = (p.x - halfGrid) * 0.8;
      const wz = (p.y - halfGrid) * 0.8;
      const wy = getTerrainHeight(wx, wz);
      const rotY = (p.id * 1.37) % (Math.PI * 2);

      clone.position.set(wx, wy, wz);
      clone.scale.set(0.3, 0.3, 0.3);
      clone.rotation.set(0, rotY, 0);

      if (p.state === PENGUIN_STATE.SEARCHING_EGG) {
        clone.rotation.z = Math.sin(Date.now() * 0.005 + p.id) * 0.15;
      }

      const tint = getTempColor(p);
      clone.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const mat of mats) {
            if (mat.userData.originalColor) {
              mat.color.copy(mat.userData.originalColor).multiply(tint);
            }
          }
        }
      });

      if (p.hasEgg && p.state !== PENGUIN_STATE.DEAD && p.state !== PENGUIN_STATE.SEARCHING_EGG) {
        const eggX = wx + Math.sin(rotY) * 0.22;
        const eggZ = wz + Math.cos(rotY) * 0.22;
        _dummy.position.set(eggX, wy + 0.15, eggZ);
        _dummy.scale.set(1, 1, 1);
        _dummy.rotation.set(0, 0, 0);
      } else {
        _dummy.position.set(0, -10, 0);
        _dummy.scale.set(0.001, 0.001, 0.001);
      }
      _dummy.updateMatrix();
      eggMeshRef.current.setMatrixAt(i, _dummy.matrix);
    }

    for (let i = penguins.length; i < maxCount; i++) {
      penguinPool[i].visible = false;
      _dummy.position.set(0, -10, 0);
      _dummy.scale.set(0.001, 0.001, 0.001);
      _dummy.updateMatrix();
      eggMeshRef.current.setMatrixAt(i, _dummy.matrix);
    }

    eggMeshRef.current.instanceMatrix.needsUpdate = true;
    eggMeshRef.current.count = penguins.length;
  });

  return (
    <group>
      {penguinPool.map((clone, i) => (
        <primitive key={i} object={clone} />
      ))}
      <instancedMesh
        ref={eggMeshRef}
        args={[eggGeometry, eggMaterial, maxCount]}
        castShadow
      />
    </group>
  );
}
