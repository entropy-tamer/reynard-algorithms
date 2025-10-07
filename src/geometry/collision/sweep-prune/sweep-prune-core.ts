/**
 * Sweep and Prune Collision Detection Core Implementation
 *
 * Implementation of the Sweep and Prune algorithm for broad-phase collision
 * detection. This algorithm sorts objects along coordinate axes and detects
 * potential collisions by finding overlapping intervals.
 * 
 * Mathematical Theory:
 * Sweep and Prune works by:
 * 1. Creating endpoints for each AABB on each axis (min and max coordinates)
 * 2. Sorting endpoints along each axis
 * 3. Sweeping through sorted endpoints, maintaining active set
 * 4. Detecting collisions when AABBs are both active on all axes
 * 
 * Time Complexity:
 * - Sorting: O(n log n) per axis
 * - Sweeping: O(n + k) where k is number of collisions
 * - Overall: O(n log n + k) for 2D
 * 
 * Space Complexity: O(n) for storing endpoints and active sets
 *
 * @module algorithms/geometry/collision/sweep-prune
 */

import type {
  AABB,
  Endpoint,
  CollisionPair,
  SweepPruneResult,
  SweepPruneConfig,
  SweepPruneStats,
  SweepPruneEvent,
  SweepPruneEventType,
  SweepPruneEventHandler,
  SweepPruneOptions,
  SweepPruneCacheEntry,
  SweepPrunePerformanceMetrics,
  SpatialCell,
  IncrementalUpdate,
  BatchUpdateResult,
  SortingOptions,
  AxisSweepResult,
  MultiAxisSweepResult,
} from './sweep-prune-types';

/**
 * Sweep and Prune Collision Detection Implementation
 * 
 * Provides efficient broad-phase collision detection using the sweep and prune
 * algorithm with optimizations including temporal coherence, multi-axis optimization,
 * and spatial partitioning for large datasets.
 */
export class SweepPrune {
  private config: SweepPruneConfig;
  private eventHandlers: SweepPruneEventHandler[];
  private cache: Map<string, SweepPruneCacheEntry>;
  private stats: SweepPruneStats;
  private enableCaching: boolean;
  private enableStats: boolean;
  private enableDebug: boolean;
  private cacheSize: number;
  
  // Active data structures
  private aabbs: Map<string | number, AABB>;
  private activeCollisionPairs: Map<string, CollisionPair>;
  private lastUpdateTime: number;
  private spatialCells: Map<string, SpatialCell>;

