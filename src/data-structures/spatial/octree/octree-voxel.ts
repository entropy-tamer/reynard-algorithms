/**
 * Octree Voxel Operations
 *
 * Handles voxelization and voxel-based operations for the Octree data structure.
 * Provides voxel grid generation and voxel-based queries.
 *
 * @module algorithms/spatial-structures/octree
 */

import type { Point3D, Bounds3D, OctreeNode, Voxel, VoxelGrid } from "./octree-types";

/**
 * Create a voxel grid from octree
 *
 * @param root Root node of the octree
 * @param voxelSize Size of each voxel
 * @param bounds Bounds of the voxel grid
 * @returns Voxel grid
 * @example
 */
export function createVoxelGrid(root: OctreeNode | null, voxelSize: number, bounds: Bounds3D): VoxelGrid {
  const gridX = Math.ceil((bounds.max.x - bounds.min.x) / voxelSize);
  const gridY = Math.ceil((bounds.max.y - bounds.min.y) / voxelSize);
  const gridZ = Math.ceil((bounds.max.z - bounds.min.z) / voxelSize);

  const voxels: Voxel[][][] = Array.from({ length: gridZ }, () =>
    Array.from({ length: gridY }, () =>
      Array.from(
        { length: gridX },
        () =>
          ({
            position: { x: 0, y: 0, z: 0 },
            size: voxelSize,
            occupied: false,
          }) as Voxel
      )
    )
  );

  for (let z = 0; z < gridZ; z++) {
    for (let y = 0; y < gridY; y++) {
      for (let x = 0; x < gridX; x++) {
        const min = {
          x: bounds.min.x + x * voxelSize,
          y: bounds.min.y + y * voxelSize,
          z: bounds.min.z + z * voxelSize,
        };
        const max = {
          x: bounds.min.x + (x + 1) * voxelSize,
          y: bounds.min.y + (y + 1) * voxelSize,
          z: bounds.min.z + (z + 1) * voxelSize,
        };
        const voxelBounds: Bounds3D = {
          min,
          max,
          center: {
            x: (min.x + max.x) / 2,
            y: (min.y + max.y) / 2,
            z: (min.z + max.z) / 2,
          },
          size: { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z },
        };
        const occupied = root ? queryVoxelPoints(root, voxelBounds).length > 0 : false;
        voxels[z][y][x] = {
          position: { x: min.x, y: min.y, z: min.z },
          size: voxelSize,
          occupied,
        } as Voxel;
      }
    }
  }

  return {
    bounds,
    voxelSize,
    dimensions: { x: gridX, y: gridY, z: gridZ },
    voxels,
  };
}

/**
 * Query points within a voxel
 *
 * @param root Root node of the octree
 * @param voxelBounds Bounds of the voxel
 * @returns Points within the voxel
 * @example
 */
function queryVoxelPoints(root: OctreeNode, voxelBounds: Bounds3D): Point3D[] {
  const points: Point3D[] = [];
  queryVoxelPointsRecursive(root, voxelBounds, points);
  return points;
}

/**
 * Recursively query points within voxel bounds
 *
 * @param node Current node
 * @param voxelBounds Voxel bounds
 * @param points Array to collect points
 * @example
 */
function queryVoxelPointsRecursive(node: OctreeNode, voxelBounds: Bounds3D, points: Point3D[]): void {
  // Check if node bounds intersect with voxel bounds
  if (!boundsIntersect(node.bounds, voxelBounds)) {
    return;
  }

  if (node.isLeaf) {
    // Check each point in the leaf
    for (const point of node.points) {
      if (pointInBounds(point, voxelBounds)) {
        points.push(point);
      }
    }
  } else {
    // Recursively check children
    for (const child of node.children) {
      if (child) {
        queryVoxelPointsRecursive(child, voxelBounds, points);
      }
    }
  }
}

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
export function getVoxelAt(voxelGrid: VoxelGrid, x: number, y: number, z: number): Voxel | null {
  if (
    x < 0 ||
    x >= voxelGrid.dimensions.x ||
    y < 0 ||
    y >= voxelGrid.dimensions.y ||
    z < 0 ||
    z >= voxelGrid.dimensions.z
  ) {
    return null;
  }
  return voxelGrid.voxels[z][y][x] || null;
}

/**
 * Get voxels within bounds
 *
 * @param voxelGrid Voxel grid
 * @param bounds Query bounds
 * @returns Voxels within bounds
 * @example
 */
