export async function isGlbAvailable(path) {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) return false;

    const header = await response.arrayBuffer();
    if (header.byteLength < 12) return false;

    const view = new DataView(header);
    const magic = view.getUint32(0, true);
    const gltfMagic = 0x46546C67;

    return magic === gltfMagic;
  } catch {
    return false;
  }
}
