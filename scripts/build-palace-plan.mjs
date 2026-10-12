// Top-down floor plan of the memory-palace model, as SVG paths, so the palace
// renders as a quiet line drawing without shipping a 3D engine.
import { readFileSync, writeFileSync } from "node:fs";
const glb = readFileSync("design/palace/south-light-shanghai-50.glb");
const jsonLength = glb.readUInt32LE(12);
const gltf = JSON.parse(glb.subarray(20, 20 + jsonLength).toString());
const bin = glb.subarray(20 + jsonLength + 8);
const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
const read = (index) => {
  const a = gltf.accessors[index], v = gltf.bufferViews[a.bufferView];
  const size = { SCALAR: 1, VEC3: 3 }[a.type];
  const bytes = { 5126: 4, 5123: 2, 5125: 4 }[a.componentType];
  const get = { 5126: (o) => view.getFloat32(o, true), 5123: (o) => view.getUint16(o, true), 5125: (o) => view.getUint32(o, true) }[a.componentType];
  const base = (v.byteOffset ?? 0) + (a.byteOffset ?? 0), stride = v.byteStride ?? size * bytes;
  const out = [];
  for (let i = 0; i < a.count; i++) for (let k = 0; k < size; k++) out.push(get(base + i * stride + k * bytes));
  return out;
};
const meshes = {};
let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
for (const node of gltf.nodes) {
  const prim = gltf.meshes[node.mesh].primitives[0];
  const pos = read(prim.attributes.POSITION), idx = prim.indices !== undefined ? read(prim.indices) : pos.map((_, i) => i);
  const t = node.translation ?? [0, 0, 0];
  const tris = [];
  for (let i = 0; i < idx.length; i += 3) {
    const pts = [idx[i], idx[i + 1], idx[i + 2]].map((j) => [pos[j * 3] + t[0], pos[j * 3 + 2] + t[2]]);
    const area = Math.abs((pts[1][0] - pts[0][0]) * (pts[2][1] - pts[0][1]) - (pts[2][0] - pts[0][0]) * (pts[1][1] - pts[0][1]));
    if (area < 1e-6) continue; // vertical faces collapse to lines from above
    for (const [x, z] of pts) [minX, maxX, minZ, maxZ] = [Math.min(minX, x), Math.max(maxX, x), Math.min(minZ, z), Math.max(maxZ, z)];
    tris.push(pts);
  }
  meshes[node.name] = tris;
}
const S = 100, fx = (x) => ((x - minX) * S).toFixed(1), fz = (z) => ((z - minZ) * S).toFixed(1);
const path = (tris) => tris.map((p) => `M${fx(p[0][0])} ${fz(p[0][1])}L${fx(p[1][0])} ${fz(p[1][1])}L${fx(p[2][0])} ${fz(p[2][1])}Z`).join("");
const plan = {
  width: Math.round((maxX - minX) * S),
  height: Math.round((maxZ - minZ) * S),
  floor: path(meshes.Base ?? []),
  walls: path(meshes.Walls ?? []),
};
writeFileSync("data/palace-plan.json", JSON.stringify(plan) + "\n");
console.log(`Palace plan ${plan.width}×${plan.height}, ${meshes.Walls?.length ?? 0} wall triangles.`);
