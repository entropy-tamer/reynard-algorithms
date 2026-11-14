import type { Point3D } from "./dp-nns-generators";
import type { Bounds3D, DpNnsBuildOptions3D, DpNnsIndex3D, DpNnsQueryResult3D } from "./dp-nns-3d-types";

function dist2(a: Point3D, b: Point3D): number {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}
function dist(a: Point3D, b: Point3D): number { return Math.sqrt(dist2(a, b)); }

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
function shuffle<T>(arr: T[], rnd: () => number): T[] { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; }

function boundsOf(points: Point3D[]): Bounds3D {
  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const p of points) { if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y; if (p.z < minZ) minZ = p.z; if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y; if (p.z > maxZ) maxZ = p.z; }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, minZ: 0, maxX: 1, maxY: 1, maxZ: 1 };
  if (maxX === minX) maxX = minX + 1; if (maxY === minY) maxY = minY + 1; if (maxZ === minZ) maxZ = minZ + 1;
  return { minX, minY, minZ, maxX, maxY, maxZ };
}

function orient3d(a: Point3D, b: Point3D, c: Point3D, d: Point3D): number {
  // Signed volume * 6
  const adx = a.x - d.x, bdx = b.x - d.x, cdx = c.x - d.x;
  const ady = a.y - d.y, bdy = b.y - d.y, cdy = c.y - d.y;
  const adz = a.z - d.z, bdz = b.z - d.z, cdz = c.z - d.z;
  return adx * (bdy * cdz - bdz * cdy) - ady * (bdx * cdz - bdz * cdx) + adz * (bdx * cdy - bdy * cdx);
}

function circumsphere(a: Point3D, b: Point3D, c: Point3D, d: Point3D): { center: Point3D; r2: number } | null {
  // Solve for circumsphere center; robust enough for general position.
  const ax = a.x - d.x, ay = a.y - d.y, az = a.z - d.z;
  const bx = b.x - d.x, by = b.y - d.y, bz = b.z - d.z;
  const cx = c.x - d.x, cy = c.y - d.y, cz = c.z - d.z;
  const aa = ax * ax + ay * ay + az * az;
  const bb = bx * bx + by * by + bz * bz;
  const cc = cx * cx + cy * cy + cz * cz;
  const det = 2 * (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx));
  if (Math.abs(det) < 1e-14) return null;
  const ux = (aa * (by * cz - bz * cy) - bb * (ay * cz - az * cy) + cc * (ay * bz - az * by)) / det;
  const uy = (-(aa * (bx * cz - bz * cx)) + bb * (ax * cz - az * cx) - cc * (ax * bz - az * bx)) / det;
  const uz = (aa * (bx * cy - by * cx) - bb * (ax * cy - ay * cx) + cc * (ax * by - ay * bx)) / det;
  const center = { x: ux + d.x, y: uy + d.y, z: uz + d.z };
  return { center, r2: dist2(center, a) };
}

interface Tet { a: number; b: number; c: number; d: number; cc: Point3D; r2: number; }

function makeTet(a: number, b: number, c: number, d: number, pts: Point3D[]): Tet | null {
  const pa = pts[a]!, pb = pts[b]!, pc = pts[c]!, pd = pts[d]!;
  const vol = orient3d(pa, pb, pc, pd);
  if (Math.abs(vol) < 1e-12) return null;
  let aa=a, bb=b, cc=c, dd=d;
  if (vol < 0) { // ensure positive orientation
    const t = bb; bb = cc; cc = t;
  }
  const cs = circumsphere(pts[aa]!, pts[bb]!, pts[cc]!, pts[dd]!);
  if (!cs) return null;
  return { a: aa, b: bb, c: cc, d: dd, cc: cs.center, r2: cs.r2 };
}

function faceKey(a: number, b: number, c: number): string {
  const s = [a,b,c].sort((x,y)=>x-y);
  return `${s[0]},${s[1]},${s[2]}`;
}

function addNeighbor(nei: number[][], a: number, b: number) { if (a===b) return; if (!nei[a]!.includes(b)) nei[a]!.push(b); if (!nei[b]!.includes(a)) nei[b]!.push(a); }

