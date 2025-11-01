import type {
  Interval,
  IntervalTreeNode,
  IntervalTreeTraversalResult,
  TraversalOptions,
  IntervalTreeEventHandler,
} from "./interval-tree-types";
import { TraversalOrder, IntervalTreeEventType } from "./interval-tree-types";
import { emitEvent } from "./interval-tree-events";

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

    return {
      success: true,
      intervals,
      metadata: traversalOptions.includeMetadata ? metadata : undefined,
      count: intervals.length,
      executionTime,
      nodesVisited: 0,
    };
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

export function getAllIntervals(root: IntervalTreeNode | null): Interval[] {
  const intervals: Interval[] = [];
  collectIntervals(root, intervals);
  return intervals;
}

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

export function containsInterval(root: IntervalTreeNode | null, interval: Interval): boolean {
  return findInterval(root, interval) !== null;
}

function collectIntervals(node: IntervalTreeNode | null, intervals: Interval[]): void {
  if (!node) return;

  intervals.push({ ...node.interval });
  collectIntervals(node.left, intervals);
  collectIntervals(node.right, intervals);
}

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

    case TraversalOrder.LEVEL_ORDER:
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