export function getVoxelsInBounds(voxelGrid: VoxelGrid, bounds: Bounds3D): Voxel[] {
  const results: Voxel[] = [];
  for (let z = 0; z < voxelGrid.dimensions.z; z++) {
    for (let y = 0; y < voxelGrid.dimensions.y; y++) {
      for (let x = 0; x < voxelGrid.dimensions.x; x++) {
        const v = voxelGrid.voxels[z][y][x];
        const vBounds: Bounds3D = {
          min: { x: v.position.x, y: v.position.y, z: v.position.z },
          max: {
            x: v.position.x + voxelGrid.voxelSize,
            y: v.position.y + voxelGrid.voxelSize,
            z: v.position.z + voxelGrid.voxelSize,
          },
          center: {
            x: v.position.x + voxelGrid.voxelSize / 2,
            y: v.position.y + voxelGrid.voxelSize / 2,
            z: v.position.z + voxelGrid.voxelSize / 2,
          },
          size: { x: voxelGrid.voxelSize, y: voxelGrid.voxelSize, z: voxelGrid.voxelSize },
        };
        if (boundsIntersect(vBounds, bounds)) {
          results.push(v);
        }
      }
    }
  }
  return results;
}

/**
 * Get non-empty voxels
 *
 * @param voxelGrid Voxel grid
 * @returns Non-empty voxels
 * @example
 */
export function getNonEmptyVoxels(voxelGrid: VoxelGrid): Voxel[] {
  const results: Voxel[] = [];
  for (let z = 0; z < voxelGrid.dimensions.z; z++) {
    for (let y = 0; y < voxelGrid.dimensions.y; y++) {
      for (let x = 0; x < voxelGrid.dimensions.x; x++) {
        const v = voxelGrid.voxels[z][y][x];
        if (v.occupied) results.push(v);
      }
    }
  }
  return results;
}

/**
 * Get voxel density (points per voxel)
 *
 * @param voxelGrid Voxel grid
 * @param root
 * @returns Density map
 * @example
 */
export function getVoxelDensity(voxelGrid: VoxelGrid, root?: OctreeNode | null): number[][] {
  const density: number[][] = [];
  for (let z = 0; z < voxelGrid.dimensions.z; z++) {
    const slice: number[] = [];
    for (let y = 0; y < voxelGrid.dimensions.y; y++) {
      for (let x = 0; x < voxelGrid.dimensions.x; x++) {
        const v = getVoxelAt(voxelGrid, x, y, z);
        if (!v) {
          slice.push(0);
          continue;
        }
        if (!root) {
          slice.push(v.occupied ? 1 : 0);
          continue;
        }
        const vb: Bounds3D = {
          min: { x: v.position.x, y: v.position.y, z: v.position.z },
          max: {
            x: v.position.x + voxelGrid.voxelSize,
            y: v.position.y + voxelGrid.voxelSize,
            z: v.position.z + voxelGrid.voxelSize,
          },
          center: {
            x: v.position.x + voxelGrid.voxelSize / 2,
            y: v.position.y + voxelGrid.voxelSize / 2,
            z: v.position.z + voxelGrid.voxelSize / 2,
          },
          size: { x: voxelGrid.voxelSize, y: voxelGrid.voxelSize, z: voxelGrid.voxelSize },
        };
        const count = queryVoxelPoints(root, vb).length;
        slice.push(count);
      }
    }
    density.push(slice);
  }
  return density;
}

/**
 * Check if two bounds intersect
 *
 * @param bounds1 First bounds
 * @param bounds2 Second bounds
 * @returns True if bounds intersect
 * @example
 */
function boundsIntersect(bounds1: Bounds3D, bounds2: Bounds3D): boolean {
  return (
    bounds1.min.x <= bounds2.max.x &&
    bounds1.max.x >= bounds2.min.x &&
    bounds1.min.y <= bounds2.max.y &&
    bounds1.max.y >= bounds2.min.y &&
    bounds1.min.z <= bounds2.max.z &&
    bounds1.max.z >= bounds2.min.z
  );
}

/**
 * Check if a point is within bounds
 *
 * @param point Point to check
 * @param bounds Bounds to check against
 * @returns True if point is within bounds
 * @example
 */
function pointInBounds(point: Point3D, bounds: Bounds3D): boolean {
  return (
    point.x >= bounds.min.x &&
    point.x <= bounds.max.x &&
    point.y >= bounds.min.y &&
    point.y <= bounds.max.y &&
    point.z >= bounds.min.z &&
    point.z <= bounds.max.z
  );
}
