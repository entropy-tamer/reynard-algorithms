/**
 * Separating Axis Theorem (SAT) Collision Detection Types
 *
 * Comprehensive type definitions for the Separating Axis Theorem (SAT)
 * collision detection algorithm. SAT is a method for determining if two
 * convex polygons intersect by projecting them onto perpendicular axes
 * and checking for overlap.
 *
 * @module algorithms/geometry/collision/sat
 */

/**
 * Represents a 2D vector
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Represents a 2D point
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Represents a 2D line segment
 */
export interface LineSegment {
  start: Point2D;
  end: Point2D;
}

/**
 * Represents a convex polygon for SAT collision detection
 */
export interface ConvexPolygon {
  /** Vertices of the polygon in counter-clockwise order */
  vertices: Point2D[];
  /** Center point of the polygon */
  center: Point2D;
  /** Bounding radius for quick rejection */
  radius: number;
  /** Unique identifier */
  id?: string | number;
  /** Additional data */
  data?: any;
}

/**
 * Represents an axis for projection
 */
export interface ProjectionAxis {
  /** Normal vector of the axis */
  normal: Vector2D;
  /** Whether this is a face normal or edge normal */
  isFaceNormal: boolean;
  /** Index of the face/edge this axis belongs to */
  faceIndex?: number;
}

/**
 * Represents a projection of a polygon onto an axis
 */
export interface Projection {
  /** Minimum value of the projection */
  min: number;
  /** Maximum value of the projection */
  max: number;
  /** The axis this projection is on */
  axis: ProjectionAxis;
}

/**
 * Result of SAT collision detection
 */
export interface SATCollisionResult {
  /** Whether the polygons are colliding */
  colliding: boolean;
  /** Minimum translation vector to separate the polygons */
  mtv: Vector2D | null;
  /** Minimum overlap distance */
  overlap: number;
  /** The axis with minimum overlap (separation axis) */
  separationAxis: ProjectionAxis | null;
  /** Contact points between the polygons */
  contactPoints: Point2D[];
  /** Penetration depth */
  penetrationDepth: number;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Number of axes tested */
  axesTested: number;
}

/**
 * Configuration options for SAT algorithm
 */
export interface SATConfig {
  /** Tolerance for floating-point comparisons */
  epsilon: number;
  /** Maximum number of contact points to find */
  maxContactPoints: number;
  /** Whether to use early termination optimization */
  useEarlyTermination: boolean;
  /** Whether to cache axis calculations */
  useAxisCaching: boolean;
  /** Whether to use bounding circle optimization */
  useBoundingCircleOptimization: boolean;
  /** Whether to find contact points */
  findContactPoints: boolean;
  /** Whether to calculate penetration depth */
  calculatePenetrationDepth: boolean;
}

/**
 * Statistics for SAT algorithm performance
 */
export interface SATStats {
  /** Total number of collision tests performed */
  totalTests: number;
  /** Total execution time */
  totalExecutionTime: number;
  /** Average execution time per test */
  averageExecutionTime: number;
  /** Number of collisions detected */
  collisionsDetected: number;
  /** Collision detection rate (0-1) */
  collisionRate: number;
  /** Average number of axes tested per collision */
  averageAxesTested: number;
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
  /** Memory usage in bytes */
  memoryUsage: number;
}

/**
 * Event types for SAT algorithm
 */
export enum SATEventType {
  COLLISION_TEST_STARTED = 'collision_test_started',
  COLLISION_TEST_COMPLETED = 'collision_test_completed',
  COLLISION_DETECTED = 'collision_detected',
  NO_COLLISION = 'no_collision',
  AXIS_CACHED = 'axis_cached',
  CACHE_HIT = 'cache_hit',
  CACHE_MISS = 'cache_miss',
}

/**
 * Event data for SAT algorithm events
 */
export interface SATEvent {
  /** Event type */
  type: SATEventType;
  /** Timestamp of the event */
  timestamp: number;
  /** Additional event data */
  data?: any;
}

/**
 * Event handler function type
 */
export type SATEventHandler = (event: SATEvent) => void;

/**
 * Options for SAT algorithm initialization
 */
export interface SATOptions {
  /** Configuration settings */
  config: Partial<SATConfig>;
  /** Event handlers */
  eventHandlers?: SATEventHandler[];
  /** Whether to enable caching */
  enableCaching: boolean;
  /** Cache size limit */
  cacheSize: number;
  /** Whether to enable statistics collection */
  enableStats: boolean;
  /** Whether to enable debugging */
  enableDebug: boolean;
}

