/**
 * KD-Tree Utility Operations
 *
 * Handles utility functions, statistics calculation,
 * and helper operations for the KD-Tree data structure.
 *
 * @module algorithms/spatial-structures/kdtree
 */
import type { Point, KdNode, KdTreeConfig, KdTreeStats, KdTreePerformanceMetrics, KdTreeSerialization, KdTreeEventHandler } from "./kdtree-types";
import { KdTreeEventType } from "./kdtree-types";
/**
 * Calculate tree statistics
 *
 * @param root Root node
 * @param config KD-Tree configuration
 * @param _config
 * @param stats Statistics object to update
 * @example
 */
export declare function calculateTreeStats(root: KdNode | null, _config: Required<KdTreeConfig>, stats: KdTreeStats): void;
/**
 * Get tree size
 *
 * @param root Root node
 * @returns Number of points in tree
 * @example
 */
export declare function getTreeSize(root: KdNode | null): number;
/**
 * Check if tree is empty
 *
 * @param root Root node
 * @returns True if tree is empty
 * @example
 */
export declare function isTreeEmpty(root: KdNode | null): boolean;
/**
 * Get performance metrics
 *
 * @param stats Statistics object
 * @returns Performance metrics
 * @example
 */
export declare function getPerformanceMetrics(stats: KdTreeStats): KdTreePerformanceMetrics;
/**
 * Serialize tree to JSON
 *
 * @param root Root node
 * @param config KD-Tree configuration
 * @param stats Statistics object
 * @returns Serialized tree data
 * @example
 */
export declare function serializeTree(root: KdNode | null, config: Required<KdTreeConfig>, stats: KdTreeStats): KdTreeSerialization;
/**
 * Calculate distance between two points
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns Euclidean distance
 * @example
 */
export declare function calculateDistance(p1: Point, p2: Point): number;
/**
 * Check if two points are equal
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns True if points are equal
 * @example
 */
export declare function pointsEqual(p1: Point, p2: Point): boolean;
/**
 * Check if a point is valid
 *
 * @param point Point to validate
 * @param dimensions Expected number of dimensions
 * @returns True if point is valid
 * @example
 */
export declare function isValidPoint(point: Point, dimensions: number): boolean;
/**
 * Create a deep copy of a point
 *
 * @param point Point to copy
 * @returns Deep copy of point
 * @example
 */
export declare function copyPoint(point: Point): Point;
/**
 * Create a deep copy of a node
 *
 * @param node Node to copy
 * @returns Deep copy of node
 * @example
 */
export declare function copyNode(node: KdNode | null): KdNode | null;
/**
 * Reset statistics
 *
 * @param stats Statistics object to reset
 * @example
 */
export declare function resetStats(stats: KdTreeStats): void;
/**
 * Update average time calculation
 *
 * @param currentAverage Current average
 * @param newTime New time value
 * @param count Total count
 * @returns Updated average
 * @example
 */
export declare function updateAverageTime(currentAverage: number, newTime: number, count: number): number;
/**
 * Emit event to handlers
 *
 * @param eventHandlers Array of event handlers
 * @param type Event type
 * @param data Event data
 * @example
 */
export declare function emitEvent(eventHandlers: KdTreeEventHandler[], type: KdTreeEventType, data: any): void;
//# sourceMappingURL=kdtree-utils.d.ts.map