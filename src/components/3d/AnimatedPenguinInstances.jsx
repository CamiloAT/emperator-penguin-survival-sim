import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
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

// ─── TAMAÑO AJUSTABLE ────────────────────────────────────────────────────────
// Altura visual deseada del pinguino en unidades world (misma escala que la cuadricula).
// El pinguino procedural mide ~0.9 unidades world.
// Sube este valor para hacerlos mas grandes, bajalo para hacerlos mas pequenos.
const PENGUIN_WORLD_HEIGHT = 0.9;
// ─────────────────────────────────────────────────────────────────────────────

// Altura nativa de cada modelo en sus propias unidades internas (extraida
// directamente de los accessor min/max del archivo GLB con un script de analisis).
// NO usar setFromObject para esto: en un SkinnedMesh recien clonado los huesos
// tienen matrices identidad, por lo que el bounding box colapsa a ~0 y el
// calculo targetSize/maxAxis produce una escala enorme (modelo gigante).
// Altura y centro nativo medido de los accessors del GLB en espacio real.
// Esto permite centrar y escalar los modelos estaticos y animados
// perfectamente sin que orbiten (giro sobre si mismos).
const GLB_METADATA = {
  low_animated: {
    nativeHeight: 100.9882,
    centerX: 0.00,
    centerY: 50.4750,
    centerZ: 3.9418,
    originY: -0.0190,
  },
  premium_animated: {
    nativeHeight: 0.3158,
    centerX: 0.00,
    centerY: -0.1862,
    centerZ: -0.2,
    originY: -0.29,
  },
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

function findClip(anims, names) {
  for (const name of names) {
    const found = anims.find(
      a => a.name.toLowerCase().includes(name.toLowerCase())
    );
    if (found) return found;
  }
  return null;
}

export default function AnimatedPenguinInstances({ simState, gridSize, config }) {
  useEffect(() => {
    if (config?.searchColor) {
      COLORS.searching.set(config.searchColor);
    }
  }, [config?.searchColor]);

  const gltf = useGLTF(config?.penguinModelPath || '/assets/models/penguin.glb');
  const eggMeshRef = useRef();
  const animState = useRef([]);
  const clock = useRef(new THREE.Clock());
  const groupsRef = useRef([]);

  // Para modelos animados, limitamos el pool para evitar colapso de memoria
  // al clonar cientos de SkinnedMesh. El premium pesa 4.8 MB por copia.
  const maxCount = useMemo(() => {
    const colonySize = simState?.colony?.total || 200;
    const hardCap = config?.penguinModel === 'premium_animated' ? 300 : 1000;
    return Math.min(Math.max(colonySize, 50), hardCap);
  }, [simState?.colony?.total, config?.penguinModel]);

  const idleClip = useMemo(() => findClip(gltf.animations, ['idle', 'Idle', 'breath', 'Breath', 'stand', 'Stand']), [gltf.animations]);
  const walkClip = useMemo(() => findClip(gltf.animations, ['walk', 'Walk', 'walking', 'Walking', 'move', 'Move']), [gltf.animations]);
  const sleepClip = useMemo(() => findClip(gltf.animations, ['sleep', 'Sleep', 'sit', 'Sit', 'death', 'Death', 'die', 'Die', 'dead', 'Dead']), [gltf.animations]);

  const penguinPool = useMemo(() => {
    const pool = [];
    const state = [];

    for (let i = 0; i < maxCount; i++) {
      const clone = SkeletonUtils.clone(gltf.scene);
      clone.updateWorldMatrix(true, true);
      clone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material = child.material.map(m => {
                const newMat = m.clone();
                newMat.userData.originalColor = newMat.color.clone();
                return newMat;
              });
            } else {
              const newMat = child.material.clone();
              newMat.userData.originalColor = newMat.color.clone();
              child.material = newMat;
            }
          }
        }
      });

      const mixer = new THREE.AnimationMixer(clone);
      const actions = {};
      if (idleClip) actions.idle = mixer.clipAction(idleClip);
      if (walkClip) actions.walk = mixer.clipAction(walkClip);
      if (sleepClip) actions.sleep = mixer.clipAction(sleepClip);

      if (actions.idle) {
        actions.idle.play();
      } else if (actions.walk) {
        actions.walk.play();
      }

      // Escala hardcodeada: NO usamos setFromObject porque en un SkinnedMesh recien
      // clonado los huesos estan en posicion identidad, lo que da una bbox erronea.
      // En cambio usamos la altura nativa medida directamente de los accessors del GLB.
      const modelType = config?.penguinModel || 'low_animated';
      const meta = GLB_METADATA[modelType] || GLB_METADATA.low_animated;
      const s = PENGUIN_WORLD_HEIGHT / meta.nativeHeight;
      clone.userData.autoScale = s;
      clone.userData.originY = meta.originY;

      // Posicionamos localmente el clon dentro del grupo contenedor para que
      // su centro horizontal esté en 0,0 y su base toque Y = 0.
      // Así, al rotar el grupo contenedor, rotará perfectamente sobre su propio eje.
      clone.position.set(-meta.centerX, -meta.originY, -meta.centerZ);

      // Dejamos el clon visible por defecto ya que controlamos la visibilidad del grupo
      clone.visible = true;
      pool.push(clone);
      state.push({
        prevX: 0, prevY: 0,
        deathTime: 0,
        currentAnim: actions.idle ? 'idle' : (actions.walk ? 'walk' : null),
        mixer, actions,
      });
    }
    animState.current = state;
    return pool;
  }, [gltf.scene, maxCount, idleClip, walkClip, sleepClip, config?.penguinModel]);

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

  function switchAnim(data, name, fadeTime = 0.3) {
    if (!data.actions[name] || data.currentAnim === name) return;
    const prev = data.actions[data.currentAnim];
    const next = data.actions[name];
    if (prev) prev.fadeOut(fadeTime);
    next.reset().fadeIn(fadeTime).play();
    data.currentAnim = name;
  }

  useFrame(() => {
    if (!eggMeshRef.current || !simState?.penguins) return;

    const dt = clock.current.getDelta();
    const penguins = simState.penguins;
    const halfGrid = gridSize / 2;
    const now = Date.now();

    for (let i = 0; i < penguins.length; i++) {
      const p = penguins[i];
      const clone = penguinPool[i];
      const data = animState.current[i];

      if (!clone || !data) continue;

      if (p.state === PENGUIN_STATE.DEAD) {
        if (!data.deathTime) {
          data.deathTime = now;
          switchAnim(data, sleepClip ? 'sleep' : 'idle');
        }
        const elapsed = (now - data.deathTime) / 1000;
        const group = groupsRef.current[i];
        if (group) group.visible = elapsed < 2;
        data.mixer.update(dt);

        _dummy.position.set(0, -10, 0);
        _dummy.scale.set(0.001, 0.001, 0.001);
        _dummy.updateMatrix();
        eggMeshRef.current.setMatrixAt(i, _dummy.matrix);
        continue;
      }
      data.deathTime = 0;

      if (!clone.visible) clone.visible = true;

      const wx = (p.x - halfGrid) * 0.8;
      const wz = (p.y - halfGrid) * 0.8;
      const wy = getTerrainHeight(wx, wz);
      const rotY = (p.id * 1.37) % (Math.PI * 2);

      const moved = Math.sqrt((wx - data.prevX) ** 2 + (wz - data.prevY) ** 2) > 0.01;
      if (moved && walkClip && data.currentAnim !== 'walk') {
        switchAnim(data, 'walk', 0.2);
      } else if (!moved && data.currentAnim === 'walk' && idleClip) {
        switchAnim(data, 'idle', 0.4);
      }
      data.prevX = wx;
      data.prevY = wz;

      const s = clone.userData.autoScale || 0.3;
      const group = groupsRef.current[i];
      if (group) {
        if (!group.visible) group.visible = true;
        group.position.set(wx, wy, wz);
        group.scale.set(s, s, s);
        group.rotation.set(0, rotY, 0);

        if (p.state === PENGUIN_STATE.SEARCHING_EGG) {
          group.rotation.z = Math.sin(now * 0.005 + p.id) * 0.15;
        }
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

      data.mixer.update(dt);

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
      const group = groupsRef.current[i];
      if (group) group.visible = false;
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
        <group key={i} ref={(el) => (groupsRef.current[i] = el)} visible={false}>
          <primitive object={clone} />
        </group>
      ))}
      <instancedMesh
        ref={eggMeshRef}
        args={[eggGeometry, eggMaterial, maxCount]}
        castShadow
      />
    </group>
  );
}
