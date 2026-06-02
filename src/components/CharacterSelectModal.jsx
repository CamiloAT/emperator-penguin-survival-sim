import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Gauge, X } from 'lucide-react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { createPenguinGeometry } from './3d/PenguinModel.jsx';
import { isGlbAvailable } from '../utils/gltfAvailability.js';

// Tamaño objetivo en el viewport de preview (unidades world de la camara del modal)
const PREVIEW_TARGET_SIZE = {
  sketchfab: 1.4,
  low_animated: 1.2,
  premium_animated: 1.2,
};

// Altura y centro nativo medido de los accessors del GLB.
// Esto permite centrar y escalar los modelos estaticos y animados
// perfectamente sin clonar la escena (evitando bugs de SkinnedMesh).
// Nota: Para premium_animated dividimos por 100 para contrarrestar
// la escala de 100x del nodo Armature interna del modelo.
const GLB_METADATA = {
  sketchfab: {
    nativeHeight: 5.14,
    centerX: -0.24,
    centerY: 2.03,
    centerZ: 0.00,
    originY: 2.03,
    resetColors: false,      // Modelo estático: conservar sus colores originales
    initialRotation: Math.PI * 0.5, // Angulo en radianes — 0=espalda, PI=frente, PI/2=izquierda
  },
  low_animated: {
    nativeHeight: 100.9882,
    centerX: 0.00,
    centerY: 50.4750,
    centerZ: 3.9418,
    originY: 50.4750,
    resetColors: true,       // Animado: resetear a blanco para evitar contaminacion del grid
    initialRotation: Math.PI * 2, // 180° desde la orientacion original (de frente)
  },
  premium_animated: {
    nativeHeight: 0.39,
    centerX: 0.00,
    centerY: -0.1862,
    centerZ: -0.2,
    originY: -0.09,
    resetColors: true,       // Animado: resetear a blanco para evitar contaminacion del grid
    initialRotation: Math.PI * 2, // 180° desde la orientacion original (de frente)
  },
};

function SpinningGroup({ children, initialRotation = Math.PI * 2, frozen = false }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) ref.current.rotation.y = initialRotation;
  }, [initialRotation]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (!frozen) {
      ref.current.rotation.y += delta * 0.55;
    } else {
      // Volver suavemente al ángulo frontal cuando está congelado
      const diff = initialRotation - ref.current.rotation.y;
      const normalized = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      ref.current.rotation.y += normalized * Math.min(delta * 5, 1);
    }
  });

  return <group ref={ref}>{children}</group>;
}

function ProceduralPreview({ frozen }) {
  const geometry = useMemo(() => createPenguinGeometry(), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.05,
    vertexColors: true,
  }), []);

  return (
    <SpinningGroup frozen={frozen}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow position={[0, -0.19, 0]} />
    </SpinningGroup>
  );
}

function GlbPreview({ type, path, frozen }) {
  const gltf = useGLTF(path);
  const mixerRef = useRef(null);

  // Creamos un clon independiente de la escena para el preview.
  // Esto es CRÍTICO: si usamos gltf.scene directamente, el AnimationMixer
  // del preview y el de la simulación comparten los mismos huesos, causando
  // que los colores y las deformaciones del grid se propaguen aquí y viceversa.
  const previewClone = useMemo(() => {
    const clone = SkeletonUtils.clone(gltf.scene);
    const meta = GLB_METADATA[type];
    // Solo resetear colores en modelos animados que comparten materiales con la simulacion.
    // Para modelos estaticos (sketchfab) conservamos sus colores originales del GLB.
    const shouldReset = meta?.resetColors ?? false;
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (shouldReset && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => {
            m.color.set('#ffffff');
          });
        }
      }
    });
    return clone;
  }, [gltf.scene, type]);

  // AnimationMixer ligado al clon, no a la escena original
  useEffect(() => {
    if (!gltf.animations || gltf.animations.length === 0) return;

    const mixer = new THREE.AnimationMixer(previewClone);
    mixerRef.current = mixer;

    const findClip = (clips, names) => {
      for (const name of names) {
        const found = clips.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
      }
      return clips[0];
    };

    const clipNames = type === 'premium_animated'
      ? ['Bray', 'bray']
      : ['idle', 'Idle', 'stand', 'Stand', 'breath', 'Breath', 'walk', 'Walk'];
    const clip = findClip(gltf.animations, clipNames);
    if (clip) {
      const action = mixer.clipAction(clip);
      action.play();
    }

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(previewClone);
    };
  }, [gltf, previewClone]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  const meta = GLB_METADATA[type];
  if (!meta) return null;

  const targetSize = PREVIEW_TARGET_SIZE[type] || 1.0;
  const s = targetSize / meta.nativeHeight;
  const yOffset = meta.originY !== undefined ? meta.originY : meta.centerY;

  return (
    <SpinningGroup initialRotation={meta.initialRotation ?? Math.PI} frozen={frozen}>
      <group scale={[s, s, s]}>
        <primitive
          object={previewClone}
          position={[-meta.centerX, -yOffset, -meta.centerZ]}
        />
      </group>
    </SpinningGroup>
  );
}

