import { describe, expect, it } from "vitest";
import { marchingCubesMesh } from "../../algorithms/computational-geometry/marching-cubes/marching-cubes-core";

function boundsOf(positions: Float32Array) {
	let minX = Infinity, minY = Infinity, minZ = Infinity;
	let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
	for (let i = 0; i < positions.length; i += 3) {
		const x = positions[i], y = positions[i + 1], z = positions[i + 2];
		if (x < minX) minX = x; if (x > maxX) maxX = x;
		if (y < minY) minY = y; if (y > maxY) maxY = y;
		if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
	}
	return { minX, minY, minZ, maxX, maxY, maxZ };
}

function normalsFinite(normals: Float32Array) {
	for (let i = 0; i < normals.length; i++) if (!Number.isFinite(normals[i])) return false;
	return true;
}

function uvsInRange(uvs: Float32Array) {
	for (let i = 0; i < uvs.length; i++) if (!Number.isFinite(uvs[i]) || uvs[i] < -0.01 || uvs[i] > 1.01) return false;
	return true;
}

function smoothMetaballs(seed: number) {
	let t = seed >>> 0;
	const rnd = () => {
		t += 0x6d2b79f5;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
	const blobs = Array.from({ length: 6 }, () => ({
		x: (rnd() - 0.5) * 1.1,
		y: (rnd() - 0.5) * 0.9,
		z: (rnd() - 0.5) * 1.1,
		r: 0.22 + rnd() * 0.22,
	}));
	return (x: number, y: number, z: number) => {
		let field = -0.85;
		for (const b of blobs) {
			const dx = x - b.x, dy = y - b.y, dz = z - b.z;
			field += (b.r * b.r) / (dx * dx + dy * dy + dz * dz + 0.015);
		}
		field -= 0.25 * (x * x + y * y * 1.15 + z * z);
		return field;
	};
}

describe("marchingCubesMesh audit (procedural fields)", () => {
	const seeds = [1, 17, 42, 123, 999];

	for (const seed of seeds) {
		it(`produces bounded, non-degenerate mesh for metaball seed ${seed}`, () => {
			const mesh = marchingCubesMesh(smoothMetaballs(seed), {
				resolution: 20,
				isoLevel: 0,
				bounds: { minX: -1.35, minY: -1.35, minZ: -1.35, maxX: 1.35, maxY: 1.35, maxZ: 1.35 },
				normals: true,
				uvs: true,
			});
			expect(mesh.triangleCount).toBeGreaterThan(100);
			expect(mesh.positions.length).toBe(mesh.triangleCount * 9);
			expect(mesh.normals?.length).toBe(mesh.positions.length);
			expect(mesh.uvs?.length).toBe(mesh.triangleCount * 6);
			const b = boundsOf(mesh.positions);
			for (const v of [b.minX, b.minY, b.minZ, b.maxX, b.maxY, b.maxZ]) expect(Number.isFinite(v)).toBe(true);
			expect(b.minX).toBeGreaterThanOrEqual(-1.36);
			expect(b.maxX).toBeLessThanOrEqual(1.36);
			expect(b.minY).toBeGreaterThanOrEqual(-1.36);
			expect(b.maxY).toBeLessThanOrEqual(1.36);
			expect(b.minZ).toBeGreaterThanOrEqual(-1.36);
			expect(b.maxZ).toBeLessThanOrEqual(1.36);
			expect(normalsFinite(mesh.normals!)).toBe(true);
			expect(uvsInRange(mesh.uvs!)).toBe(true);
		});
	}

	it("is deterministic for the same seed and settings", () => {
		const a = marchingCubesMesh(smoothMetaballs(77), { resolution: 18, isoLevel: 0.05, normals: true, uvs: true });
		const b = marchingCubesMesh(smoothMetaballs(77), { resolution: 18, isoLevel: 0.05, normals: true, uvs: true });
		expect(a.triangleCount).toBe(b.triangleCount);
		expect(Array.from(a.positions.slice(0, 30))).toEqual(Array.from(b.positions.slice(0, 30)));
	});

	it("produces a closed-ish sphere surface with expected scale", () => {
		const mesh = marchingCubesMesh((x, y, z) => Math.hypot(x, y, z) - 0.7, {
			resolution: 24,
			isoLevel: 0,
			bounds: { minX: -1, minY: -1, minZ: -1, maxX: 1, maxY: 1, maxZ: 1 },
			normals: true,
			uvs: true,
		});
		expect(mesh.triangleCount).toBeGreaterThan(400);
		const b = boundsOf(mesh.positions);
		expect(b.maxX - b.minX).toBeGreaterThan(1.1);
		expect(b.maxY - b.minY).toBeGreaterThan(1.1);
		expect(b.maxZ - b.minZ).toBeGreaterThan(1.1);
	});
});
