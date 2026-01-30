/**
 * @file Canonical Type Definitions
 *
 * Single source of truth for core geometric and spatial types used throughout
 * the algorithms package. All modules should import from here to avoid type aliasing.
 */

/**
 * 2D Point type - canonical definition
 */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * 2D Point type (mutable variant)
 */
export interface MutablePoint {
  x: number;
  y: number;
}

/**
 * 3D Point type
 */
export interface Point3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * 3D Point type (mutable variant)
 */
export interface MutablePoint3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 2D Vector type - canonical definition
 */
export interface Vector {
  readonly x: number;
  readonly y: number;
}

/**
 * 2D Vector type (mutable variant)
 */
export interface MutableVector {
  x: number;
  y: number;
}

/**
 * 3D Vector type
 */
export interface Vector3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * 3D Vector type (mutable variant)
 */
export interface MutableVector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Line segment defined by two points
 */
export interface Line {
  readonly start: Point;
  readonly end: Point;
}

/**
 * Rectangle defined by position and dimensions
 */
export interface Rectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Circle defined by center point and radius
 */
export interface Circle {
  readonly center: Point;
  readonly radius: number;
}

/**
 * Polygon defined by array of points
 */
export interface Polygon {
  readonly points: readonly Point[];
}

/**
 * Axis-Aligned Bounding Box
 */
export interface AABB {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * 3D Axis-Aligned Bounding Box
 */
export interface AABB3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
}

/**
 * 3D Bounding Box
 */
export interface BoundingBox {
  readonly min: Point;
  readonly max: Point;
}

/**
 * 3D Bounding Box
 */
export interface BoundingBox3D {
  readonly min: Point3D;
  readonly max: Point3D;
}

/**
 * 3D Sphere
 */
export interface Sphere3D {
  readonly center: Point3D;
  readonly radius: number;
}

/**
 * 3D Ray
 */
export interface Ray3D {
  readonly origin: Point3D;
  readonly direction: Vector3D;
}

/**
 * 3D Frustum
 */
export interface Frustum3D {
  readonly planes: readonly Plane3D[];
}

/**
 * 3D Plane
 */
export interface Plane3D {
  readonly normal: Vector3D;
  readonly distance: number;
}

/**
 * Transform for 2D geometric transformations
 */
export interface Transform {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

// Re-export spatial and performance types from their respective modules
export type {
  SpatialData,
  SpatialObjectData,
  GameEntityData,
  CollisionData,
  RenderData,
  CollisionObjectData,
  SpatialDataType,
  SpatialObject,
  SpatialQueryResult,
} from "./spatial-types";

export type {
  PerformanceMemoryInfo,
  PerformanceMemoryAPI,
  ExtendedPerformance,
  ExtendedGlobal,
  ThrottleOptions,
  DebounceOptions,
  FunctionSignature,
  ThrottledFunction,
  DebouncedFunction,
  MemoryPoolConfig,
  PooledObject,
  MemoryPoolStats as PerformanceMemoryPoolStats,
  SpatialHashConfig,
  SpatialHashStats,
} from "./performance-types";
