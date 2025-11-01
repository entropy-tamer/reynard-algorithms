/**
 * Maintenance helpers for SpatialHash (resize and cleanup cadence)
 *
 * @file Maintenance utilities for SpatialHash
 * @module algorithms/spatialHashMaintenance
 */

import type { SpatialHashConfig } from "./spatial-hash-types";

/**
 * Dependencies required for maintenance operations.
 */
export interface MaintenanceDeps {
  /** Get the current average number of objects per cell. */
  getAverageObjectsPerCell: () => number;
  /** Resize callback to apply a new cell size. */
  resize: (newCellSize: number) => void;
}

/**
 * Check auto-resize conditions and apply resize if needed.
 *
 * @param config Spatial hash configuration
 * @param deps Maintenance dependencies providing current stats and actions
 * @example
 * checkAutoResizeImpl(cfg, { getAverageObjectsPerCell: () => 42, resize: (s) => console.log(s) });
 */
export function checkAutoResizeImpl(config: SpatialHashConfig, deps: MaintenanceDeps): void {
  const loadFactor = deps.getAverageObjectsPerCell() / config.maxObjectsPerCell;
  if (loadFactor > config.resizeThreshold) deps.resize(config.cellSize * 1.5);
}

/**
 * Check cleanup cadence and call cleanup when interval passed.
 *
 * @param now Current timestamp (ms)
 * @param lastCleanup Last cleanup timestamp (ms)
 * @param cleanupInterval Cleanup interval (ms)
 * @param cleanup Callback to perform cleanup
 * @returns Updated lastCleanup timestamp
 * @example
 * const updated = checkCleanupImpl(Date.now(), prev, 60000, () => doCleanup());
 */
export function checkCleanupImpl(now: number, lastCleanup: number, cleanupInterval: number, cleanup: () => void): number {
  if (now - lastCleanup > cleanupInterval) {
    cleanup();
    return now;
  }
  return lastCleanup;
}


