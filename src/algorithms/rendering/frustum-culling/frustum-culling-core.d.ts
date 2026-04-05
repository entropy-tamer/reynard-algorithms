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
import type { Frustum3D, AABB3D, Sphere3D, Point3D } from "../../../core/types";
import type { FrustumCullingConfig, FrustumCullingResult, CullingResult, FrustumCullingOptions, CullableObject } from "./frustum-culling-types";
/**
 * Frustum Culling implementation.
 */
export declare class FrustumCulling {
    private config;
    /**
     * Creates a new FrustumCulling instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<FrustumCullingConfig>);
    /**
     * Test a single object against the frustum.
     * @param object Object to test (AABB, Sphere, or Point).
     * @param frustum View frustum.
     * @returns Culling result.
     * @example
     */
    testObject(object: CullableObject, frustum: Frustum3D): CullingResult;
    /**
     * Test multiple objects against the frustum.
     * @param objects Array of objects to test.
     * @param frustum View frustum.
     * @param options Additional options.
     * @returns Culling results for all objects.
     * @example
     */
    cull(objects: CullableObject[], frustum: Frustum3D, options?: Partial<FrustumCullingOptions>): FrustumCullingResult;
    /**
     * Test if an AABB is visible (inside or intersecting).
     * @param aabb Axis-aligned bounding box.
     * @param frustum View frustum.
     * @returns True if visible.
     * @example
     */
    isVisible(aabb: AABB3D, frustum: Frustum3D): boolean;
    /**
     * Test if a sphere is visible (inside or intersecting).
     * @param sphere Sphere.
     * @param frustum View frustum.
     * @returns True if visible.
     * @example
     */
    isSphereVisible(sphere: Sphere3D, frustum: Frustum3D): boolean;
    /**
     * Test if a point is visible.
     * @param point 3D point.
     * @param frustum View frustum.
     * @returns True if visible.
     * @example
     */
    isPointVisible(point: Point3D, frustum: Frustum3D): boolean;
}
//# sourceMappingURL=frustum-culling-core.d.ts.map