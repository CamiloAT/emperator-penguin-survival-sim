import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Gauge, X } from 'lucide-react';
import * as THREE from 'three';
import { createPenguinGeometry } from './3d/PenguinModel.jsx';
import { isGlbAvailable } from '../utils/gltfAvailability.js';

const MODEL_PATH = '/assets/models/penguin.glb';

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
      <mesh geometry={geometry} material={material} castShadow receiveShadow position={[0, -0.19, 0]} />
    </SpinningGroup>
  );
}

function GlbPreview({ path }) {
  const gltf = useGLTF(path);
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateWorldMatrix(true, true);

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const s = 1.4 / maxAxis;

    cloned.position.set(-center.x, -box.min.y -1.1, -center.z);
    cloned.scale.set(s, s, s);

    return cloned;
  }, [gltf.scene]);

  return (
    <SpinningGroup>
      <primitive object={scene} />
    </SpinningGroup>
  );
}

function CharacterPreview({ type, assetAvailable }) {
  return (
    <Canvas
      camera={{ position: [0, 1, 2.0], fov: 40 }}
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
      <ContactShadows position={[0, -2.2, 0]} opacity={0.45} scale={7} blur={2} far={5} />
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