// 3D incremental Delaunay (Bowyer-Watson) with insertion-history neighbor capture.
function buildIncrementalDelaunay3D(points: Point3D[], order: number[]) {
  const n = points.length;
  const neighborsAtInsertion: number[][] = Array.from({ length: n }, () => []);
  const finalNeighbors: number[][] = Array.from({ length: n }, () => []);
  if (n === 0) return { neighborsAtInsertion, finalNeighbors };
  const b = boundsOf(points);
  const dx=b.maxX-b.minX, dy=b.maxY-b.minY, dz=b.maxZ-b.minZ;
  const delta = Math.max(dx,dy,dz) * 10 + 1;
  const mid = { x:(b.minX+b.maxX)/2, y:(b.minY+b.maxY)/2, z:(b.minZ+b.maxZ)/2 };
  const ext = points.concat([
    { x: mid.x - 20*delta, y: mid.y - delta, z: mid.z - delta },
    { x: mid.x + 20*delta, y: mid.y - delta, z: mid.z - delta },
    { x: mid.x, y: mid.y + 20*delta, z: mid.z - delta },
    { x: mid.x, y: mid.y, z: mid.z + 20*delta },
  ]);
  const s0=n,s1=n+1,s2=n+2,s3=n+3;
  let tets: Tet[] = [makeTet(s0,s1,s2,s3,ext)!].filter(Boolean) as Tet[];
  for (const pi of order) {
    const p = ext[pi]!;
    const bad: Tet[] = []; const good: Tet[] = [];
    for (const t of tets) {
      const d2 = dist2(p, t.cc);
      if (d2 <= t.r2 + 1e-9) bad.push(t); else good.push(t);
    }
    if (bad.length === 0) continue;
    const faceCount = new Map<string, {a:number,b:number,c:number,count:number}>();
    for (const t of bad) {
      const faces: [number,number,number][] = [[t.a,t.b,t.c],[t.a,t.d,t.b],[t.b,t.d,t.c],[t.a,t.c,t.d]];
      for (const [fa,fb,fc] of faces) {
        const k = faceKey(fa,fb,fc);
        const e = faceCount.get(k);
        if (e) e.count++; else faceCount.set(k,{a:fa,b:fb,c:fc,count:1});
      }
    }
    const boundary = Array.from(faceCount.values()).filter(f=>f.count===1);
    const nset = new Set<number>();
    const newTets: Tet[] = [];
    for (const f of boundary) {
      if (f.a < n) nset.add(f.a); if (f.b < n) nset.add(f.b); if (f.c < n) nset.add(f.c);
      const nt = makeTet(pi,f.a,f.b,f.c,ext);
      if (nt) newTets.push(nt);
    }
    neighborsAtInsertion[pi] = Array.from(nset);
    tets = good.concat(newTets);
  }
  const edgeSeen = new Set<string>();
  for (const t of tets) {
    if (t.a>=n||t.b>=n||t.c>=n||t.d>=n) continue;
    const edges: [number,number][] = [[t.a,t.b],[t.a,t.c],[t.a,t.d],[t.b,t.c],[t.b,t.d],[t.c,t.d]];
    for (const [a,b2] of edges) {
      const k = a<b2?`${a},${b2}`:`${b2},${a}`;
      if (edgeSeen.has(k)) continue; edgeSeen.add(k); addNeighbor(finalNeighbors,a,b2);
    }
  }
  return { neighborsAtInsertion, finalNeighbors, tetraCount: tets.filter(t=>t.a<n&&t.b<n&&t.c<n&&t.d<n).length };
}

function computeInsertionOrder(n: number, mode: string, seed: number, brioRatio: number) {
  const base = Array.from({length:n},(_,i)=>i);
  const rnd = mulberry32(seed);
  if (mode === 'input' || n<=1) return base;
  if (mode === 'random') return shuffle(base, rnd);
  const shuffled = shuffle(base, rnd);
  const ratio = Math.max(2, brioRatio);
  const sizesRev: number[] = []; let remaining=n;
  while (remaining>0){ const size = remaining<=2?remaining:Math.max(1,Math.floor(remaining/ratio)); sizesRev.push(size); remaining-=size; }
  sizesRev.reverse();
  const levels: number[][] = []; let off=0; for (const sz of sizesRev){ levels.push(shuffled.slice(off,off+sz)); off+=sz; }
  return levels.flat();
}

export function buildDpNnsIndex3D(input: Point3D[], options: DpNnsBuildOptions3D = {}): DpNnsIndex3D {
  const t0 = performance.now();
  const seed = options.seed ?? 1; const jitter = options.jitter ?? 1e-8;
  const rnd = mulberry32(seed ^ 0x12345);
  const b0 = boundsOf(input); const scale = Math.max(b0.maxX-b0.minX,b0.maxY-b0.minY,b0.maxZ-b0.minZ)*jitter;
  const points = input.map(p=>({x:p.x+(rnd()-0.5)*scale,y:p.y+(rnd()-0.5)*scale,z:p.z+(rnd()-0.5)*scale}));
  const n = points.length;
  const order = computeInsertionOrder(n, options.order ?? 'brio-levels', seed, options.brioRatio ?? 4);
  const insertionRanks = new Array<number>(n).fill(0); const pointsByRank = new Array<number>(n+1).fill(-1);
  for (let r=0;r<order.length;r++){ insertionRanks[order[r]!] = r+1; pointsByRank[r+1]=order[r]!; }
  const { neighborsAtInsertion, finalNeighbors } = buildIncrementalDelaunay3D(points, order);
  const successors: number[][] = Array.from({length:n},()=>[]);
  let successorEdgeCount = 0;
  for (let r=1;r<=n;r++){ const p = pointsByRank[r]!; for (const x of neighborsAtInsertion[p] ?? []){ successors[x]!.push(p); successorEdgeCount++; } }
  for (const s of successors) s.sort((a,b2)=>insertionRanks[a]!-insertionRanks[b2]!);
  const bounds = boundsOf(points); const queryBounds = options.queryBounds ?? bounds;
  const gridResolution = Math.max(0, Math.floor(options.gridResolution ?? 8));
  const index: DpNnsIndex3D = { points, insertionRanks, pointsByRank, successors, finalNeighbors, bounds, queryBounds, gridResolution, gridStarts: null, stats: { pointCount:n, successorEdgeCount, gridCells:gridResolution**3, buildMs:0 } };
  if (gridResolution>0 && n>0) index.gridStarts = computeGridStarts3D(index, gridResolution, queryBounds);
  index.stats.buildMs = performance.now()-t0;
  return index;
}

