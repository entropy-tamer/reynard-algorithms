import { describe, expect, it } from "vitest";
import { marchingCubesMesh } from "../../algorithms/computational-geometry/marching-cubes/marching-cubes-core";

describe("marchingCubesMesh", () => {
	it("generates a sphere-like isosurface with normals and uvs", () => {
		const mesh = marchingCubesMesh(
			(x, y, z) => Math.hypot(x, y, z) - 0.6,
			{
				isoLevel: 0,
				resolution: 16,
				bounds: { minX: -1, minY: -1, minZ: -1, maxX: 1, maxY: 1, maxZ: 1 },
			},
		);
		expect(mesh.triangleCount).toBeGreaterThan(0);
		expect(mesh.vertexCount).toBe(mesh.triangleCount * 3);
		expect(mesh.positions.length).toBe(mesh.vertexCount * 3);
		expect(mesh.normals).toBeDefined();
		expect(mesh.normals!.length).toBe(mesh.vertexCount * 3);
		expect(mesh.uvs).toBeDefined();
		expect(mesh.uvs!.length).toBe(mesh.vertexCount * 2);
		// normals should be roughly unit length
		for (let i = 0; i < Math.min(30, mesh.vertexCount); i++) {
			const nx = mesh.normals![i * 3]!;
			const ny = mesh.normals![i * 3 + 1]!;
			const nz = mesh.normals![i * 3 + 2]!;
			expect(Math.hypot(nx, ny, nz)).toBeCloseTo(1, 3);
		}
	});

	it("respects iso level and can omit normals/uvs", () => {
		const sample = (x: number, y: number, z: number) => y;
		const a = marchingCubesMesh(sample, { isoLevel: -0.5, resolution: 8 });
		const b = marchingCubesMesh(sample, { isoLevel: 0.5, resolution: 8 });
		expect(a.triangleCount).toBeGreaterThan(0);
		expect(b.triangleCount).toBeGreaterThan(0);
		const flat = marchingCubesMesh(sample, {
			isoLevel: 0,
			resolution: 8,
			normals: false,
			uvs: false,
		});
		expect(flat.normals).toBeUndefined();
		expect(flat.uvs).toBeUndefined();
	});
});
