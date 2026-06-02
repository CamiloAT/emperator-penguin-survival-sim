/**
 * gltfAvailability.js
 * Checks if a GLTF/GLB model is available to avoid React Three Fiber crashes.
 */
export async function isGlbAvailable(path) {
  if (!path) return false;

  // Si es uno de nuestros modelos integrados, sabemos que existe y esta listo en public/
  const knownModels = [
    '/assets/models/penguin.glb',
    '/assets/models/penguin_low_animated.glb',
    '/assets/models/penguin_premium_animated.glb'
  ];
  if (knownModels.includes(path)) {
    return true;
  }

  try {
    // Para otros modelos, hacemos una peticion HEAD rapida para verificar existencia sin descargar el archivo
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch {
    try {
      // Fallback a GET si HEAD no esta soportado por el servidor, pero sin leer el body
      const response = await fetch(path);
      return response.ok;
    } catch {
      return false;
    }
  }
}
