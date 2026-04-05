import type { IntervalTreeNode, IntervalTreeStats, IntervalTreePerformanceMetrics } from "./interval-tree-types";
/**
 *
 * @param root
 * @example
 */
export declare function getTreeSize(root: IntervalTreeNode | null): number;
/**
 *
 * @param root
 * @example
 */
export declare function isTreeEmpty(root: IntervalTreeNode | null): boolean;
/**
 *
 * @param root
 * @example
 */
export declare function getTreeHeight(root: IntervalTreeNode | null): number;
/**
 *
 * @param root
 * @param stats
 * @example
 */
export declare function calculateTreeStats(root: IntervalTreeNode | null, stats: IntervalTreeStats): void;
/**
 *
 * @param stats
 * @example
 */
export declare function getPerformanceMetrics(stats: IntervalTreeStats): IntervalTreePerformanceMetrics;
/**
 *
 * @param stats
 * @example
 */
export declare function resetStats(stats: IntervalTreeStats): void;
/**
 *
 * @param currentAverage
 * @param newTime
 * @param count
 * @example
 */
export declare function updateAverageTime(currentAverage: number, newTime: number, count: number): number;
//# sourceMappingURL=interval-tree-stats.d.ts.map