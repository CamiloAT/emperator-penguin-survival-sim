import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Gauge, X } from 'lucide-react';
import * as THREE from 'three';
import { createPenguinGeometry } from './3d/PenguinModel.jsx';
import { isGlbAvailable } from './3d/gltfAvailability.js';

const MODEL_PATH = '/assets/models/penguin.glb';

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

function SpinningGroup({ children }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.55;
  });

  return <group ref={ref}>{children}</group>;
}

function ProceduralPreview() {
  const geometry = useMemo(() => createPenguinGeometry(), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.05,
    vertexColors: true,
  }), []);

  return (
    <SpinningGroup>
      <mesh geometry={geometry} material={material} castShadow receiveShadow position={[0, -0.25, 0]} />
    </SpinningGroup>
  );
}

function GlbPreview({ path }) {
  const gltf = useGLTF(path);
  const { geometry, material } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateWorldMatrix(true, true);

    const meshes = [];
    cloned.traverse((child) => {
      if (child.isMesh && child.geometry) {
        meshes.push(child);
      }
    });

    if (meshes.length === 0) return { geometry: null, material: null };

    const geos = meshes.map((m) => {
      const g = m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      return g;
    });

    const merged = geos.length === 1 ? geos[0] : mergeBufferGeometries(geos);
    geos.forEach((g) => { if (g !== merged) g.dispose(); });

    merged.computeBoundingBox();
    const box = merged.boundingBox;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const s = 0.95 / maxAxis;
    const transform = new THREE.Matrix4()
      .makeTranslation(-center.x, -box.min.y, -center.z)
      .premultiply(new THREE.Matrix4().makeScale(s, s, s));

    merged.applyMatrix4(transform);
    merged.computeVertexNormals();

    const srcMat = meshes[0].material;
    const mat = (Array.isArray(srcMat) ? srcMat[0] : srcMat).clone();
    mat.vertexColors = false;

    return { geometry: merged, material: mat };
  }, [gltf.scene]);

  if (!geometry || !material) return null;

  return (
    <SpinningGroup>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
    </SpinningGroup>
  );
}

function CharacterPreview({ type, assetAvailable }) {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 2.4], fov: 40 }}
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 4]} intensity={1.35} castShadow />
      <Environment preset="city" />
      <Suspense fallback={null}>
        {type === 'procedural' && <ProceduralPreview />}
        {type === 'sketchfab' && assetAvailable && <GlbPreview path={MODEL_PATH} />}
      </Suspense>
      <ContactShadows position={[0, -0.62, 0]} opacity={0.45} scale={4} blur={2} far={3} />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={0.75} maxPolarAngle={1.65} />
    </Canvas>
  );
}

class PreviewErrorBoundary extends React.Component {
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

const OPTIONS = [
  {
    id: 'procedural',
    name: 'Emperador clasico',
    badge: 'Ligero',
    performance: 'Recomendado para colonias grandes',
    warning: 'Usa geometria procedural instanciada. Es la opcion mas estable y consume menos recursos.',
  },
  {
    id: 'sketchfab',
    name: 'Low Poly Penguin',
    badge: 'Detalle',
    performance: 'Puede exigir mas si subes mucho la colonia',
    warning: 'Modelo externo por Noah Hahn bajo CC Attribution. Si el equipo se siente lento, vuelve al clasico.',
  },
];

export default function CharacterSelectModal({ isOpen, onClose, config, setConfig, viewMode }) {
  const [assetAvailable, setAssetAvailable] = useState(false);
  const [checkingAsset, setCheckingAsset] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = OPTIONS.findIndex(o => o.id === (config?.penguinModel || 'procedural'));
    return idx >= 0 ? idx : 0;
  });
  const selected = config?.penguinModel || 'procedural';

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setCheckingAsset(true);

    isGlbAvailable(MODEL_PATH)
      .then((available) => {
        if (!cancelled) setAssetAvailable(available);
      })
      .catch(() => {
        if (!cancelled) setAssetAvailable(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingAsset(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const current = OPTIONS[currentIndex];
  const isSelected = selected === current.id;
  const disabled = (current.id === 'sketchfab' && !assetAvailable) || viewMode === '2d';

  const handlePrev = () => {
    setCurrentIndex(i => (i - 1 + OPTIONS.length) % OPTIONS.length);
  };

  const handleNext = () => {
    setCurrentIndex(i => (i + 1) % OPTIONS.length);
  };

  const handleSelect = (modelId) => {
    if (modelId === 'sketchfab' && !assetAvailable) return;
    if (viewMode === '2d') return;

    setConfig(prev => ({
      ...prev,
      penguinModel: modelId,
      penguinModelPath: MODEL_PATH,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="results-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="results-card character-modal">
        <div className="character-modal__header">
          <div>
            <h2 className="character-modal__title">Seleccionar Pinguino</h2>
            <p className="character-modal__subtitle">Elige el personaje visible en la colonia 3D.</p>
          </div>
          <button className="btn btn--ghost character-modal__close" onClick={onClose} title="Cerrar">
            <X size={16} />
          </button>
        </div>

        {viewMode === '2d' && (
          <div style={{
            background: 'var(--accent-orange)',
            color: '#000',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={14} />
            Cambia a vista 3D para seleccionar el modelo de pingüino
          </div>
        )}

        <div className="character-carousel">
          <button
            type="button"
            className="character-carousel__arrow"
            onClick={handlePrev}
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="character-carousel__preview">
            <PreviewErrorBoundary
              resetKey={`${current.id}-${assetAvailable}`}
              fallback={<div className="character-card__missing">Modelo incompleto</div>}
            >
              <CharacterPreview type={current.id} assetAvailable={assetAvailable} />
            </PreviewErrorBoundary>
            {disabled && (
              <div className="character-card__missing">
                {checkingAsset && current.id === 'sketchfab' ? 'Buscando modelo...' : 'Falta el archivo .glb'}
              </div>
            )}
          </div>

          <button
            type="button"
            className="character-carousel__arrow"
            onClick={handleNext}
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="character-carousel__info">
          <div className="character-carousel__topline">
            <span className="character-card__name">{current.name}</span>
            <span className="character-card__badge">{current.badge}</span>
            {isSelected && (
              <span className="character-card__check">
                <Check size={14} /> Seleccionado
              </span>
            )}
          </div>
          <span className="character-card__perf">
            <Gauge size={13} /> {current.performance}
          </span>
          <span className="character-card__warning">
            <AlertTriangle size={13} /> {current.warning}
          </span>
          <button
            type="button"
            className={`btn btn--full ${isSelected ? 'btn--ghost' : 'btn--primary'}`}
            onClick={() => handleSelect(current.id)}
            disabled={disabled}
            style={{ marginTop: '0.75rem' }}
          >
            {isSelected ? 'Seleccionado' : 'Seleccionar este modelo'}
          </button>
        </div>

        <button className="btn btn--primary btn--full" onClick={onClose}>
          Listo
        </button>
      </div>
    </div>
  );
}
