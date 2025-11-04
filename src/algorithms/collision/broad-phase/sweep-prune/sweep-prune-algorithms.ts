/**
 * Core algorithm implementations for Sweep and Prune
 *
 * Provides the main sweep and prune algorithm implementations including
 * single-axis, multi-axis, and spatially-partitioned variants.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-algorithms
 */

import type {
  AABB,
  CollisionPair,
  SweepPruneResult,
  SweepPruneConfig,
  SpatialCell,
  AxisSweepResult,
} from "./sweep-prune-types";
import { SweepPruneEventType } from "./sweep-prune-types";
import { sortEndpoints, compareEndpoints } from "./sweep-prune-sorting";
import {
  aabbsOverlapOnAxis,
  createCollisionPair,
  getPairId,
  filterCollisionPairs,
  intersectCollisionPairs,
} from "./sweep-prune-collision";
import { partitionAABBs, checkInterCellCollisions } from "./sweep-prune-spatial";
import type { Endpoint } from "./sweep-prune-types";

export interface SweepPruneContext {
  config: SweepPruneConfig;
  activeCollisionPairs: Map<string, CollisionPair>;
  emitEvent: (type: SweepPruneEventType, data?: any) => void;
  performSingleAxisSweepPrune: (aabbs: AABB[]) => SweepPruneResult;
}

/**
 * Perform the core sweep and prune algorithm
 */
export function performSweepPrune(aabbs: AABB[], context: SweepPruneContext): SweepPruneResult {
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
  if (context.config.useSpatialPartitioning && aabbs.length > context.config.maxAABBs) {
    return performSpatialPartitionedSweepPrune(aabbs, context);
  }

  // Use multi-axis optimization
  if (context.config.useMultiAxisOptimization) {
    return performMultiAxisSweepPrune(aabbs, context);
  }

  // Standard single-axis sweep and prune
  return context.performSingleAxisSweepPrune(aabbs);
}

/**
 * Perform sweep and prune on a single axis
 */
export function performSingleAxisSweepPrune(
  aabbs: AABB[],
  context: SweepPruneContext
): SweepPruneResult {
  const collisionPairs: CollisionPair[] = [];
  let endpointsProcessed = 0;
  let axisSweeps = 0;

  // Test both X and Y axes
  for (let axis = 0; axis < 2; axis++) {
    axisSweeps++;
    context.emitEvent(SweepPruneEventType.AXIS_SWEEP_STARTED, { axis, aabbCount: aabbs.length });

    const axisResult = sweepAxis(aabbs, axis, context);
    endpointsProcessed += axisResult.endpointsProcessed;

    // For first axis, collect all potential pairs
    if (axis === 0) {
      collisionPairs.push(...axisResult.collisionPairs);
    } else {
      // For second axis, filter pairs that are still active
      filterCollisionPairs(collisionPairs, axisResult.collisionPairs, context.emitEvent);
    }

    context.emitEvent(SweepPruneEventType.AXIS_SWEEP_COMPLETED, {
      axis,
      pairsFound: axisResult.collisionPairs.length,
    });
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
 */
export function performMultiAxisSweepPrune(
  aabbs: AABB[],
  context: SweepPruneContext
): SweepPruneResult {
  const axisResults: AxisSweepResult[] = [];
  let totalEndpointsProcessed = 0;
  let totalAxisSweeps = 0;

  // Sweep each axis
  for (let axis = 0; axis < 2; axis++) {
    totalAxisSweeps++;
    const axisResult = sweepAxis(aabbs, axis, context);
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
  const combinedPairs = intersectCollisionPairs(
    axisResults.map(r => sweepAxis(aabbs, r.axis, context).collisionPairs)
  );

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
 */
export function performSpatialPartitionedSweepPrune(
  aabbs: AABB[],
  context: SweepPruneContext
): SweepPruneResult {
  // Partition AABBs into spatial cells
  const cells = partitionAABBs(aabbs, context.config);
  const allCollisionPairs: CollisionPair[] = [];
  let totalEndpointsProcessed = 0;
  let totalAxisSweeps = 0;

  // Process each cell
  for (const cell of cells.values()) {
    if (cell.aabbs.length > 1) {
      const cellResult = performSingleAxisSweepPrune(cell.aabbs, context);
      allCollisionPairs.push(...cellResult.collisionPairs);
      totalEndpointsProcessed += cellResult.endpointsProcessed;
      totalAxisSweeps += cellResult.axisSweeps;
    }
  }

  // Check for collisions between adjacent cells
  const interCellPairs = checkInterCellCollisions(cells, context.activeCollisionPairs);
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
 */
function sweepAxis(
  aabbs: AABB[],
  axis: number,
  context: SweepPruneContext
): { collisionPairs: CollisionPair[]; endpointsProcessed: number } {
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
  sortEndpoints(endpoints, context.config);
  context.emitEvent(SweepPruneEventType.SORTING_PERFORMED, { axis, endpointCount: endpoints.length });

  // Sweep through endpoints
  const activeAABBs = new Set<AABB>();
  const collisionPairs: CollisionPair[] = [];

  for (const endpoint of endpoints) {
    if (endpoint.isStart) {
      // AABB starts - check for collisions with active AABBs
      for (const activeAABB of activeAABBs) {
        if (aabbsOverlapOnAxis(endpoint.aabb, activeAABB, axis)) {
          const pair = createCollisionPair(endpoint.aabb, activeAABB, context.activeCollisionPairs);
          collisionPairs.push(pair);
          context.emitEvent(SweepPruneEventType.COLLISION_PAIR_FOUND, { pair });
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

