/**
 * PenguinModel.jsx
 * Procedural Emperor Penguin geometry with baked vertex colors.
 * Each body part has its natural color assigned directly to vertex colors,
 * so the penguin looks like a real emperor penguin (black body, white belly,
 * orange beak/feet, yellow ear patches, eyes).
 */
import { useMemo } from 'react';
import * as THREE from 'three';

// Emperor penguin color palette
const BODY_COLOR = new THREE.Color('#0d0d14');       // Near-black body
const BELLY_COLOR = new THREE.Color('#f0e8d8');       // Creamy white belly
const HEAD_COLOR = new THREE.Color('#08080f');         // Dark head
const EAR_PATCH_COLOR = new THREE.Color('#f0a030');   // Golden-yellow ear patches
const BEAK_COLOR = new THREE.Color('#e87a20');         // Orange beak
const FOOT_COLOR = new THREE.Color('#d08030');         // Orange-yellow feet
const FLIPPER_COLOR = new THREE.Color('#0a0a14');      // Very dark flippers
const EYE_WHITE = new THREE.Color('#ffffff');           // White of eye
const EYE_PUPIL = new THREE.Color('#050505');           // Black pupil
const CHEST_YELLOW = new THREE.Color('#ffd250');       // Yellow upper chest gradient

/**
 * Assigns a flat color to all vertices of a geometry.
 */
function assignVertexColor(geo, color, isEye = false) {
  const count = geo.attributes.position.count;
  const colors = new Float32Array(count * 3);
  const isEyeArray = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    isEyeArray[i] = isEye ? 1.0 : 0.0;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('isEye', new THREE.BufferAttribute(isEyeArray, 1));
}

/**
 * Creates a fully colored penguin geometry by merging colored body parts.
 */
