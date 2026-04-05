import type { IntervalTreeNode, IntervalTreeStats, IntervalTreeSerialization } from "./interval-tree-types";
/**
 *
 * @param root
 * @param stats
 * @example
 */
export declare function serializeTree(root: IntervalTreeNode | null, stats: IntervalTreeStats): IntervalTreeSerialization;
/**
 *
 * @param serialized
 * @example
 */
export declare function deserializeTree(serialized: IntervalTreeSerialization): IntervalTreeNode | null;
//# sourceMappingURL=interval-tree-serialization.d.ts.map