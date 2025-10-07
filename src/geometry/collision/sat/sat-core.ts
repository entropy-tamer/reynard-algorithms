/**
 * Separating Axis Theorem (SAT) Collision Detection Core Implementation
 *
 * Implementation of the Separating Axis Theorem for collision detection between
 * convex polygons. SAT works by projecting polygons onto perpendicular axes
 * and checking for overlap. If any axis shows no overlap, the polygons don't collide.
 * 
 * Mathematical Theory:
 * For two convex polygons to be separated, there must exist at least one axis
 * (perpendicular to a face or edge) where the projections of both polygons
 * do not overlap. If all possible axes show overlap, the polygons intersect.
 * 
 * The algorithm:
 * 1. Get all potential separation axes (face normals and edge normals)
 * 2. Project both polygons onto each axis
 * 3. Check if projections overlap
 * 4. If any axis shows no overlap, polygons are separated
 * 5. If all axes show overlap, polygons are colliding
 * 
 * The minimum overlap distance and corresponding axis give us the Minimum
 * Translation Vector (MTV) for separating the polygons.
 *
 * @module algorithms/geometry/collision/sat
 */

import type {
  Vector2D,
  Point2D,
  LineSegment,
  ConvexPolygon,
  ProjectionAxis,
  Projection,
  SATCollisionResult,
  SATConfig,
  SATStats,
  SATEvent,
  SATEventType,
  SATEventHandler,
  SATOptions,
  SATCacheEntry,
  SATPerformanceMetrics,
  ContactPoint,
  DetailedCollisionInfo,
  SATBatchResult,
  TransformMatrix,
  TransformedPolygon,
} from './sat-types';

/**
 * Separating Axis Theorem Collision Detection Implementation
 * 
 * Provides comprehensive collision detection between convex polygons using
 * the SAT algorithm with optimizations including caching, early termination,
 * and bounding circle optimization.
 */
export class SAT {
  private config: SATConfig;
  private eventHandlers: SATEventHandler[];
  private cache: Map<string, SATCacheEntry>;
  private stats: SATStats;
  private enableCaching: boolean;
  private enableStats: boolean;
  private enableDebug: boolean;
  private cacheSize: number;
  private axisCache: Map<string, ProjectionAxis[]>;

