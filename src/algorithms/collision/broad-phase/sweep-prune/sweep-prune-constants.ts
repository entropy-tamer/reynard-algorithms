/**
 * @file Sweep and Prune Collision Detection Constants
 *
 * Default configurations, options, and common AABB shapes for testing.
 *
 * @module algorithms/geometry/collision/sweep-prune
 */

import type { AABB } from "./sweep-prune-types-core";
import type { SweepPruneConfig, SweepPruneOptions } from "./sweep-prune-types-config";

/**
 * Default configuration for Sweep and Prune algorithm
 */
export const DEFAULT_SWEEP_PRUNE_CONFIG: SweepPruneConfig = {
  epsilon: 1e-10,
  useInsertionSort: true,
  insertionSortThreshold: 20,
  useTemporalCoherence: true,
  useMultiAxisOptimization: true,
  enableIncrementalUpdates: true,
  maxAABBs: 10000,
  useSpatialPartitioning: false,
  spatialCellSize: 100,
};

/**
 * Default options for Sweep and Prune algorithm
 */
export const DEFAULT_SWEEP_PRUNE_OPTIONS: SweepPruneOptions = {
  config: DEFAULT_SWEEP_PRUNE_CONFIG,
  enableCaching: true,
  cacheSize: 1000,
  enableStats: true,
  enableDebug: false,
};

/**
 * Common AABB shapes for testing
 */
export const COMMON_AABBS = {
  /** Unit square at origin */
  UNIT_SQUARE: {
    minX: 0,
    minY: 0,
    maxX: 1,
    maxY: 1,
    id: "unit-square",
  } as AABB,

  /** Unit square offset by (1, 1) */
  OFFSET_SQUARE: {
    minX: 1,
    minY: 1,
    maxX: 2,
    maxY: 2,
    id: "offset-square",
  } as AABB,

  /** Large square covering multiple units */
  LARGE_SQUARE: {
    minX: 0,
    minY: 0,
    maxX: 5,
    maxY: 5,
    id: "large-square",
  } as AABB,

  /** Thin rectangle */
  THIN_RECTANGLE: {
    minX: 0,
    minY: 0,
    maxX: 10,
    maxY: 1,
    id: "thin-rectangle",
  } as AABB,

  /** Tall rectangle */
  TALL_RECTANGLE: {
    minX: 0,
    minY: 0,
    maxX: 1,
    maxY: 10,
    id: "tall-rectangle",
  } as AABB,
};
