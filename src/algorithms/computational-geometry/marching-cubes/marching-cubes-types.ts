/**
 * @file marching-cubes-types.ts
 * @description Types for marching cubes isosurface mesh generation.
 */

/** Scalar field sampler in world space. */
export type ScalarField3D = (x: number, y: number, z: number) => number;

export interface MarchingCubesBounds {
	minX: number;
	minY: number;
	minZ: number;
	maxX: number;
	maxY: number;
	maxZ: number;
}

export interface MarchingCubesOptions {
	/** Isosurface value. @default 0 */
	isoLevel?: number;
	/** Sample resolution per axis (>= 2). @default 32 */
	resolution?: number | { x: number; y: number; z: number };
	/** World-space bounds to sample. @default {-1,-1,-1,1,1,1} */
	bounds?: Partial<MarchingCubesBounds>;
	/** Compute smooth per-vertex normals via gradient sampling. @default true */
	normals?: boolean;
	/** Compute UVs mapped from bounds. @default true */
	uvs?: boolean;
	/** Epsilon for gradient sampling. Defaults to cell size. */
	gradientEpsilon?: number;
}

export interface MarchingCubesMesh {
	/** Non-indexed triangle positions, 9 floats per triangle. */
	positions: Float32Array;
	/** Per-vertex normals, 3 floats per vertex, when requested. */
	normals?: Float32Array;
	/** Per-vertex UVs, 2 floats per vertex, when requested. */
	uvs?: Float32Array;
	triangleCount: number;
	vertexCount: number;
}