  constructor(options: Partial<SATOptions> = {}) {
    const opts = { ...DEFAULT_SAT_OPTIONS, ...options };
    
    this.config = { ...DEFAULT_SAT_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableCaching = opts.enableCaching;
    this.enableStats = opts.enableStats;
    this.enableDebug = opts.enableDebug;
    this.cacheSize = opts.cacheSize;
    
    this.cache = new Map();
    this.axisCache = new Map();
    this.stats = {
      totalTests: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      collisionsDetected: 0,
      collisionRate: 0,
      averageAxesTested: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Test collision between two convex polygons using SAT
   * 
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns Collision detection result
   */
  testCollision(polygon1: ConvexPolygon, polygon2: ConvexPolygon): SATCollisionResult {
    const startTime = performance.now();
    this.emitEvent(SATEventType.COLLISION_TEST_STARTED, { polygon1, polygon2 });

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(polygon1, polygon2);
      if (this.enableCaching && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        cached.accessCount++;
        this.emitEvent(SATEventType.CACHE_HIT, { cacheKey });
        
        const result = { ...cached.result };
        result.executionTime = 0; // Cached result
        
        this.updateStats(result, performance.now() - startTime);
        return result;
      }

      this.emitEvent(SATEventType.CACHE_MISS, { cacheKey });

      // Perform SAT collision test
      const result = this.performSATTest(polygon1, polygon2);
      
      // Cache result
      if (this.enableCaching) {
        this.cacheResult(cacheKey, polygon1, polygon2, result);
      }

      this.updateStats(result, performance.now() - startTime);
      
      if (result.colliding) {
        this.emitEvent(SATEventType.COLLISION_DETECTED, result);
      } else {
        this.emitEvent(SATEventType.NO_COLLISION, result);
      }
      
      this.emitEvent(SATEventType.COLLISION_TEST_COMPLETED, result);
      
      return result;
    } catch (error) {
      const result: SATCollisionResult = {
        colliding: false,
        mtv: null,
        overlap: 0,
        separationAxis: null,
        contactPoints: [],
        penetrationDepth: 0,
        executionTime: performance.now() - startTime,
        axesTested: 0,
      };
      
      this.updateStats(result, result.executionTime);
      this.emitEvent(SATEventType.COLLISION_TEST_COMPLETED, result);
      
      return result;
    }
  }

  /**
   * Perform the core SAT collision test
   * 
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns Collision detection result
   */
  private performSATTest(polygon1: ConvexPolygon, polygon2: ConvexPolygon): SATCollisionResult {
    // Early termination with bounding circles
    if (this.config.useBoundingCircleOptimization) {
      if (!this.boundingCirclesOverlap(polygon1, polygon2)) {
        return {
          colliding: false,
          mtv: null,
          overlap: 0,
          separationAxis: null,
          contactPoints: [],
          penetrationDepth: 0,
          executionTime: 0,
          axesTested: 0,
        };
      }
    }

    // Get all potential separation axes
    const axes = this.getSeparationAxes(polygon1, polygon2);
    let minOverlap = Infinity;
    let separationAxis: ProjectionAxis | null = null;
    let axesTested = 0;

    // Test each axis
    for (const axis of axes) {
      axesTested++;
      
      // Project both polygons onto the axis
      const projection1 = this.projectPolygon(polygon1, axis);
      const projection2 = this.projectPolygon(polygon2, axis);
      
      // Check for overlap
      const overlap = this.getProjectionOverlap(projection1, projection2);
      
      if (overlap <= 0) {
        // No overlap found - polygons are separated
        return {
          colliding: false,
          mtv: null,
          overlap: 0,
          separationAxis: axis,
          contactPoints: [],
          penetrationDepth: 0,
          executionTime: 0,
          axesTested,
        };
      }
      
      // Track minimum overlap for MTV calculation
      if (overlap < minOverlap) {
        minOverlap = overlap;
        separationAxis = axis;
      }
      
      // Early termination if we have a good enough separation
      if (this.config.useEarlyTermination && minOverlap < this.config.epsilon) {
        break;
      }
    }

    // All axes show overlap - polygons are colliding
    const mtv = separationAxis ? this.calculateMTV(separationAxis, minOverlap) : null;
    const contactPoints = this.config.findContactPoints ? 
      this.findContactPoints(polygon1, polygon2, separationAxis!) : [];
    const penetrationDepth = this.config.calculatePenetrationDepth ? minOverlap : 0;

    return {
      colliding: true,
      mtv,
      overlap: minOverlap,
      separationAxis,
      contactPoints,
      penetrationDepth,
      executionTime: 0, // Will be set by caller
      axesTested,
    };
  }

  /**
   * Get all potential separation axes for two polygons
   * 
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns Array of potential separation axes
   */
  private getSeparationAxes(polygon1: ConvexPolygon, polygon2: ConvexPolygon): ProjectionAxis[] {
    const cacheKey = this.getAxisCacheKey(polygon1, polygon2);
    
    if (this.config.useAxisCaching && this.axisCache.has(cacheKey)) {
      return this.axisCache.get(cacheKey)!;
    }

    const axes: ProjectionAxis[] = [];
    
    // Get face normals from both polygons
    axes.push(...this.getFaceNormals(polygon1));
    axes.push(...this.getFaceNormals(polygon2));
    
    // Cache the axes
    if (this.config.useAxisCaching) {
      this.axisCache.set(cacheKey, axes);
      this.emitEvent(SATEventType.AXIS_CACHED, { cacheKey, axisCount: axes.length });
    }
    
    return axes;
  }

  /**
   * Get face normals for a polygon
   * 
   * @param polygon The polygon
   * @returns Array of face normal axes
   */
  private getFaceNormals(polygon: ConvexPolygon): ProjectionAxis[] {
    const axes: ProjectionAxis[] = [];
    const vertices = polygon.vertices;
    
    for (let i = 0; i < vertices.length; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % vertices.length];
      
      // Calculate edge vector
      const edge = {
        x: next.x - current.x,
        y: next.y - current.y,
      };
      
      // Calculate face normal (perpendicular to edge)
      const normal = this.normalize({
        x: -edge.y,
        y: edge.x,
      });
      
      axes.push({
        normal,
        isFaceNormal: true,
        faceIndex: i,
      });
    }
    
    return axes;
  }

  /**
   * Project a polygon onto an axis
   * 
   * @param polygon The polygon to project
   * @param axis The axis to project onto
   * @returns Projection result
   */
  private projectPolygon(polygon: ConvexPolygon, axis: ProjectionAxis): Projection {
    const vertices = polygon.vertices;
    let min = Infinity;
    let max = -Infinity;
    
    for (const vertex of vertices) {
      const projection = this.dotProduct(vertex, axis.normal);
      min = Math.min(min, projection);
      max = Math.max(max, projection);
    }
    
    return {
      min,
      max,
      axis,
    };
  }

  /**
   * Calculate overlap between two projections
   * 
   * @param projection1 First projection
   * @param projection2 Second projection
   * @returns Overlap distance (negative if no overlap)
   */
  private getProjectionOverlap(projection1: Projection, projection2: Projection): number {
    const overlap1 = projection1.max - projection2.min;
    const overlap2 = projection2.max - projection1.min;
    
    // Return the smaller overlap (or negative if no overlap)
    return Math.min(overlap1, overlap2);
  }

  /**
   * Calculate Minimum Translation Vector
   * 
   * @param axis The separation axis
   * @param overlap The overlap distance
   * @returns MTV vector
   */
  private calculateMTV(axis: ProjectionAxis, overlap: number): Vector2D {
    return {
      x: axis.normal.x * overlap,
      y: axis.normal.y * overlap,
    };
  }

  /**
   * Find contact points between two colliding polygons
   * 
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @param separationAxis The separation axis
   * @returns Array of contact points
   */
  private findContactPoints(
    polygon1: ConvexPolygon,
    polygon2: ConvexPolygon,
    separationAxis: ProjectionAxis
  ): Point2D[] {
    const contactPoints: Point2D[] = [];
    
    // Find vertices of polygon1 that are inside polygon2
    for (const vertex of polygon1.vertices) {
      if (this.isPointInsidePolygon(vertex, polygon2)) {
        contactPoints.push(vertex);
      }
    }
    
    // Find vertices of polygon2 that are inside polygon1
    for (const vertex of polygon2.vertices) {
      if (this.isPointInsidePolygon(vertex, polygon1)) {
        contactPoints.push(vertex);
      }
    }
    
    // Limit number of contact points
    if (contactPoints.length > this.config.maxContactPoints) {
      contactPoints.splice(this.config.maxContactPoints);
    }
    
    return contactPoints;
  }

  /**
   * Check if a point is inside a polygon using ray casting
   * 
   * @param point The point to test
   * @param polygon The polygon
   * @returns True if point is inside polygon
   */
  private isPointInsidePolygon(point: Point2D, polygon: ConvexPolygon): boolean {
    const vertices = polygon.vertices;
    let inside = false;
    
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const vi = vertices[i];
      const vj = vertices[j];
      
      if (((vi.y > point.y) !== (vj.y > point.y)) &&
          (point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * Check if bounding circles overlap
   * 
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns True if circles overlap
   */
  private boundingCirclesOverlap(polygon1: ConvexPolygon, polygon2: ConvexPolygon): boolean {
    const dx = polygon1.center.x - polygon2.center.x;
    const dy = polygon1.center.y - polygon2.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const combinedRadius = polygon1.radius + polygon2.radius;
    
    return distance <= combinedRadius;
  }

  /**
   * Normalize a vector
   * 
   * @param vector The vector to normalize
   * @returns Normalized vector
   */
  private normalize(vector: Vector2D): Vector2D {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    
    if (length < this.config.epsilon) {
      return { x: 0, y: 0 };
    }
    
    return {
      x: vector.x / length,
      y: vector.y / length,
    };
  }

  /**
   * Calculate dot product of two vectors
   * 
   * @param point Point (treated as vector from origin)
   * @param vector Vector
   * @returns Dot product
   */
  private dotProduct(point: Point2D, vector: Vector2D): number {
    return point.x * vector.x + point.y * vector.y;
  }

  /**
   * Generate cache key for two polygons
   */
  private getCacheKey(polygon1: ConvexPolygon, polygon2: ConvexPolygon): string {
    const id1 = polygon1.id || this.getPolygonHash(polygon1);
    const id2 = polygon2.id || this.getPolygonHash(polygon2);
    return `${id1}-${id2}`;
  }

  /**
   * Generate cache key for axes
   */
  private getAxisCacheKey(polygon1: ConvexPolygon, polygon2: ConvexPolygon): string {
    const id1 = polygon1.id || this.getPolygonHash(polygon1);
    const id2 = polygon2.id || this.getPolygonHash(polygon2);
    return `axes-${id1}-${id2}`;
  }

  /**
   * Generate hash for polygon (simple hash based on vertex count and center)
   */
  private getPolygonHash(polygon: ConvexPolygon): string {
    return `${polygon.vertices.length}-${polygon.center.x}-${polygon.center.y}`;
  }

  /**
   * Cache collision result
   */
  private cacheResult(
    cacheKey: string,
    polygon1: ConvexPolygon,
    polygon2: ConvexPolygon,
    result: SATCollisionResult
  ): void {
    if (this.cache.size >= this.cacheSize) {
      // Remove least recently used entry
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, {
      polygon1Id: polygon1.id || this.getPolygonHash(polygon1),
      polygon2Id: polygon2.id || this.getPolygonHash(polygon2),
      result,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  /**
   * Update statistics
   */
  private updateStats(result: SATCollisionResult, executionTime: number): void {
    if (!this.enableStats) return;
    
    result.executionTime = executionTime;
    
    this.stats.totalTests++;
    this.stats.totalExecutionTime += executionTime;
    this.stats.averageExecutionTime = this.stats.totalExecutionTime / this.stats.totalTests;
    
    if (result.colliding) {
      this.stats.collisionsDetected++;
    }
    
    this.stats.collisionRate = this.stats.collisionsDetected / this.stats.totalTests;
    this.stats.averageAxesTested = (this.stats.averageAxesTested * (this.stats.totalTests - 1) + result.axesTested) / this.stats.totalTests;
    
    // Calculate cache hit rate
    const cacheHits = this.stats.totalTests * this.stats.cacheHitRate + (result.executionTime === 0 ? 1 : 0);
    this.stats.cacheHitRate = cacheHits / this.stats.totalTests;
    
    // Estimate memory usage
    this.stats.memoryUsage = (this.cache.size + this.axisCache.size) * 100; // Rough estimate
  }

  /**
   * Emit event to registered handlers
   */
  private emitEvent(type: SATEventType, data?: any): void {
    if (!this.enableDebug) return;
    
    const event: SATEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in SAT event handler:', error);
      }
    }
  }

  /**
   * Test collision between multiple polygon pairs
   * 
   * @param polygonPairs Array of polygon pairs to test
   * @returns Batch collision test results
   */
  testBatchCollisions(polygonPairs: Array<{ polygon1: ConvexPolygon; polygon2: ConvexPolygon }>): SATBatchResult {
    const startTime = performance.now();
    const results: Array<{ polygon1Id: string | number; polygon2Id: string | number; result: SATCollisionResult }> = [];
    let collisionCount = 0;
    
    for (const { polygon1, polygon2 } of polygonPairs) {
      const result = this.testCollision(polygon1, polygon2);
      results.push({
        polygon1Id: polygon1.id || this.getPolygonHash(polygon1),
        polygon2Id: polygon2.id || this.getPolygonHash(polygon2),
        result,
      });
      
      if (result.colliding) {
        collisionCount++;
      }
    }
    
    const totalExecutionTime = performance.now() - startTime;
    
    return {
      results,
      totalExecutionTime,
      collisionCount,
      stats: { ...this.stats },
    };
  }

  /**
   * Transform a polygon and test collision
   * 
   * @param polygon The polygon to transform
   * @param transform The transformation to apply
   * @param otherPolygon The other polygon to test against
   * @returns Collision detection result
   */
  testTransformedCollision(
    polygon: ConvexPolygon,
    transform: TransformMatrix,
    otherPolygon: ConvexPolygon
  ): SATCollisionResult {
    const transformedPolygon = this.transformPolygon(polygon, transform);
    return this.testCollision(transformedPolygon, otherPolygon);
  }

  /**
   * Transform a polygon using a transformation matrix
   * 
   * @param polygon The polygon to transform
   * @param transform The transformation matrix
   * @returns Transformed polygon
   */
  private transformPolygon(polygon: ConvexPolygon, transform: TransformMatrix): ConvexPolygon {
    const transformedVertices = polygon.vertices.map(vertex => {
      // Apply rotation
      const cos = Math.cos(transform.rotation);
      const sin = Math.sin(transform.rotation);
      
      const rotatedX = vertex.x * cos - vertex.y * sin;
      const rotatedY = vertex.x * sin + vertex.y * cos;
      
      // Apply scale
      const scaledX = rotatedX * transform.scale.x;
      const scaledY = rotatedY * transform.scale.y;
      
      // Apply translation
      return {
        x: scaledX + transform.translation.x,
        y: scaledY + transform.translation.y,
      };
    });
    
    // Transform center
    const cos = Math.cos(transform.rotation);
    const sin = Math.sin(transform.rotation);
    
    const rotatedCenterX = polygon.center.x * cos - polygon.center.y * sin;
    const rotatedCenterY = polygon.center.x * sin + polygon.center.y * cos;
    
    const transformedCenter = {
      x: rotatedCenterX * transform.scale.x + transform.translation.x,
      y: rotatedCenterY * transform.scale.y + transform.translation.y,
    };
    
    return {
      ...polygon,
      vertices: transformedVertices,
      center: transformedCenter,
      radius: polygon.radius * Math.max(transform.scale.x, transform.scale.y),
    };
  }

  /**
   * Add event handler
   */
  addEventHandler(handler: SATEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  removeEventHandler(handler: SATEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get current statistics
   */
  getStats(): SATStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): SATPerformanceMetrics {
    const performanceScore = Math.min(100, Math.max(0,
      (this.stats.collisionRate * 30) +
      (this.stats.cacheHitRate * 40) +
      (Math.max(0, 1 - this.stats.averageExecutionTime / 10) * 30)
    ));
    
    return {
      memoryUsage: this.stats.memoryUsage,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.cacheHitRate,
      averageTestTime: this.stats.averageExecutionTime,
      performanceScore,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.axisCache.clear();
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalTests: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      collisionsDetected: 0,
      collisionRate: 0,
      averageAxesTested: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SATConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Import default options
import { DEFAULT_SAT_OPTIONS } from './sat-types';
