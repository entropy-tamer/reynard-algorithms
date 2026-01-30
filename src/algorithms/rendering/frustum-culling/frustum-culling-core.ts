/**
 * @module algorithms/rendering/frustum-culling-core
 * @description Frustum Culling implementation for 3D rendering optimization.
 *
 * Mathematical Theory:
 * Frustum culling determines which objects are visible within a camera's view frustum.
 * A frustum is defined by 6 planes (near, far, left, right, top, bottom).
 *
 * For each plane, we test if an object is:
 * - Completely inside: All vertices on positive side of plane
 * - Intersecting: Some vertices on each side
 * - Completely outside: All vertices on negative side of plane
 *
 * An object is visible if it's inside or intersecting all 6 planes.
 *
 * Plane equation: ax + by + cz + d = 0
 * Distance from point to plane: distance = n·p + d
 * where n is plane normal, p is point, d is plane distance
 */

import type {
  Frustum3D,
  Plane3D,
  AABB3D,
  Sphere3D,
  Point3D,
} from "../../../core/types";
import type {
  FrustumCullingConfig,
  FrustumCullingResult,
  CullingResult,
  FrustumCullingStats,
  FrustumCullingOptions,
  CullableObject,
} from "./frustum-culling-types";
import { DEFAULT_FRUSTUM_CULLING_CONFIG } from "./frustum-culling-types";

/**
 * Calculate distance from point to plane.
 * @param point
 * @param plane
 * @example
 */
function pointToPlaneDistance(point: Point3D, plane: Plane3D): number {
  return (
    plane.normal.x * point.x +
    plane.normal.y * point.y +
    plane.normal.z * point.z +
    plane.distance
  );
}

/**
 * Test if a point is inside the frustum.
 * @param point
 * @param frustum
 * @param tolerance
 * @example
 */
function testPoint(point: Point3D, frustum: Frustum3D, tolerance: number): CullingResult {
  let allInside = true;
  let allOutside = true;

  for (const plane of frustum.planes) {
    const distance = pointToPlaneDistance(point, plane);
    if (distance < -tolerance) {
      allInside = false;
    } else if (distance > tolerance) {
      allOutside = false;
    }
  }

  return {
    inside: allInside && !allOutside,
    intersects: !allInside && !allOutside,
    outside: allOutside,
  };
}

/**
 * Get all 8 vertices of an AABB.
 * @param aabb
 * @example
 */
function getAABBVertices(aabb: AABB3D): Point3D[] {
  const { x, y, z, width, height, depth } = aabb;
  return [
    { x, y, z },
    { x: x + width, y, z },
    { x, y: y + height, z },
    { x: x + width, y: y + height, z },
    { x, y, z: z + depth },
    { x: x + width, y, z: z + depth },
    { x, y: y + height, z: z + depth },
    { x: x + width, y: y + height, z: z + depth },
  ];
}

/**
 * Test if an AABB is inside/intersecting/outside the frustum.
 * @param aabb
 * @param frustum
 * @param tolerance
 * @example
 */
function testAABB(aabb: AABB3D, frustum: Frustum3D, tolerance: number): CullingResult {
  const vertices = getAABBVertices(aabb);
  let allInside = true;
  let allOutside = true;

  for (const plane of frustum.planes) {
    let planeInside = false;
    let planeOutside = false;

    for (const vertex of vertices) {
      const distance = pointToPlaneDistance(vertex, plane);
      if (distance >= -tolerance) {
        planeInside = true;
      }
      if (distance < -tolerance) {
        planeOutside = true;
      }
    }

    // If all vertices are outside this plane, AABB is outside frustum
    if (!planeInside) {
      return {
        inside: false,
        intersects: false,
        outside: true,
      };
    }

    // If any vertex is outside this plane, not all inside
    if (planeOutside) {
      allInside = false;
    } else {
      allOutside = false;
    }
  }

  return {
    inside: allInside,
    intersects: !allInside && !allOutside,
    outside: allOutside,
  };
}

/**
 * Test if a sphere is inside/intersecting/outside the frustum.
 * @param sphere
 * @param frustum
 * @param tolerance
 * @example
 */
function testSphere(sphere: Sphere3D, frustum: Frustum3D, tolerance: number): CullingResult {
  let allInside = true;
  let allOutside = true;

  for (const plane of frustum.planes) {
    const distance = pointToPlaneDistance(sphere.center, plane);
    const radius = sphere.radius;

    // Sphere is outside if center is more than radius away from plane
    if (distance < -(radius + tolerance)) {
      return {
        inside: false,
        intersects: false,
        outside: true,
      };
    }

    // Sphere intersects if center is within radius of plane
    if (distance < radius - tolerance) {
      allInside = false;
    } else {
      allOutside = false;
    }
  }

  return {
    inside: allInside,
    intersects: !allInside && !allOutside,
    outside: allOutside,
  };
}

