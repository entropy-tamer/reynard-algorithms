import type { IntervalTreeNode, IntervalTreeStats, IntervalTreeSerialization } from "./interval-tree-types";

/**
 *
 * @param root
 * @param stats
 * @example
 */
export function serializeTree(root: IntervalTreeNode | null, stats: IntervalTreeStats): IntervalTreeSerialization {
  return {
    version: "1.0",
    root: root ? serializeNode(root) : null,
    stats: { ...stats },
    config: {
      maxIntervals: 10000,
    },
    data: [],
    metadata: {
      timestamp: Date.now(),
      totalIntervals: stats.totalIntervals,
      totalNodes: stats.totalNodes,
      height: stats.height,
      createdAt: Date.now(),
    },
  };
}

/**
 *
 * @param serialized
 * @example
 */
export function deserializeTree(serialized: IntervalTreeSerialization): IntervalTreeNode | null {
  if (!serialized.root) {
    return null;
  }

  return deserializeNode(serialized.root);
}

/**
 *
 * @param node
 * @example
 */
function serializeNode(node: IntervalTreeNode): any {
  return {
    interval: { ...node.interval },
    maxEnd: node.maxEnd,
    height: node.height,
    left: node.left ? serializeNode(node.left) : null,
    right: node.right ? serializeNode(node.right) : null,
  };
}

/**
 *
 * @param data
 * @example
 */
function deserializeNode(data: any): IntervalTreeNode | null {
  if (!data) return null;

  return {
    interval: { ...data.interval },
    max: data.maxEnd,
    maxEnd: data.maxEnd,
    height: data.height,
    left: deserializeNode(data.left),
    right: deserializeNode(data.right),
    size: data.size || 1,
  };
}



