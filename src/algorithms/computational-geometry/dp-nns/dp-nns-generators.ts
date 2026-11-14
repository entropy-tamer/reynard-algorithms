import type { Point2D } from "./dp-nns-types";

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRingManifold3D(count: number, seed = 1, radius = 0.7, thickness = 0.18, zSpan = 0.8): Point3D[] {
  const rnd = mulberry32(seed);
  const pts: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    const t = rnd() * Math.PI * 2;
    const r = radius + (rnd() - 0.5) * 2 * thickness;
    pts.push({
      x: Math.cos(t) * r + (rnd() - 0.5) * 0.04,
      y: Math.sin(t) * r + (rnd() - 0.5) * 0.04,
      z: (rnd() - 0.5) * zSpan,
    });
  }
  return pts;
}

export function generateSphereSurface3D(count: number, seed = 1, radius = 0.8, jitter = 0.02): Point3D[] {
  const rnd = mulberry32(seed);
  const pts: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    const u = rnd() * 2 - 1;
    const theta = rnd() * Math.PI * 2;
    const sr = Math.sqrt(Math.max(0, 1 - u * u));
    const rr = radius + (rnd() - 0.5) * 2 * jitter;
    pts.push({ x: rr * sr * Math.cos(theta), y: rr * sr * Math.sin(theta), z: rr * u });
  }
  return pts;
}

export function generateTorusSurface3D(count: number, seed = 1, R = 0.6, r = 0.22, jitter = 0.01): Point3D[] {
  const rnd = mulberry32(seed);
  const pts: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    const u = rnd() * Math.PI * 2;
    const v = rnd() * Math.PI * 2;
    const rr = r + (rnd() - 0.5) * 2 * jitter;
    pts.push({
      x: (R + rr * Math.cos(v)) * Math.cos(u),
      y: (R + rr * Math.cos(v)) * Math.sin(u),
      z: rr * Math.sin(v),
    });
  }
  return pts;
}

export function generateSaddleSurface3D(count: number, seed = 1, scale = 0.9, curvature = 0.7): Point3D[] {
  const rnd = mulberry32(seed);
  const pts: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    const x = (rnd() * 2 - 1) * scale;
    const y = (rnd() * 2 - 1) * scale;
    const z = curvature * (x * x - y * y) * 0.6 + (rnd() - 0.5) * 0.05;
    pts.push({ x, y, z });
  }
  return pts;
}

export function generateGaussianHillSurface3D(count: number, seed = 1, scale = 1.0, height = 0.7): Point3D[] {
  const rnd = mulberry32(seed);
  const pts: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    const x = (rnd() * 2 - 1) * scale;
    const y = (rnd() * 2 - 1) * scale;
    const z = height * Math.exp(-(x * x + y * y) * 1.8) + (rnd() - 0.5) * 0.04;
    pts.push({ x, y, z });
  }
  return pts;
}

export function generateClusteredManifold3D(count: number, seed = 1, clusters = 4, spread = 0.22): Point3D[] {
  const rnd = mulberry32(seed);
  const centers: Point3D[] = [];
  for (let c = 0; c < clusters; c++) {
    const a = (c / clusters) * Math.PI * 2;
    centers.push({ x: Math.cos(a) * 0.55, y: Math.sin(a) * 0.55, z: (rnd() - 0.5) * 0.6 });
  }
  const pts: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    const c = centers[Math.floor(rnd() * centers.length)]!;
    pts.push({
      x: c.x + (rnd() - 0.5) * 2 * spread,
      y: c.y + (rnd() - 0.5) * 2 * spread,
      z: c.z + (rnd() - 0.5) * 2 * spread,
    });
  }
  return pts;
}

export function generateVolumeQueries3D(count: number, seed = 1, bounds = { minX: -1.2, maxX: 1.2, minY: -1.2, maxY: 1.2, minZ: -1.0, maxZ: 1.0 }): Point3D[] {
  const rnd = mulberry32(seed ^ 0xa53c9e1d);
  const pts: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    pts.push({
      x: bounds.minX + rnd() * (bounds.maxX - bounds.minX),
      y: bounds.minY + rnd() * (bounds.maxY - bounds.minY),
      z: bounds.minZ + rnd() * (bounds.maxZ - bounds.minZ),
    });
  }
  return pts;
}

export function projectPointsXY(points: Point3D[]): Point2D[] {
  return points.map(p => ({ x: p.x, y: p.y }));
}
