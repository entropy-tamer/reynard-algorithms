/**
 * Octree Voxel Operations
 *
 * Handles voxelization and voxel-based operations for the Octree data structure.
 * Provides voxel grid generation and voxel-based queries.
 *
 * @module algorithms/spatial-structures/octree
 */
import type { Bounds3D, OctreeNode, Voxel, VoxelGrid } from "./octree-types";
/**
 * Create a voxel grid from octree
 *
 * @param root Root node of the octree
 * @param voxelSize Size of each voxel
 * @param bounds Bounds of the voxel grid
 * @returns Voxel grid
 * @example
 */
export declare function createVoxelGrid(root: OctreeNode | null, voxelSize: number, bounds: Bounds3D): VoxelGrid;
/**
 * Get voxel at specific position
 *
 * @param voxelGrid Voxel grid
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @returns Voxel at position or null if out of bounds
 * @example
 */
export declare function getVoxelAt(voxelGrid: VoxelGrid, x: number, y: number, z: number): Voxel | null;
/**
 * Get voxels within bounds
 *
 * @param voxelGrid Voxel grid
 * @param bounds Query bounds
 * @returns Voxels within bounds
 * @example
 */
export declare function getVoxelsInBounds(voxelGrid: VoxelGrid, bounds: Bounds3D): Voxel[];
/**
 * Get non-empty voxels
 *
 * @param voxelGrid Voxel grid
 * @returns Non-empty voxels
 * @example
 */
export declare function getNonEmptyVoxels(voxelGrid: VoxelGrid): Voxel[];
/**
 * Get voxel density (points per voxel)
 *
 * @param voxelGrid Voxel grid
 * @param root
 * @returns Density map
 * @example
 */
export declare function getVoxelDensity(voxelGrid: VoxelGrid, root?: OctreeNode | null): number[][];
//# sourceMappingURL=octree-voxel.d.ts.map