  constructor(options: Partial<SweepPruneOptions> = {}) {
    const opts = { ...DEFAULT_SWEEP_PRUNE_OPTIONS, ...options };
    
    this.config = { ...DEFAULT_SWEEP_PRUNE_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableCaching = opts.enableCaching;
    this.enableStats = opts.enableStats;
    this.enableDebug = opts.enableDebug;
    this.cacheSize = opts.cacheSize;
    
    this.cache = new Map();
    this.aabbs = new Map();
    this.activeCollisionPairs = new Map();
    this.spatialCells = new Map();
    this.lastUpdateTime = 0;
    
    this.stats = {
      totalOperations: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      totalAABBsProcessed: 0,
      averageAABBsPerOperation: 0,
      totalCollisionPairs: 0,
      averageCollisionPairsPerOperation: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Add an AABB to the collision detection system
   * 
   * @param aabb The AABB to add
   */
  addAABB(aabb: AABB): void {
    this.aabbs.set(aabb.id, aabb);
    this.emitEvent(SweepPruneEventType.AABB_ADDED, { aabb });
    
    if (this.config.enableIncrementalUpdates) {
      this.performIncrementalUpdate(aabb, 'add');
    }
  }

  /**
   * Remove an AABB from the collision detection system
   * 
   * @param aabbId The ID of the AABB to remove
   */
  removeAABB(aabbId: string | number): void {
    const aabb = this.aabbs.get(aabbId);
    if (aabb) {
      this.aabbs.delete(aabbId);
      this.emitEvent(SweepPruneEventType.AABB_REMOVED, { aabb });
      
      if (this.config.enableIncrementalUpdates) {
        this.performIncrementalUpdate(aabb, 'remove');
      }
    }
  }

  /**
   * Update an existing AABB
   * 
   * @param aabb The updated AABB
   */
  updateAABB(aabb: AABB): void {
    const existingAABB = this.aabbs.get(aabb.id);
    if (existingAABB) {
      this.aabbs.set(aabb.id, aabb);
      this.emitEvent(SweepPruneEventType.AABB_UPDATED, { aabb, previousAABB: existingAABB });
      
      if (this.config.enableIncrementalUpdates) {
        this.performIncrementalUpdate(aabb, 'update', existingAABB);
      }
    }
  }

  /**
   * Perform collision detection using sweep and prune algorithm
   * 
   * @param aabbs Optional array of AABBs to test (uses internal AABBs if not provided)
   * @returns Collision detection result
   */
  detectCollisions(aabbs?: AABB[]): SweepPruneResult {
    const startTime = performance.now();
    this.emitEvent(SweepPruneEventType.COLLISION_DETECTION_STARTED, { aabbCount: aabbs?.length || this.aabbs.size });

    try {
      const testAABBs = aabbs || Array.from(this.aabbs.values());
      
      // Check cache first
      const cacheKey = this.getCacheKey(testAABBs);
      if (this.enableCaching && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        cached.accessCount++;
        this.emitEvent(SweepPruneEventType.CACHE_HIT, { cacheKey });
        
        const result = { ...cached.collisionPairs };
        this.updateStats(result, performance.now() - startTime, testAABBs.length);
        return {
          collisionPairs: result,
          totalAABBs: testAABBs.length,
          activeCollisions: result.filter(pair => pair.active).length,
          executionTime: 0,
          endpointsProcessed: 0,
          axisSweeps: 0,
        };
      }

      this.emitEvent(SweepPruneEventType.CACHE_MISS, { cacheKey });

      // Perform sweep and prune
      const result = this.performSweepPrune(testAABBs);
      
      // Cache result
      if (this.enableCaching) {
        this.cacheResult(cacheKey, result.collisionPairs);
      }

      this.updateStats(result.collisionPairs, performance.now() - startTime, testAABBs.length);
      this.emitEvent(SweepPruneEventType.COLLISION_DETECTION_COMPLETED, result);
      
      return result;
    } catch (error) {
      const result: SweepPruneResult = {
        collisionPairs: [],
        totalAABBs: 0,
        activeCollisions: 0,
        executionTime: performance.now() - startTime,
        endpointsProcessed: 0,
        axisSweeps: 0,
      };
      
      this.updateStats([], result.executionTime, 0);
      this.emitEvent(SweepPruneEventType.COLLISION_DETECTION_COMPLETED, result);
      
      return result;
    }
  }

  /**
   * Perform the core sweep and prune algorithm
   * 
   * @param aabbs Array of AABBs to test
   * @returns Collision detection result
   */
  private performSweepPrune(aabbs: AABB[]): SweepPruneResult {
    if (aabbs.length === 0) {
      return {
        collisionPairs: [],
        totalAABBs: 0,
        activeCollisions: 0,
        executionTime: 0,
        endpointsProcessed: 0,
        axisSweeps: 0,
      };
    }

    // Use spatial partitioning for large datasets
    if (this.config.useSpatialPartitioning && aabbs.length > this.config.maxAABBs) {
      return this.performSpatialPartitionedSweepPrune(aabbs);
    }

    // Use multi-axis optimization
    if (this.config.useMultiAxisOptimization) {
      return this.performMultiAxisSweepPrune(aabbs);
    }

    // Standard single-axis sweep and prune
    return this.performSingleAxisSweepPrune(aabbs);
  }

  /**
   * Perform sweep and prune on a single axis
   * 
   * @param aabbs Array of AABBs to test
   * @returns Collision detection result
   */
  private performSingleAxisSweepPrune(aabbs: AABB[]): SweepPruneResult {
    const collisionPairs: CollisionPair[] = [];
    let endpointsProcessed = 0;
    let axisSweeps = 0;

    // Test both X and Y axes
    for (let axis = 0; axis < 2; axis++) {
      axisSweeps++;
      this.emitEvent(SweepPruneEventType.AXIS_SWEEP_STARTED, { axis, aabbCount: aabbs.length });

      const axisResult = this.sweepAxis(aabbs, axis);
      endpointsProcessed += axisResult.endpointsProcessed;
      
      // For first axis, collect all potential pairs
      if (axis === 0) {
        collisionPairs.push(...axisResult.collisionPairs);
      } else {
        // For second axis, filter pairs that are still active
        this.filterCollisionPairs(collisionPairs, axisResult.collisionPairs);
      }

      this.emitEvent(SweepPruneEventType.AXIS_SWEEP_COMPLETED, { axis, pairsFound: axisResult.collisionPairs.length });
    }

    // Mark active pairs
    const activeCollisions = collisionPairs.filter(pair => pair.active).length;

    return {
      collisionPairs,
      totalAABBs: aabbs.length,
      activeCollisions,
      executionTime: 0, // Will be set by caller
      endpointsProcessed,
      axisSweeps,
    };
  }

  /**
   * Perform sweep and prune on multiple axes simultaneously
   * 
   * @param aabbs Array of AABBs to test
   * @returns Collision detection result
   */
  private performMultiAxisSweepPrune(aabbs: AABB[]): SweepPruneResult {
    const axisResults: AxisSweepResult[] = [];
    let totalEndpointsProcessed = 0;
    let totalAxisSweeps = 0;

    // Sweep each axis
    for (let axis = 0; axis < 2; axis++) {
      totalAxisSweeps++;
      const axisResult = this.sweepAxis(aabbs, axis);
      axisResults.push({
        axis,
        endpointsProcessed: axisResult.endpointsProcessed,
        collisionPairsFound: axisResult.collisionPairs.length,
        executionTime: 0,
        isLimiting: false,
      });
      totalEndpointsProcessed += axisResult.endpointsProcessed;
    }

    // Find intersection of collision pairs from all axes
    const combinedPairs = this.intersectCollisionPairs(axisResults.map(r => 
      this.sweepAxis(aabbs, r.axis).collisionPairs
    ));

    const activeCollisions = combinedPairs.filter(pair => pair.active).length;

    return {
      collisionPairs: combinedPairs,
      totalAABBs: aabbs.length,
      activeCollisions,
      executionTime: 0, // Will be set by caller
      endpointsProcessed: totalEndpointsProcessed,
      axisSweeps: totalAxisSweeps,
    };
  }

  /**
   * Perform sweep and prune with spatial partitioning
   * 
   * @param aabbs Array of AABBs to test
   * @returns Collision detection result
   */
  private performSpatialPartitionedSweepPrune(aabbs: AABB[]): SweepPruneResult {
    // Partition AABBs into spatial cells
    const cells = this.partitionAABBs(aabbs);
    const allCollisionPairs: CollisionPair[] = [];
    let totalEndpointsProcessed = 0;
    let totalAxisSweeps = 0;

    // Process each cell
    for (const cell of cells.values()) {
      if (cell.aabbs.length > 1) {
        const cellResult = this.performSingleAxisSweepPrune(cell.aabbs);
        allCollisionPairs.push(...cellResult.collisionPairs);
        totalEndpointsProcessed += cellResult.endpointsProcessed;
        totalAxisSweeps += cellResult.axisSweeps;
      }
    }

    // Check for collisions between adjacent cells
    const interCellPairs = this.checkInterCellCollisions(cells);
    allCollisionPairs.push(...interCellPairs);

    const activeCollisions = allCollisionPairs.filter(pair => pair.active).length;

    return {
      collisionPairs: allCollisionPairs,
      totalAABBs: aabbs.length,
      activeCollisions,
      executionTime: 0, // Will be set by caller
      endpointsProcessed: totalEndpointsProcessed,
      axisSweeps: totalAxisSweeps,
    };
  }

  /**
   * Sweep a single axis and find collision pairs
   * 
   * @param aabbs Array of AABBs to test
   * @param axis Axis to sweep (0 = x, 1 = y)
   * @returns Axis sweep result
   */
  private sweepAxis(aabbs: AABB[], axis: number): { collisionPairs: CollisionPair[]; endpointsProcessed: number } {
    // Create endpoints for this axis
    const endpoints: Endpoint[] = [];
    for (const aabb of aabbs) {
      const minValue = axis === 0 ? aabb.minX : aabb.minY;
      const maxValue = axis === 0 ? aabb.maxX : aabb.maxY;
      
      endpoints.push(
        { aabb, isStart: true, value: minValue, axis },
        { aabb, isStart: false, value: maxValue, axis }
      );
    }

    // Sort endpoints
    this.sortEndpoints(endpoints);
    this.emitEvent(SweepPruneEventType.SORTING_PERFORMED, { axis, endpointCount: endpoints.length });

    // Sweep through endpoints
    const activeAABBs = new Set<AABB>();
    const collisionPairs: CollisionPair[] = [];

    for (const endpoint of endpoints) {
      if (endpoint.isStart) {
        // AABB starts - check for collisions with active AABBs
        for (const activeAABB of activeAABBs) {
          if (this.aabbsOverlapOnAxis(endpoint.aabb, activeAABB, axis)) {
            const pair = this.createCollisionPair(endpoint.aabb, activeAABB);
            collisionPairs.push(pair);
            this.emitEvent(SweepPruneEventType.COLLISION_PAIR_FOUND, { pair });
          }
        }
        activeAABBs.add(endpoint.aabb);
      } else {
        // AABB ends - remove from active set
        activeAABBs.delete(endpoint.aabb);
      }
    }

    return {
      collisionPairs,
      endpointsProcessed: endpoints.length,
    };
  }

  /**
   * Sort endpoints using appropriate algorithm
   * 
   * @param endpoints Array of endpoints to sort
   */
  private sortEndpoints(endpoints: Endpoint[]): void {
    if (endpoints.length <= this.config.insertionSortThreshold && this.config.useInsertionSort) {
      this.insertionSort(endpoints);
    } else {
      this.quickSort(endpoints);
    }
  }

  /**
   * Insertion sort for small arrays
   * 
   * @param endpoints Array of endpoints to sort
   */
  private insertionSort(endpoints: Endpoint[]): void {
    for (let i = 1; i < endpoints.length; i++) {
      const key = endpoints[i];
      let j = i - 1;
      
      while (j >= 0 && this.compareEndpoints(endpoints[j], key) > 0) {
        endpoints[j + 1] = endpoints[j];
        j--;
      }
      
      endpoints[j + 1] = key;
    }
  }

  /**
   * Quick sort for larger arrays
   * 
   * @param endpoints Array of endpoints to sort
   */
  private quickSort(endpoints: Endpoint[]): void {
    this.quickSortRecursive(endpoints, 0, endpoints.length - 1);
  }

  /**
   * Recursive quick sort implementation
   * 
   * @param endpoints Array of endpoints to sort
   * @param low Starting index
   * @param high Ending index
   */
  private quickSortRecursive(endpoints: Endpoint[], low: number, high: number): void {
    if (low < high) {
      const pivotIndex = this.partition(endpoints, low, high);
      this.quickSortRecursive(endpoints, low, pivotIndex - 1);
      this.quickSortRecursive(endpoints, pivotIndex + 1, high);
    }
  }

  /**
   * Partition function for quick sort
   * 
   * @param endpoints Array of endpoints to sort
   * @param low Starting index
   * @param high Ending index
   * @returns Pivot index
   */
  private partition(endpoints: Endpoint[], low: number, high: number): number {
    const pivot = endpoints[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (this.compareEndpoints(endpoints[j], pivot) <= 0) {
        i++;
        [endpoints[i], endpoints[j]] = [endpoints[j], endpoints[i]];
      }
    }
    
    [endpoints[i + 1], endpoints[high]] = [endpoints[high], endpoints[i + 1]];
    return i + 1;
  }

  /**
   * Compare two endpoints for sorting
   * 
   * @param a First endpoint
   * @param b Second endpoint
   * @returns Comparison result (-1, 0, 1)
   */
  private compareEndpoints(a: Endpoint, b: Endpoint): number {
    // Primary sort by value
    if (Math.abs(a.value - b.value) > this.config.epsilon) {
      return a.value - b.value;
    }
    
    // Secondary sort by start/end (start comes first)
    if (a.isStart !== b.isStart) {
      return a.isStart ? -1 : 1;
    }
    
    // Tertiary sort by AABB ID for stability
    return String(a.aabb.id).localeCompare(String(b.aabb.id));
  }

  /**
   * Check if two AABBs overlap on a specific axis
   * 
   * @param aabb1 First AABB
   * @param aabb2 Second AABB
   * @param axis Axis to check (0 = x, 1 = y)
   * @returns True if AABBs overlap on the axis
   */
  private aabbsOverlapOnAxis(aabb1: AABB, aabb2: AABB, axis: number): boolean {
    if (axis === 0) {
      return aabb1.minX <= aabb2.maxX && aabb2.minX <= aabb1.maxX;
    } else {
      return aabb1.minY <= aabb2.maxY && aabb2.minY <= aabb1.maxY;
    }
  }

  /**
   * Create a collision pair from two AABBs
   * 
   * @param aabb1 First AABB
   * @param aabb2 Second AABB
   * @returns Collision pair
   */
  private createCollisionPair(aabb1: AABB, aabb2: AABB): CollisionPair {
    const pairId = this.getPairId(aabb1, aabb2);
    const existingPair = this.activeCollisionPairs.get(pairId);
    
    if (existingPair) {
      existingPair.active = true;
      existingPair.lastUpdate = Date.now();
      return existingPair;
    }
    
    const newPair: CollisionPair = {
      aabb1,
      aabb2,
      active: true,
      lastUpdate: Date.now(),
    };
    
    this.activeCollisionPairs.set(pairId, newPair);
    return newPair;
  }

  /**
   * Generate unique ID for a collision pair
   * 
   * @param aabb1 First AABB
   * @param aabb2 Second AABB
   * @returns Unique pair ID
   */
  private getPairId(aabb1: AABB, aabb2: AABB): string {
    const id1 = String(aabb1.id);
    const id2 = String(aabb2.id);
    return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
  }

  /**
   * Filter collision pairs based on second axis results
   * 
   * @param pairs First axis collision pairs
   * @param secondAxisPairs Second axis collision pairs
   */
  private filterCollisionPairs(pairs: CollisionPair[], secondAxisPairs: CollisionPair[]): void {
    const secondAxisPairIds = new Set(secondAxisPairs.map(pair => this.getPairId(pair.aabb1, pair.aabb2)));
    
    for (const pair of pairs) {
      const pairId = this.getPairId(pair.aabb1, pair.aabb2);
      pair.active = secondAxisPairIds.has(pairId);
      
      if (!pair.active) {
        this.emitEvent(SweepPruneEventType.COLLISION_PAIR_LOST, { pair });
      }
    }
  }

  /**
   * Find intersection of collision pairs from multiple axes
   * 
   * @param axisPairArrays Array of collision pair arrays from each axis
   * @returns Intersected collision pairs
   */
  private intersectCollisionPairs(axisPairArrays: CollisionPair[][]): CollisionPair[] {
    if (axisPairArrays.length === 0) return [];
    if (axisPairArrays.length === 1) return axisPairArrays[0];
    
    // Start with first axis pairs
    let result = axisPairArrays[0];
    
    // Intersect with each subsequent axis
    for (let i = 1; i < axisPairArrays.length; i++) {
      const currentAxisPairs = axisPairArrays[i];
      const currentAxisPairIds = new Set(currentAxisPairs.map(pair => this.getPairId(pair.aabb1, pair.aabb2)));
      
      result = result.filter(pair => {
        const pairId = this.getPairId(pair.aabb1, pair.aabb2);
        return currentAxisPairIds.has(pairId);
      });
    }
    
    return result;
  }

  /**
   * Partition AABBs into spatial cells
   * 
   * @param aabbs Array of AABBs to partition
   * @returns Map of spatial cells
   */
  private partitionAABBs(aabbs: AABB[]): Map<string, SpatialCell> {
    const cells = new Map<string, SpatialCell>();
    
    for (const aabb of aabbs) {
      const cellKey = this.getSpatialCellKey(aabb);
      
      if (!cells.has(cellKey)) {
        cells.set(cellKey, {
          bounds: this.getCellBounds(cellKey),
          aabbs: [],
          active: true,
        });
      }
      
      cells.get(cellKey)!.aabbs.push(aabb);
    }
    
    return cells;
  }

  /**
   * Get spatial cell key for an AABB
   * 
   * @param aabb The AABB
   * @returns Cell key
   */
  private getSpatialCellKey(aabb: AABB): string {
    const cellX = Math.floor(aabb.minX / this.config.spatialCellSize);
    const cellY = Math.floor(aabb.minY / this.config.spatialCellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Get bounds for a spatial cell
   * 
   * @param cellKey The cell key
   * @returns Cell bounds
   */
  private getCellBounds(cellKey: string): AABB {
    const [cellX, cellY] = cellKey.split(',').map(Number);
    const cellSize = this.config.spatialCellSize;
    
    return {
      minX: cellX * cellSize,
      minY: cellY * cellSize,
      maxX: (cellX + 1) * cellSize,
      maxY: (cellY + 1) * cellSize,
      id: `cell-${cellKey}`,
    };
  }

  /**
   * Check for collisions between adjacent spatial cells
   * 
   * @param cells Map of spatial cells
   * @returns Inter-cell collision pairs
   */
  private checkInterCellCollisions(cells: Map<string, SpatialCell>): CollisionPair[] {
    const interCellPairs: CollisionPair[] = [];
    
    for (const [cellKey, cell] of cells) {
      const [cellX, cellY] = cellKey.split(',').map(Number);
      
      // Check adjacent cells
      const adjacentCells = [
        `${cellX + 1},${cellY}`,
        `${cellX},${cellY + 1}`,
        `${cellX + 1},${cellY + 1}`,
      ];
      
      for (const adjacentKey of adjacentCells) {
        const adjacentCell = cells.get(adjacentKey);
        if (adjacentCell) {
          // Check collisions between AABBs in adjacent cells
          for (const aabb1 of cell.aabbs) {
            for (const aabb2 of adjacentCell.aabbs) {
              if (this.aabbsOverlap(aabb1, aabb2)) {
                interCellPairs.push(this.createCollisionPair(aabb1, aabb2));
              }
            }
          }
        }
      }
    }
    
    return interCellPairs;
  }

  /**
   * Check if two AABBs overlap
   * 
   * @param aabb1 First AABB
   * @param aabb2 Second AABB
   * @returns True if AABBs overlap
   */
  private aabbsOverlap(aabb1: AABB, aabb2: AABB): boolean {
    return aabb1.minX <= aabb2.maxX && aabb2.minX <= aabb1.maxX &&
           aabb1.minY <= aabb2.maxY && aabb2.minY <= aabb1.maxY;
  }

  /**
   * Perform incremental update for an AABB
   * 
   * @param aabb The AABB being updated
   * @param updateType Type of update
   * @param previousAABB Previous AABB (for updates)
   */
  private performIncrementalUpdate(aabb: AABB, updateType: 'add' | 'remove' | 'update', previousAABB?: AABB): void {
    // Implementation would depend on specific incremental update strategy
    // For now, we'll just update the timestamp
    this.lastUpdateTime = Date.now();
  }

  /**
   * Generate cache key for AABB set
   */
  private getCacheKey(aabbs: AABB[]): string {
    const sortedIds = aabbs.map(aabb => String(aabb.id)).sort();
    return sortedIds.join(',');
  }

  /**
   * Cache collision result
   */
  private cacheResult(cacheKey: string, collisionPairs: CollisionPair[]): void {
    if (this.cache.size >= this.cacheSize) {
      // Remove least recently used entry
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, {
      aabbHash: cacheKey,
      collisionPairs,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  /**
   * Update statistics
   */
  private updateStats(collisionPairs: CollisionPair[], executionTime: number, aabbCount: number): void {
    if (!this.enableStats) return;
    
    this.stats.totalOperations++;
    this.stats.totalExecutionTime += executionTime;
    this.stats.averageExecutionTime = this.stats.totalExecutionTime / this.stats.totalOperations;
    this.stats.totalAABBsProcessed += aabbCount;
    this.stats.averageAABBsPerOperation = this.stats.totalAABBsProcessed / this.stats.totalOperations;
    this.stats.totalCollisionPairs += collisionPairs.length;
    this.stats.averageCollisionPairsPerOperation = this.stats.totalCollisionPairs / this.stats.totalOperations;
    
    // Calculate cache hit rate
    const cacheHits = this.stats.totalOperations * this.stats.cacheHitRate + (executionTime === 0 ? 1 : 0);
    this.stats.cacheHitRate = cacheHits / this.stats.totalOperations;
    
    // Estimate memory usage
    this.stats.memoryUsage = (this.cache.size + this.aabbs.size + this.activeCollisionPairs.size) * 100;
  }

  /**
   * Emit event to registered handlers
   */
  private emitEvent(type: SweepPruneEventType, data?: any): void {
    if (!this.enableDebug) return;
    
    const event: SweepPruneEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in SweepPrune event handler:', error);
      }
    }
  }

  /**
   * Add event handler
   */
  addEventHandler(handler: SweepPruneEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  removeEventHandler(handler: SweepPruneEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get current statistics
   */
  getStats(): SweepPruneStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): SweepPrunePerformanceMetrics {
    const efficiencyRatio = this.stats.totalAABBsProcessed > 0 ? 
      this.stats.totalCollisionPairs / this.stats.totalAABBsProcessed : 0;
    
    const performanceScore = Math.min(100, Math.max(0,
      (this.stats.cacheHitRate * 30) +
      (Math.max(0, 1 - this.stats.averageExecutionTime / 100) * 40) +
      (Math.min(1, efficiencyRatio) * 30)
    ));
    
    return {
      memoryUsage: this.stats.memoryUsage,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.cacheHitRate,
      averageDetectionTime: this.stats.averageExecutionTime,
      performanceScore,
      efficiencyRatio,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalOperations: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      totalAABBsProcessed: 0,
      averageAABBsPerOperation: 0,
      totalCollisionPairs: 0,
      averageCollisionPairsPerOperation: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SweepPruneConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get all active AABBs
   */
  getAllAABBs(): AABB[] {
    return Array.from(this.aabbs.values());
  }

  /**
   * Get all active collision pairs
   */
  getActiveCollisionPairs(): CollisionPair[] {
    return Array.from(this.activeCollisionPairs.values()).filter(pair => pair.active);
  }

  /**
   * Clear all AABBs and collision pairs
   */
  clear(): void {
    this.aabbs.clear();
    this.activeCollisionPairs.clear();
    this.spatialCells.clear();
    this.lastUpdateTime = 0;
  }
}

// Import default options
import { DEFAULT_SWEEP_PRUNE_OPTIONS } from './sweep-prune-types';

