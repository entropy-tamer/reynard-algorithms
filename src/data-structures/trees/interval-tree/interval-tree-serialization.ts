import type { IntervalTreeNode, IntervalTreeStats, IntervalTreeSerialization } from "./interval-tree-types";

/**
 * Produces a versioned snapshot of the tree: serialized root, statistics, limits, and metadata.
 *
 * @param root Root node to serialize; `null` produces an empty root.
 * @param stats Current tree statistics to embed in the snapshot.
 * @returns A serializable representation of the tree.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
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
 * Rebuilds a tree root from a serialized snapshot, returning `null` when the snapshot is empty.
 *
 * @param serialized Snapshot previously produced by `serializeTree`.
 * @returns The reconstructed root, or `null` for an empty tree.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
 */
export function deserializeTree(serialized: IntervalTreeSerialization): IntervalTreeNode | null {
  if (!serialized.root) {
    return null;
  }

  return deserializeNode(serialized.root);
}

/**
 * Recursively converts a node, its interval, and its children into a plain serializable object.
 *
 * @param node Node to serialize.
 * @returns Plain-object form of the node subtree.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
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
 * Recursively rebuilds a node from serialized data, restoring its interval and max-end augmentation.
 *
 * Missing data yields `null`; the `max` alias is populated from `maxEnd`.
 *
 * @param data Plain-object node data from `serializeNode`.
 * @returns The reconstructed node, or `null`.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
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