/**
 * Cache entry for SAT results
 */
export interface SATCacheEntry {
  /** First polygon ID */
  polygon1Id: string | number;
  /** Second polygon ID */
  polygon2Id: string | number;
  /** Cached collision result */
  result: SATCollisionResult;
  /** Timestamp when cached */
  timestamp: number;
  /** Number of times accessed */
  accessCount: number;
}

/**
 * Performance metrics for SAT algorithm
 */
export interface SATPerformanceMetrics {
  /** Current memory usage */
  memoryUsage: number;
  /** Cache size */
  cacheSize: number;
  /** Cache hit rate */
  cacheHitRate: number;
  /** Average collision test time */
  averageTestTime: number;
  /** Performance score (0-100) */
  performanceScore: number;
}

/**
 * Contact point information
 */
export interface ContactPoint {
  /** Position of the contact point */
  position: Point2D;
  /** Normal vector at the contact point */
  normal: Vector2D;
  /** Penetration depth at this contact point */
  penetration: number;
  /** Whether this is a vertex-face contact */
  isVertexFace: boolean;
}

/**
 * Detailed collision information
 */
export interface DetailedCollisionInfo {
  /** Basic collision result */
  result: SATCollisionResult;
  /** All contact points found */
  contactPoints: ContactPoint[];
  /** Separation axes tested */
  separationAxes: ProjectionAxis[];
  /** Projections of both polygons on separation axis */
  projections: {
    polygon1: Projection;
    polygon2: Projection;
  };
  /** Whether collision was detected using bounding circles */
  usedBoundingCircleOptimization: boolean;
}

/**
 * Batch collision test result
 */
export interface SATBatchResult {
  /** Results for each pair tested */
  results: Array<{
    polygon1Id: string | number;
    polygon2Id: string | number;
    result: SATCollisionResult;
  }>;
  /** Total execution time */
  totalExecutionTime: number;
  /** Number of collisions found */
  collisionCount: number;
  /** Statistics for the batch */
  stats: SATStats;
}

/**
 * Polygon transformation matrix
 */
export interface TransformMatrix {
  /** Translation component */
  translation: Vector2D;
  /** Rotation angle in radians */
  rotation: number;
  /** Scale factors */
  scale: Vector2D;
}

/**
 * Transformed polygon for collision testing
 */
export interface TransformedPolygon extends ConvexPolygon {
  /** Original polygon before transformation */
  original: ConvexPolygon;
  /** Transformation matrix applied */
  transform: TransformMatrix;
}

/**
 * Default configuration for SAT algorithm
 */
export const DEFAULT_SAT_CONFIG: SATConfig = {
  epsilon: 1e-10,
  maxContactPoints: 4,
  useEarlyTermination: true,
  useAxisCaching: true,
  useBoundingCircleOptimization: true,
  findContactPoints: true,
  calculatePenetrationDepth: true,
};

/**
 * Default options for SAT algorithm
 */
export const DEFAULT_SAT_OPTIONS: SATOptions = {
  config: DEFAULT_SAT_CONFIG,
  enableCaching: true,
  cacheSize: 1000,
  enableStats: true,
  enableDebug: false,
};

/**
 * Common polygon shapes for testing
 */
export const COMMON_POLYGONS = {
  /** Unit square centered at origin */
  UNIT_SQUARE: {
    vertices: [
      { x: -0.5, y: -0.5 },
      { x: 0.5, y: -0.5 },
      { x: 0.5, y: 0.5 },
      { x: -0.5, y: 0.5 },
    ],
    center: { x: 0, y: 0 },
    radius: Math.sqrt(2) / 2,
  } as ConvexPolygon,
  
  /** Unit triangle centered at origin */
  UNIT_TRIANGLE: {
    vertices: [
      { x: 0, y: -0.577 },
      { x: -0.5, y: 0.289 },
      { x: 0.5, y: 0.289 },
    ],
    center: { x: 0, y: 0 },
    radius: 0.577,
  } as ConvexPolygon,
  
  /** Unit hexagon centered at origin */
  UNIT_HEXAGON: {
    vertices: [
      { x: 0.5, y: 0 },
      { x: 0.25, y: 0.433 },
      { x: -0.25, y: 0.433 },
      { x: -0.5, y: 0 },
      { x: -0.25, y: -0.433 },
      { x: 0.25, y: -0.433 },
    ],
    center: { x: 0, y: 0 },
    radius: 0.5,
  } as ConvexPolygon,
};

