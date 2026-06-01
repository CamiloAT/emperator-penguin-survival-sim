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

function mergeBufferGeometries(geos) {
  let totalVerts = 0;
  let totalIndices = 0;
  const hasColors = geos.some(g => g.attributes.color);
  for (const g of geos) {
    totalVerts += g.attributes.position.count;
    totalIndices += g.index ? g.index.count : g.attributes.position.count;
  }

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const uvs = new Float32Array(totalVerts * 2);
  const colors = hasColors ? new Float32Array(totalVerts * 3) : null;
  const indices = [];

  let vertOffset = 0;
  for (const g of geos) {
    const pos = g.attributes.position;
    const norm = g.attributes.normal;
    const uv = g.attributes.uv;
    const col = g.attributes.color;

    for (let i = 0; i < pos.count; i++) {
      const vi = (vertOffset + i) * 3;
      positions[vi] = pos.getX(i);
      positions[vi + 1] = pos.getY(i);
      positions[vi + 2] = pos.getZ(i);
      if (norm) {
        normals[vi] = norm.getX(i);
        normals[vi + 1] = norm.getY(i);
        normals[vi + 2] = norm.getZ(i);
      }
      if (uv) {
        const uvi = (vertOffset + i) * 2;
        uvs[uvi] = uv.getX(i);
        uvs[uvi + 1] = uv.getY(i);
      }
      if (col && colors) {
        colors[vi] = col.getX(i);
        colors[vi + 1] = col.getY(i);
        colors[vi + 2] = col.getZ(i);
      }
    }

    const idx = g.index;
    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.getX(i) + vertOffset);
      }
    } else {
      for (let i = 0; i < pos.count; i++) {
        indices.push(i + vertOffset);
      }
    }

    vertOffset += pos.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  if (uvs.some(v => v !== 0)) {
    merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }
  if (colors) {
    merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  if (totalVerts > 65535) {
    merged.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
  } else {
    merged.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  }

  merged.computeVertexNormals();
  return merged;
}

function useImportedPenguinAsset(modelPath) {
  const gltf = useGLTF(modelPath);

  return useMemo(() => {
    gltf.scene.updateWorldMatrix(true, true);

    const meshes = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.geometry) {
        meshes.push(child);
      }
    });

    if (meshes.length === 0) return null;

    const geos = meshes.map((m) => {
      const g = m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      return g;
    });

    const geometry = geos.length === 1 ? geos[0] : mergeBufferGeometries(geos);
    geos.forEach((g) => { if (g !== geometry) g.dispose(); });

    geometry.computeBoundingBox();

    const box = geometry.boundingBox;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = 0.95 / maxAxis;
    const transform = new THREE.Matrix4()
      .makeTranslation(-center.x, -box.min.y, -center.z)
      .premultiply(new THREE.Matrix4().makeScale(scale, scale, scale));

    geometry.applyMatrix4(transform);
    geometry.computeVertexNormals();

    const firstMaterial = meshes[0].material;
    const material = Array.isArray(firstMaterial)
      ? firstMaterial[0].clone()
      : firstMaterial.clone();

    material.vertexColors = false;

    return { geometry, material };
  }, [gltf, modelPath]);
}

export default function ImportedPenguinInstances({ simState, gridSize, config }) {
  useEffect(() => {
    if (config?.searchColor) {
      COLORS.searching.set(config.searchColor);
    }
  }, [config?.searchColor]);

  const meshRef = useRef();
  const eggMeshRef = useRef();
  const asset = useImportedPenguinAsset(config?.penguinModelPath || '/assets/models/penguin.glb');

  const maxCount = useMemo(() => {
    return Math.max(simState?.colony?.total || 200, 1000);
  }, [simState?.colony?.total]);

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
    if (!meshRef.current || !eggMeshRef.current || !simState?.penguins) return;

    const penguins = simState.penguins;
    const halfGrid = gridSize / 2;

    for (let i = 0; i < penguins.length; i++) {
      const p = penguins[i];

      if (p.state === PENGUIN_STATE.DEAD) {
        _dummy.position.set(0, -10, 0);
        _dummy.scale.set(0.001, 0.001, 0.001);
      } else {
        const wx = (p.x - halfGrid) * 0.8;
        const wz = (p.y - halfGrid) * 0.8;
        const wy = getTerrainHeight(wx, wz);
        const rotY = (p.id * 1.37) % (Math.PI * 2);

        _dummy.position.set(wx, wy, wz);
        _dummy.scale.set(1.15, 1.15, 1.15);
        _dummy.rotation.set(0, rotY, 0);

        if (p.state === PENGUIN_STATE.SEARCHING_EGG) {
          _dummy.rotation.z = Math.sin(Date.now() * 0.005 + p.id) * 0.15;
        }
      }

      _dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, _dummy.matrix);
      meshRef.current.setColorAt(i, getTempColor(p));

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
      meshRef.current.setMatrixAt(i, _dummy.matrix);
      eggMeshRef.current.setMatrixAt(i, _dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    meshRef.current.count = penguins.length;

    eggMeshRef.current.instanceMatrix.needsUpdate = true;
    eggMeshRef.current.count = penguins.length;
  });

  if (!asset) return null;

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[asset.geometry, asset.material, maxCount]}
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