export function createPenguinGeometry() {
  const parts = [];
  const mat4 = new THREE.Matrix4();

  // === Body (black) ===
  const body = new THREE.SphereGeometry(0.35, 12, 10);
  body.scale(1, 1.4, 0.9);
  mat4.makeTranslation(0, 0.1, 0);
  body.applyMatrix4(mat4);
  assignVertexColor(body, BODY_COLOR);
  parts.push(body);

  // === Belly (creamy white) ===
  const belly = new THREE.SphereGeometry(0.26, 10, 8);
  belly.scale(0.85, 1.2, 0.6);
  mat4.makeTranslation(0, 0.15, 0.15);
  belly.applyMatrix4(mat4);
  assignVertexColor(belly, BELLY_COLOR);
  parts.push(belly);

  // === Upper chest yellow patch ===
  const chest = new THREE.SphereGeometry(0.18, 8, 6);
  chest.scale(0.9, 0.6, 0.5);
  mat4.makeTranslation(0, 0.4, 0.18);
  chest.applyMatrix4(mat4);
  assignVertexColor(chest, CHEST_YELLOW);
  parts.push(chest);

  // === Head (black) ===
  const head = new THREE.SphereGeometry(0.22, 10, 8);
  mat4.makeTranslation(0, 0.65, 0);
  head.applyMatrix4(mat4);
  assignVertexColor(head, HEAD_COLOR);
  parts.push(head);

  // === Left ear patch (golden-yellow) ===
  const earL = new THREE.SphereGeometry(0.08, 6, 5);
  earL.scale(0.9, 1.5, 0.6);
  mat4.makeTranslation(-0.15, 0.58, 0.05);
  earL.applyMatrix4(mat4);
  assignVertexColor(earL, EAR_PATCH_COLOR);
  parts.push(earL);

  // === Right ear patch (golden-yellow) ===
  const earR = new THREE.SphereGeometry(0.08, 6, 5);
  earR.scale(0.9, 1.5, 0.6);
  mat4.makeTranslation(0.15, 0.58, 0.05);
  earR.applyMatrix4(mat4);
  assignVertexColor(earR, EAR_PATCH_COLOR);
  parts.push(earR);

  // === Left eye (white) ===
  const eyeL = new THREE.SphereGeometry(0.04, 6, 4);
  mat4.makeTranslation(-0.1, 0.7, 0.16);
  eyeL.applyMatrix4(mat4);
  assignVertexColor(eyeL, EYE_WHITE, true);
  parts.push(eyeL);

  // === Right eye (white) ===
  const eyeR = new THREE.SphereGeometry(0.04, 6, 4);
  mat4.makeTranslation(0.1, 0.7, 0.16);
  eyeR.applyMatrix4(mat4);
  assignVertexColor(eyeR, EYE_WHITE, true);
  parts.push(eyeR);

  // === Left pupil (black) ===
  const pupilL = new THREE.SphereGeometry(0.022, 5, 4);
  mat4.makeTranslation(-0.1, 0.7, 0.2);
  pupilL.applyMatrix4(mat4);
  assignVertexColor(pupilL, EYE_PUPIL, true);
  parts.push(pupilL);

  // === Right pupil (black) ===
  const pupilR = new THREE.SphereGeometry(0.022, 5, 4);
  mat4.makeTranslation(0.1, 0.7, 0.2);
  pupilR.applyMatrix4(mat4);
  assignVertexColor(pupilR, EYE_PUPIL, true);
  parts.push(pupilR);

  // === Beak (orange) ===
  const beak = new THREE.ConeGeometry(0.055, 0.13, 6);
  beak.rotateX(Math.PI / 2);
  mat4.makeTranslation(0, 0.6, 0.22);
  beak.applyMatrix4(mat4);
  assignVertexColor(beak, BEAK_COLOR);
  parts.push(beak);

  // === Left flipper (dark) ===
  const flipperL = new THREE.SphereGeometry(0.07, 6, 4);
  flipperL.scale(0.5, 2.0, 0.35);
  mat4.makeTranslation(-0.38, 0.12, 0);
  flipperL.applyMatrix4(mat4);
  mat4.makeRotationZ(0.2);
  flipperL.applyMatrix4(mat4);
  assignVertexColor(flipperL, FLIPPER_COLOR);
  parts.push(flipperL);

  // === Right flipper (dark) ===
  const flipperR = new THREE.SphereGeometry(0.07, 6, 4);
  flipperR.scale(0.5, 2.0, 0.35);
  mat4.makeTranslation(0.38, 0.12, 0);
  flipperR.applyMatrix4(mat4);
  mat4.makeRotationZ(-0.2);
  flipperR.applyMatrix4(mat4);
  assignVertexColor(flipperR, FLIPPER_COLOR);
  parts.push(flipperR);

  // === Left foot (orange) ===
  const footL = new THREE.SphereGeometry(0.06, 6, 4);
  footL.scale(1.5, 0.4, 1.8);
  mat4.makeTranslation(-0.12, -0.42, 0.08);
  footL.applyMatrix4(mat4);
  assignVertexColor(footL, FOOT_COLOR);
  parts.push(footL);

  // === Right foot (orange) ===
  const footR = new THREE.SphereGeometry(0.06, 6, 4);
  footR.scale(1.5, 0.4, 1.8);
  mat4.makeTranslation(0.12, -0.42, 0.08);
  footR.applyMatrix4(mat4);
  assignVertexColor(footR, FOOT_COLOR);
  parts.push(footR);

  // Merge all into one geometry
  const merged = mergeColoredGeometries(parts);
  parts.forEach(g => g.dispose());
  
  return merged;
}

/**
 * Merge geometries preserving vertex colors.
 */
function mergeColoredGeometries(geos) {
  let totalVerts = 0;
  let totalIndices = 0;
  for (const g of geos) {
    totalVerts += g.attributes.position.count;
    totalIndices += g.index ? g.index.count : g.attributes.position.count;
  }

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const colors = new Float32Array(totalVerts * 3);
  const isEye = new Float32Array(totalVerts);
  const indices = [];

  let vertOffset = 0;
  let idxOffset = 0;

  for (const g of geos) {
    const pos = g.attributes.position;
    const norm = g.attributes.normal;
    const col = g.attributes.color;
    const idx = g.index;

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
      if (col) {
        colors[vi] = col.getX(i);
        colors[vi + 1] = col.getY(i);
        colors[vi + 2] = col.getZ(i);
      }
      if (g.attributes.isEye) {
        isEye[vertOffset + i] = g.attributes.isEye.getX(i);
      }
    }

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
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  merged.setAttribute('isEye', new THREE.BufferAttribute(isEye, 1));
  
  if (totalVerts > 65535) {
    merged.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
  } else {
    merged.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  }
  
  merged.computeVertexNormals();
  return merged;
}

/**
 * Hook: returns a memoized penguin geometry with baked vertex colors
 */
export function usePenguinGeometry() {
  return useMemo(() => createPenguinGeometry(), []);
}
