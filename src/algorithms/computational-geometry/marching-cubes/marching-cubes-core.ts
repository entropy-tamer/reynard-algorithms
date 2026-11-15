/**
 * @file marching-cubes-core.ts
 * @description Marching cubes isosurface extraction producing triangle mesh data.
 */

import {
	MARCHING_CUBES_EDGE_TABLE,
	MARCHING_CUBES_TRI_TABLE,
} from "./marching-cubes-tables";
import type {
	MarchingCubesBounds,
	MarchingCubesMesh,
	MarchingCubesOptions,
	ScalarField3D,
} from "./marching-cubes-types";

const EDGE_PAIRS: readonly (readonly [number, number])[] = [
	[0, 1],
	[1, 3],
	[2, 3],
	[0, 2],
	[4, 5],
	[5, 7],
	[6, 7],
	[4, 6],
	[0, 4],
	[1, 5],
	[3, 7],
	[2, 6],
];

const EDGE_BITS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048] as const;

function resolveBounds(bounds?: Partial<MarchingCubesBounds>): MarchingCubesBounds {
	return {
		minX: bounds?.minX ?? -1,
		minY: bounds?.minY ?? -1,
		minZ: bounds?.minZ ?? -1,
		maxX: bounds?.maxX ?? 1,
		maxY: bounds?.maxY ?? 1,
		maxZ: bounds?.maxZ ?? 1,
	};
}

function gradientNormal(
	sample: ScalarField3D,
	x: number,
	y: number,
	z: number,
	eps: number,
): [number, number, number] {
	const dx = sample(x + eps, y, z) - sample(x - eps, y, z);
	const dy = sample(x, y + eps, z) - sample(x, y - eps, z);
	const dz = sample(x, y, z + eps) - sample(x, y, z - eps);
	let nx = -dx;
	let ny = -dy;
	let nz = -dz;
	const len = Math.hypot(nx, ny, nz);
	if (len > 1e-12) {
		nx /= len;
		ny /= len;
		nz /= len;
	} else {
		nx = 0;
		ny = 1;
		nz = 0;
	}
	return [nx, ny, nz];
}

/**
 * Generate a non-indexed triangle mesh for an isosurface of a scalar field.
 * Uses the standard marching cubes tables with gradient-derived vertex normals.
 */
