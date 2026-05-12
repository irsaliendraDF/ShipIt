// Normalize landmarks so pose recognition is position/scale/rotation invariant.
//
// 1. Translate so wrist (0) is at origin.
// 2. Scale so |wrist→middle_mcp(9)| = 1.
// 3. Rotate so the palm normal points along +Z (canonical), AND the
//    wrist→middle_mcp axis points along +Y. Builds a hand-local basis from
//    those two vectors and applies its inverse rotation.
//
// Output: Float32Array(63) — flat x,y,z per landmark.

import * as THREE from 'three';

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _z = new THREE.Vector3();
const _basis = new THREE.Matrix4();

export function normalizeLandmarks(landmarks) {
  const out = new Float32Array(landmarks.length * 3);
  if (landmarks.length < 21) return out;

  const wrist = landmarks[0];
  const mcp = landmarks[9];
  const idxMcp = landmarks[5];
  const pinkyMcp = landmarks[17];

  // 1. translate
  const ox = wrist.x, oy = wrist.y, oz = wrist.z || 0;
  // 2. scale
  const dx = mcp.x - ox, dy = mcp.y - oy, dz = (mcp.z || 0) - oz;
  const scale = 1 / Math.max(1e-4, Math.hypot(dx, dy, dz));

  // 3. build hand basis
  // Y axis = wrist→mcp(9) (already computed)
  const yAxis = new THREE.Vector3(dx, dy, dz).normalize();
  // X axis = wrist→indexMcp - projection onto Y
  const ix = idxMcp.x - ox, iy = idxMcp.y - oy, iz = (idxMcp.z || 0) - oz;
  const xRaw = new THREE.Vector3(ix, iy, iz);
  xRaw.sub(yAxis.clone().multiplyScalar(xRaw.dot(yAxis))).normalize();
  // Z axis = X × Y (right-handed)
  const zAxis = new THREE.Vector3().crossVectors(xRaw, yAxis).normalize();
  // For LEFT hand the cross handedness flips; canonicalize by checking pinky
  // side. If pinky is on -X side after rotation, flip X+Z.
  // (Simpler approach: dot the pinky direction with X axis; if negative, flip.)
  const px = pinkyMcp.x - ox, py = pinkyMcp.y - oy, pz = (pinkyMcp.z || 0) - oz;
  const pinkyVec = new THREE.Vector3(px, py, pz);
  if (pinkyVec.dot(xRaw) > 0) { xRaw.multiplyScalar(-1); zAxis.multiplyScalar(-1); }

  // basis matrix columns = local axes; we want WORLD→LOCAL = transpose
  _basis.makeBasis(xRaw, yAxis, zAxis).transpose();

  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    _v.set(lm.x - ox, lm.y - oy, (lm.z || 0) - oz).multiplyScalar(scale).applyMatrix4(_basis);
    out[i * 3 + 0] = _v.x;
    out[i * 3 + 1] = _v.y;
    out[i * 3 + 2] = _v.z;
  }
  return out;
}