export function queryDpNns3D(index: DpNnsIndex3D, q: Point3D, opts: {useGridInit?: boolean} = {}): DpNnsQueryResult3D {
  const n = index.points.length; if (n===0) return {nearestIndex:-1,nearestDistance:Infinity,path:[],distanceEvaluations:0,hops:0,startIndex:-1,usedGridInit:false};
  let startIndex = index.pointsByRank[1]!; let usedGridInit=false;
  if ((opts.useGridInit ?? true) && index.gridStarts && index.gridResolution>0) {
    const g = index.gridResolution; const b=index.queryBounds;
    const dx=b.maxX-b.minX||1, dy=b.maxY-b.minY||1, dz=b.maxZ-b.minZ||1;
    const gx=Math.min(g-1,Math.max(0,Math.floor(((q.x-b.minX)/dx)*g)));
    const gy=Math.min(g-1,Math.max(0,Math.floor(((q.y-b.minY)/dy)*g)));
    const gz=Math.min(g-1,Math.max(0,Math.floor(((q.z-b.minZ)/dz)*g)));
    const s = index.gridStarts[(gz*g+gy)*g+gx]; if (s!=null && s>=0){ startIndex=s; usedGridInit=true; }
  }
  let current=startIndex; let currentDist=dist(index.points[current]!, q); let evals=1; let hops=0; const path=[current];
  for(;;){ let moved=false; const succ=index.successors[current]??[]; for(const s of succ){ evals++; const d=dist(index.points[s]!,q); if (d<currentDist){ current=s; currentDist=d; hops++; path.push(current); moved=true; break; } } if(!moved) break; }
  return { nearestIndex: current, nearestDistance: currentDist, path, distanceEvaluations: evals, hops, startIndex, usedGridInit };
}

function computePath3D(index: DpNnsIndex3D, q: Point3D): number[] { return queryDpNns3D(index,q,{useGridInit:false}).path; }
function intersectHighest(paths: number[][], ranks: number[]): number {
  let set = new Set<number>(paths[0] ?? []); for(let i=1;i<paths.length;i++){ const ns=new Set<number>(); const p2=new Set(paths[i]!); for(const v of set) if(p2.has(v)) ns.add(v); set=ns; }
  let best=-1, br=-1; for(const v of set){ const r=ranks[v]??-1; if(r>br){br=r; best=v;} } return best;
}
export function computeGridStarts3D(index: DpNnsIndex3D, g: number, b: Bounds3D): Int32Array {
  const starts = new Int32Array(g*g*g);
  const dx=b.maxX-b.minX||1, dy=b.maxY-b.minY||1, dz=b.maxZ-b.minZ||1;
  // Cache vertex paths: (g+1)^3 vertices, each shared by up to 8 cells
  const vp: number[][][][] = Array.from({length:g+1},()=>Array.from({length:g+1},()=>Array.from({length:g+1},()=>[] as number[])));
  for(let iz=0;iz<=g;iz++) for(let iy=0;iy<=g;iy++) for(let ix=0;ix<=g;ix++){
    vp[iz]![iy]![ix] = computePath3D(index,{x:b.minX+dx*ix/g,y:b.minY+dy*iy/g,z:b.minZ+dz*iz/g});
  }
  for(let iz=0;iz<g;iz++) for(let iy=0;iy<g;iy++) for(let ix=0;ix<g;ix++){
    const paths = [vp[iz]![iy]![ix]!,vp[iz]![iy]![ix+1]!,vp[iz]![iy+1]![ix]!,vp[iz]![iy+1]![ix+1]!,vp[iz+1]![iy]![ix]!,vp[iz+1]![iy]![ix+1]!,vp[iz+1]![iy+1]![ix]!,vp[iz+1]![iy+1]![ix+1]!];
    let s = intersectHighest(paths, index.insertionRanks); if (s<0) s=index.pointsByRank[1]!;
    starts[(iz*g+iy)*g+ix]=s;
  }
  return starts;
}

export function bruteForceNearest3D(points: Point3D[], q: Point3D){ let best=-1,bestD=Infinity; for(let i=0;i<points.length;i++){ const d=dist(points[i]!,q); if(d<bestD){bestD=d;best=i;} } return {index:best,distance:bestD}; }