export function marchingCubesMesh(
	sample: ScalarField3D,
	options: MarchingCubesOptions = {},
): MarchingCubesMesh {
	const iso = options.isoLevel ?? 0;
	const resOpt = options.resolution ?? 32;
	const rx = typeof resOpt === "number" ? resOpt : resOpt.x;
	const ry = typeof resOpt === "number" ? resOpt : resOpt.y;
	const rz = typeof resOpt === "number" ? resOpt : resOpt.z;
	const nx = Math.max(2, Math.floor(rx));
	const ny = Math.max(2, Math.floor(ry));
	const nz = Math.max(2, Math.floor(rz));
	const b = resolveBounds(options.bounds);
	const wantNormals = options.normals !== false;
	const wantUvs = options.uvs !== false;

	const sx = (b.maxX - b.minX) / (nx - 1);
	const sy = (b.maxY - b.minY) / (ny - 1);
	const sz = (b.maxZ - b.minZ) / (nz - 1);
	const eps = options.gradientEpsilon ?? Math.min(sx, sy, sz) * 0.5;

	const field = new Float64Array(nx * ny * nz);
	const idx = (ix: number, iy: number, iz: number) => (iz * ny + iy) * nx + ix;
	for (let iz = 0; iz < nz; iz++) {
		const z = b.minZ + iz * sz;
		for (let iy = 0; iy < ny; iy++) {
			const y = b.minY + iy * sy;
			for (let ix = 0; ix < nx; ix++) {
				field[idx(ix, iy, iz)] = sample(b.minX + ix * sx, y, z);
			}
		}
	}

	const positions: number[] = [];
	const normals: number[] = [];
	const uvArr: number[] = [];
	const vlist = new Float64Array(12 * 3);

	const uSpan = b.maxX - b.minX || 1;
	const wSpan = b.maxZ - b.minZ || 1;

	for (let iz = 0; iz < nz - 1; iz++) {
		const z = b.minZ + iz * sz;
		for (let iy = 0; iy < ny - 1; iy++) {
			const y = b.minY + iy * sy;
			for (let ix = 0; ix < nx - 1; ix++) {
				const x = b.minX + ix * sx;
				const q = idx(ix, iy, iz);
				const q1 = q + 1;
				const qy = q + nx;
				const q1y = q1 + nx;
				const qz = q + nx * ny;
				const q1z = q1 + nx * ny;
				const qyz = qy + nx * ny;
				const q1yz = q1y + nx * ny;

				const fv0 = field[q]!;
				const fv1 = field[q1]!;
				const fv2 = field[qy]!;
				const fv3 = field[q1y]!;
				const fv4 = field[qz]!;
				const fv5 = field[q1z]!;
				const fv6 = field[qyz]!;
				const fv7 = field[q1yz]!;

				let cubeIndex = 0;
				if (fv0 < iso) cubeIndex |= 1;
				if (fv1 < iso) cubeIndex |= 2;
				if (fv2 < iso) cubeIndex |= 8;
				if (fv3 < iso) cubeIndex |= 4;
				if (fv4 < iso) cubeIndex |= 16;
				if (fv5 < iso) cubeIndex |= 32;
				if (fv6 < iso) cubeIndex |= 128;
				if (fv7 < iso) cubeIndex |= 64;

				const bits = MARCHING_CUBES_EDGE_TABLE[cubeIndex] ?? 0;
				if (bits === 0) continue;

				const verts = [
					[x, y, z, fv0],
					[x + sx, y, z, fv1],
					[x, y + sy, z, fv2],
					[x + sx, y + sy, z, fv3],
					[x, y, z + sz, fv4],
					[x + sx, y, z + sz, fv5],
					[x, y + sy, z + sz, fv6],
					[x + sx, y + sy, z + sz, fv7],
				] as const;

				for (let e = 0; e < 12; e++) {
					if ((bits & EDGE_BITS[e]) === 0) continue;
					const [ia, ib] = EDGE_PAIRS[e];
					const va = verts[ia];
					const vb = verts[ib];
					const denom = vb[3] - va[3];
					const mu = denom === 0 ? 0 : (iso - va[3]) / denom;
					const off = e * 3;
					vlist[off] = va[0] + (vb[0] - va[0]) * mu;
					vlist[off + 1] = va[1] + (vb[1] - va[1]) * mu;
					vlist[off + 2] = va[2] + (vb[2] - va[2]) * mu;
				}

				const triBase = cubeIndex * 16;
				for (let t = 0; t < 16; t += 3) {
					const e0 = MARCHING_CUBES_TRI_TABLE[triBase + t] ?? -1;
					if (e0 === -1) break;
					const e1 = MARCHING_CUBES_TRI_TABLE[triBase + t + 1] ?? -1;
					const e2 = MARCHING_CUBES_TRI_TABLE[triBase + t + 2] ?? -1;
					if (e1 < 0 || e2 < 0) break;

					for (const ei of [e0, e1, e2]) {
						const px = vlist[ei * 3];
						const py = vlist[ei * 3 + 1];
						const pz = vlist[ei * 3 + 2];
						positions.push(px, py, pz);
						if (wantNormals) {
							const [nxn, nyn, nzn] = gradientNormal(sample, px, py, pz, eps);
							normals.push(nxn, nyn, nzn);
						}
						if (wantUvs) {
							uvArr.push((px - b.minX) / uSpan, (pz - b.minZ) / wSpan);
						}
					}
				}
			}
		}
	}

	const vertexCount = positions.length / 3;
	const mesh: MarchingCubesMesh = {
		positions: new Float32Array(positions),
		triangleCount: vertexCount / 3,
		vertexCount,
	};
	if (wantNormals) mesh.normals = new Float32Array(normals);
	if (wantUvs) mesh.uvs = new Float32Array(uvArr);
	return mesh;
}
