import type {
  Interval,
  IntervalTreeNode,
  IntervalTreeTraversalResult,
  TraversalOptions,
  IntervalTreeEventHandler,
} from "./interval-tree-types";
import { TraversalOrder, IntervalTreeEventType } from "./interval-tree-types";
import { emitEvent } from "./interval-tree-events";

/**
 * Walks the tree in the requested order, collecting intervals and optional per-node metadata.
 *
 * Emits a traversal event with the chosen order and timing, and returns a result carrying the
 * intervals and execution time. Errors are reported in the result rather than thrown.
 *
 * @param root Root of the tree to traverse; `null` yields an empty result.
 * @param options Traversal order and whether to include metadata.
 * @param eventHandlers Handlers notified when the traversal completes.
 * @returns Traversal result with intervals, count, timing, and optional metadata.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
 */
export function traverseTree(
  root: IntervalTreeNode | null,
  options: Partial<TraversalOptions> = {},
  eventHandlers: IntervalTreeEventHandler[] = []
): IntervalTreeTraversalResult {
  const startTime = performance.now();
  const traversalOptions: TraversalOptions = {
    order: TraversalOrder.IN_ORDER,
    includeMetadata: false,
    ...options,
  };

  try {
    const intervals: Interval[] = [];
    const metadata: any[] = [];

    traverseRecursive(root, intervals, metadata, traversalOptions, 0);

    const executionTime = performance.now() - startTime;

    emitEvent(eventHandlers, IntervalTreeEventType.TRAVERSAL_PERFORMED, {
      order: traversalOptions.order,
      intervalCount: intervals.length,
      executionTime,
    });

    const result: IntervalTreeTraversalResult = {
      success: true,
      intervals,
      count: intervals.length,
      executionTime,
      nodesVisited: 0,
    };
    if (traversalOptions.includeMetadata) {
      result.metadata = metadata.reduce((acc, item, index) => {
        acc[index.toString()] = item;
        return acc;
      }, {} as Record<string, any>);
    }
    return result;
  } catch (error) {
    return {
      success: false,
      intervals: [],
      count: 0,
      executionTime: performance.now() - startTime,
      nodesVisited: 0,
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

/**
 * Collects every interval stored in the subtree rooted at `root` into a flat list.
 *
 * @param root Root of the subtree to collect; `null` yields an empty list.
 * @returns Copies of all intervals in the subtree.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
 */
export function getAllIntervals(root: IntervalTreeNode | null): Interval[] {
  const intervals: Interval[] = [];
  collectIntervals(root, intervals);
  return intervals;
}

/**
 * Locates the node whose stored interval matches `interval` by start and end value.
 *
 * Descends left or right by start, then follows right children when starts tie but ends differ.
 *
 * @param root Root of the tree to search.
 * @param interval Interval to match exactly.
 * @returns The matching node, or `null` when not present.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
 */
export function findInterval(root: IntervalTreeNode | null, interval: Interval): IntervalTreeNode | null {
  if (!root) return null;

  if (interval.start < root.interval.start) {
    return findInterval(root.left, interval);
  } else if (interval.start > root.interval.start) {
    return findInterval(root.right, interval);
  } else {
    if (interval.end === root.interval.end) {
      return root;
    } else {
      return findInterval(root.right, interval);
    }
  }
}

/**
 * Reports whether the tree contains an interval with the same start and end as `interval`.
 *
 * @param root Root of the tree to search.
 * @param interval Interval to look for.
 * @returns `true` when an exact match exists.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
 */
export function containsInterval(root: IntervalTreeNode | null, interval: Interval): boolean {
  return findInterval(root, interval) !== null;
}

/**
 * Recursively appends a copy of every interval in `node`'s subtree to `intervals`.
 *
 * @param node Root of the subtree to collect; `null` is a no-op.
 * @param intervals Output list, mutated in place.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
 */
function collectIntervals(node: IntervalTreeNode | null, intervals: Interval[]): void {
  if (!node) return;

  intervals.push({ ...node.interval });
  collectIntervals(node.left, intervals);
  collectIntervals(node.right, intervals);
}

/**
 * Appends intervals (and optionally per-node metadata) in the configured traversal order.
 *
 * Pre-, in-, and post-order recurse through both children; level-order uses a queue over the subtree.
 *
 * @param node Current node; `null` is a no-op.
 * @param intervals Output list of visited intervals.
 * @param metadata Output list of node metadata.
 * @param options Traversal order and metadata flag.
 * @param depth Depth of `node` below the tree root.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
 */
function traverseRecursive(
  node: IntervalTreeNode | null,
  intervals: Interval[],
  metadata: any[],
  options: TraversalOptions,
  depth: number
): void {
  if (!node) return;

  const nodeData = {
    interval: { ...node.interval },
    maxEnd: node.maxEnd,
    height: node.height,
    depth,
  };

  switch (options.order) {
    case TraversalOrder.PRE_ORDER:
      intervals.push({ ...node.interval });
      if (options.includeMetadata) {
        metadata.push(nodeData);
      }
      traverseRecursive(node.left, intervals, metadata, options, depth + 1);
      traverseRecursive(node.right, intervals, metadata, options, depth + 1);
      break;

    case TraversalOrder.IN_ORDER:
      traverseRecursive(node.left, intervals, metadata, options, depth + 1);
      intervals.push({ ...node.interval });
      if (options.includeMetadata) {
        metadata.push(nodeData);
      }
      traverseRecursive(node.right, intervals, metadata, options, depth + 1);
      break;

    case TraversalOrder.POST_ORDER:
      traverseRecursive(node.left, intervals, metadata, options, depth + 1);
      traverseRecursive(node.right, intervals, metadata, options, depth + 1);
      intervals.push({ ...node.interval });
      if (options.includeMetadata) {
        metadata.push(nodeData);
      }
      break;

    case TraversalOrder.LEVEL_ORDER: {
      const queue: Array<{ node: IntervalTreeNode; depth: number }> = [{ node, depth }];

      while (queue.length > 0) {
        const { node: current, depth: currentDepth } = queue.shift()!;

        intervals.push({ ...current.interval });
        if (options.includeMetadata) {
          metadata.push({
            interval: { ...current.interval },
            maxEnd: current.maxEnd,
            height: current.height,
            depth: currentDepth,
          });
        }

        if (current.left) {
          queue.push({ node: current.left, depth: currentDepth + 1 });
        }
        if (current.right) {
          queue.push({ node: current.right, depth: currentDepth + 1 });
        }
      }
      break;
    }
  }
}