function CharacterPreview({ type, assetAvailable, path, frozen }) {
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
        {type === 'procedural' && <ProceduralPreview frozen={frozen} />}
        {type !== 'procedural' && assetAvailable && path && <GlbPreview type={type} path={path} frozen={frozen} />}
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
    glbPath: null,
  },
  {
    id: 'sketchfab',
    name: 'Low Poly Penguin',
    badge: 'Detalle',
    performance: 'Puede exigir mas si subes mucho la colonia',
    warning: 'Modelo externo por Noah Hahn bajo CC Attribution. Si el equipo se siente lento, vuelve al clasico.',
    glbPath: '/assets/models/penguin.glb',
  },
  {
    id: 'low_animated',
    name: 'Pinguino Animado Low',
    badge: 'Animado',
    performance: 'Con animaciones basicas. Modelo mas ligero que el premium.',
    warning: 'Modelo low-poly animado. Consume mas recursos que un modelo estatico por las animaciones en tiempo real. Reduce el tamano de colonia si notas lentitud.',
    glbPath: '/assets/models/penguin_low_animated.glb',
  },
  {
    id: 'premium_animated',
    name: 'Pinguino Animado Premium',
    badge: 'Premium',
    performance: 'Animaciones completas (caminar, dormir). Alta calidad.',
    warning: 'Modelo de alta calidad con multiples animaciones. MUY exigente en recursos. Solo recomendado para colonias pequenas (< 50 pinguinos) o equipos con GPU potente.',
    glbPath: '/assets/models/penguin_premium_animated.glb',
  },
];

export default function CharacterSelectModal({ isOpen, onClose, config, setConfig, viewMode }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = OPTIONS.findIndex(o => o.id === (config?.penguinModel || 'procedural'));
    return idx >= 0 ? idx : 0;
  });
  const [frozen, setFrozen] = useState(false);
  const selected = config?.penguinModel || 'procedural';

  const current = OPTIONS[currentIndex];
  const isSelected = selected === current.id;
  const hasGlb = !!current.glbPath;

  const [assetAvailable, setAssetAvailable] = useState(!hasGlb);
  const [checkingAsset, setCheckingAsset] = useState(false);

  useEffect(() => {
    if (!isOpen || !hasGlb) {
      setAssetAvailable(true);
      return;
    }

    let cancelled = false;
    setCheckingAsset(true);

    isGlbAvailable(current.glbPath)
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
  }, [isOpen, currentIndex, hasGlb, current.glbPath]);

  const disabled = (hasGlb && !assetAvailable) || viewMode === '2d';

  const handlePrev = () => {
    setCurrentIndex(i => (i - 1 + OPTIONS.length) % OPTIONS.length);
  };

  const handleNext = () => {
    setCurrentIndex(i => (i + 1) % OPTIONS.length);
  };

  const handleSelect = (modelId) => {
    if (viewMode === '2d') return;
    const option = OPTIONS.find(o => o.id === modelId);
    if (!option) return;
    if (option.glbPath && !assetAvailable) return;

    setConfig(prev => ({
      ...prev,
      penguinModel: modelId,
      penguinModelPath: option.glbPath || '',
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

          <div className="character-carousel__preview" style={{ position: 'relative' }}>
            <PreviewErrorBoundary
              resetKey={`${current.id}-${assetAvailable}`}
              fallback={<div className="character-card__missing">Modelo incompleto</div>}
            >
              <CharacterPreview type={current.id} assetAvailable={assetAvailable} path={current.glbPath} frozen={frozen} />
            </PreviewErrorBoundary>
            {disabled && (
              <div className="character-card__missing">
                {checkingAsset ? 'Buscando modelo...' : 'Falta el archivo .glb'}
              </div>
            )}
            {/* Botón de congelar rotación */}
            <button
              type="button"
              onClick={() => setFrozen(f => !f)}
              title={frozen ? 'Reanudar rotación' : 'Ver de frente (pausar rotación)'}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: frozen ? 'var(--accent-cyan)' : 'rgba(10, 15, 30, 0.72)',
                border: `1.5px solid ${frozen ? 'var(--accent-cyan)' : 'rgba(180, 210, 255, 0.55)'}`,
                borderRadius: '8px',
                color: frozen ? '#000' : '#d0e8ff',
                padding: '5px 10px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.03em',
                textShadow: frozen ? 'none' : '0 0 6px rgba(120,180,255,0.5)',
              }}
            >
              {frozen ? '▶ Girar' : '⏸ De frente'}
            </button>
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