/**
 * Validate frustum structure.
 * @param frustum
 * @example
 */
function validateFrustum(frustum: Frustum3D): void {
  if (!frustum.planes || !Array.isArray(frustum.planes)) {
    throw new Error("Frustum must have a planes array");
  }
  if (frustum.planes.length !== 6) {
    throw new Error("Frustum must have exactly 6 planes");
  }
  for (const plane of frustum.planes) {
    if (!plane.normal || typeof plane.normal.x !== 'number') {
      throw new Error("Each plane must have a valid normal vector");
    }
    if (typeof plane.distance !== 'number') {
      throw new Error("Each plane must have a valid distance");
    }
  }
}

/**
 * Frustum Culling implementation.
 */
export class FrustumCulling {
  private config: Required<FrustumCullingConfig>;

  /**
   * Creates a new FrustumCulling instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<FrustumCullingConfig> = {}) {
    this.config = { ...DEFAULT_FRUSTUM_CULLING_CONFIG, ...config };
  }

  /**
   * Test a single object against the frustum.
   * @param object Object to test (AABB, Sphere, or Point).
   * @param frustum View frustum.
   * @returns Culling result.
   * @example
   */
  testObject(object: CullableObject, frustum: Frustum3D): CullingResult {
    if (this.config.validateInput) {
      validateFrustum(frustum);
    }

    // Determine object type and test accordingly
    if ('center' in object && 'radius' in object) {
      // Sphere
      return testSphere(object as Sphere3D, frustum, this.config.tolerance);
    } else if ('x' in object && 'y' in object && 'z' in object && !('width' in object)) {
      // Point
      return testPoint(object as Point3D, frustum, this.config.tolerance);
    } else if ('width' in object && 'height' in object && 'depth' in object) {
      // AABB
      return testAABB(object as AABB3D, frustum, this.config.tolerance);
    } else {
      throw new Error("Unsupported object type for frustum culling");
    }
  }

  /**
   * Test multiple objects against the frustum.
   * @param objects Array of objects to test.
   * @param frustum View frustum.
   * @param options Additional options.
   * @returns Culling results for all objects.
   * @example
   */
  cull(
    objects: CullableObject[],
    frustum: Frustum3D,
    options: Partial<FrustumCullingOptions> = {}
  ): FrustumCullingResult {
    const startTime = performance.now();
    const opts = { ...this.config, ...options };

    if (opts.validateInput) {
      validateFrustum(frustum);
    }

    const results: CullingResult[] = [];
    const insideIndices: number[] = [];
    const intersectingIndices: number[] = [];
    const outsideIndices: number[] = [];

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      if (!object) continue;
      const result = this.testObject(object, frustum);
      results.push(result);

      if (result.inside) {
        insideIndices.push(i);
      } else if (result.intersects) {
        intersectingIndices.push(i);
      } else {
        outsideIndices.push(i);
      }
    }

    const stats: FrustumCullingStats = {
      objectsTested: objects.length,
      objectsInside: insideIndices.length,
      objectsIntersecting: intersectingIndices.length,
      objectsOutside: outsideIndices.length,
      executionTime: performance.now() - startTime,
    };

    return {
      results,
      insideIndices,
      intersectingIndices,
      outsideIndices,
      stats,
    };
  }

  /**
   * Test if an AABB is visible (inside or intersecting).
   * @param aabb Axis-aligned bounding box.
   * @param frustum View frustum.
   * @returns True if visible.
   * @example
   */
  isVisible(aabb: AABB3D, frustum: Frustum3D): boolean {
    const result = this.testObject(aabb, frustum);
    return result.inside || result.intersects;
  }

  /**
   * Test if a sphere is visible (inside or intersecting).
   * @param sphere Sphere.
   * @param frustum View frustum.
   * @returns True if visible.
   * @example
   */
  isSphereVisible(sphere: Sphere3D, frustum: Frustum3D): boolean {
    const result = this.testObject(sphere, frustum);
    return result.inside || result.intersects;
  }

  /**
   * Test if a point is visible.
   * @param point 3D point.
   * @param frustum View frustum.
   * @returns True if visible.
   * @example
   */
  isPointVisible(point: Point3D, frustum: Frustum3D): boolean {
    const result = this.testObject(point, frustum);
    return result.inside;
  }
}
