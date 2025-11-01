/**
 * Interval Tree Deletion Operations
 *
 * Handles interval deletion and AVL tree rebalancing
 * for the Interval Tree data structure.
 *
 * @module algorithms/data-structures/interval-tree
 */

import type {
  Interval,
  IntervalTreeNode,
  IntervalTreeConfig,
  IntervalTreeStats,
  IntervalTreeEventHandler,
} from "./interval-tree-types";
import { IntervalTreeEventType } from "./interval-tree-types";

/**
 * Delete an interval from the tree
 *
 * @param root Current root node
 * @param interval Interval to delete
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns New root node and success status
 */
export function deleteInterval(
  root: IntervalTreeNode | null,
  interval: Interval,
  config: IntervalTreeConfig,
  stats: IntervalTreeStats,
  eventHandlers: IntervalTreeEventHandler[]
): { root: IntervalTreeNode | null; success: boolean } {
  const startTime = performance.now();

  try {
    // Validate interval
    if (!isValidInterval(interval)) {
      return { root, success: false };
    }

    // Check if interval exists
    if (!findInterval(root, interval)) {
      return { root, success: false };
    }

    // Delete recursively
    const newRoot = deleteRecursive(root, interval, config, stats);

    // Update statistics
    stats.totalIntervals = Math.max(0, stats.totalIntervals - 1);
    stats.totalDeletes++;
    stats.totalNodes = countNodes(newRoot);
    stats.height = getHeight(newRoot);
    stats.averageIntervalLength = calculateAverageIntervalLength(newRoot);

    // Emit event
    emitEvent(eventHandlers, IntervalTreeEventType.INTERVAL_DELETED, {
      interval,
      executionTime: performance.now() - startTime,
    });

    return { root: newRoot, success: true };
  } catch (error) {
    return { root, success: false };
  }
}

/**
 * Clear all intervals from the tree
 *
 * @param root Current root node
 * @param stats Statistics object to update
 * @param eventHandlers Event handlers
 * @returns Result
 */
export function clearTree(
  root: IntervalTreeNode | null,
  stats: IntervalTreeStats,
  eventHandlers: IntervalTreeEventHandler[]
): { root: IntervalTreeNode | null; success: boolean } {
  const startTime = performance.now();

  try {
    // Update statistics
    stats.totalIntervals = 0;
    stats.totalNodes = 0;
    stats.height = 0;
    stats.averageIntervalLength = 0;

    // Emit event
    emitEvent(eventHandlers, IntervalTreeEventType.TREE_CLEARED, {
      executionTime: performance.now() - startTime,
    });

    return { root: null, success: true };
  } catch (error) {
    return { root, success: false };
  }
}

/**
 * Recursively delete an interval from the tree
 *
 * @param node Current node
 * @param interval Interval to delete
 * @param config Interval tree configuration
 * @param stats Statistics object to update
 * @returns New node or null
 */
function deleteRecursive(
  node: IntervalTreeNode | null,
  interval: Interval,
  config: IntervalTreeConfig,
  stats: IntervalTreeStats
): IntervalTreeNode | null {
  if (!node) {
    return null;
  }

  // Search for the interval to delete
  if (interval.start < node.interval.start) {
    node.left = deleteRecursive(node.left, interval, config, stats);
  } else if (interval.start > node.interval.start) {
    node.right = deleteRecursive(node.right, interval, config, stats);
  } else {
    // Found the node with matching start point
    if (interval.end === node.interval.end) {
      // Exact match found
      if (!node.left || !node.right) {
        // Node has 0 or 1 child
        const temp = node.left || node.right;
        return temp;
      } else {
        // Node has 2 children
        const temp = getMinValueNode(node.right);
        node.interval = temp.interval;
        node.right = deleteRecursive(node.right, temp.interval, config, stats);
      }
    } else {
      // Start point matches but end point doesn't, search right subtree
      node.right = deleteRecursive(node.right, interval, config, stats);
    }
  }

  // Update node properties
  updateNode(node);

  // Balance the tree
  return balanceNode(node);
}

/**
 * Find minimum value node in subtree
 *
 * @param node Root of subtree
 * @returns Minimum value node
 */
function getMinValueNode(node: IntervalTreeNode): IntervalTreeNode {
  let current = node;
  while (current.left) {
    current = current.left;
  }
  return current;
}

/**
 * Find an interval in the tree
 *
 * @param node Current node
 * @param interval Interval to find
 * @returns Node containing interval or null
 */
function findInterval(node: IntervalTreeNode | null, interval: Interval): IntervalTreeNode | null {
  if (!node) {
    return null;
  }

  if (interval.start < node.interval.start) {
    return findInterval(node.left, interval);
  } else if (interval.start > node.interval.start) {
    return findInterval(node.right, interval);
  } else {
    // Start point matches
    if (interval.end === node.interval.end) {
      return node;
    } else {
      // Search right subtree for matching end point
      return findInterval(node.right, interval);
    }
  }
}

/**
 * Update node properties after deletion
 *
 * @param node Node to update
 */
function updateNode(node: IntervalTreeNode): void {
  // Update height
  node.height = Math.max(getNodeHeight(node.left), getNodeHeight(node.right)) + 1;

  // Update max end point
  node.maxEnd = node.interval.end;
  if (node.left) {
    node.maxEnd = Math.max(node.maxEnd, node.left.maxEnd);
  }
  if (node.right) {
    node.maxEnd = Math.max(node.maxEnd, node.right.maxEnd);
  }
}

/**
 * Balance a node using AVL rotations
 *
 * @param node Node to balance
 * @returns Balanced node
 */
function balanceNode(node: IntervalTreeNode): IntervalTreeNode {
  const balance = getBalanceFactor(node);

  // Left heavy
  if (balance > 1) {
    if (getBalanceFactor(node.left!) < 0) {
      // Left-Right case
      node.left = leftRotate(node.left!);
    }
    // Left-Left case
    return rightRotate(node);
  }

  // Right heavy
  if (balance < -1) {
    if (getBalanceFactor(node.right!) > 0) {
      // Right-Left case
      node.right = rightRotate(node.right!);
    }
    // Right-Right case
    return leftRotate(node);
  }

  return node;
}

/**
 * Right rotation for AVL balancing
 *
 * @param y Node to rotate
 * @returns New root of subtree
 */
function rightRotate(y: IntervalTreeNode): IntervalTreeNode {
  const x = y.left!;
  const T2 = x.right;

  // Perform rotation
  x.right = y;
  y.left = T2;

  // Update heights
  updateNode(y);
  updateNode(x);

  return x;
}

/**
 * Left rotation for AVL balancing
 *
 * @param x Node to rotate
 * @returns New root of subtree
 */
function leftRotate(x: IntervalTreeNode): IntervalTreeNode {
  const y = x.right!;
  const T2 = y.left;

  // Perform rotation
  y.left = x;
  x.right = T2;

  // Update heights
  updateNode(x);
  updateNode(y);

  return y;
}

/**
 * Get height of a node
 *
 * @param node Node to get height for
 * @returns Height of node
 */
function getNodeHeight(node: IntervalTreeNode | null): number {
  return node ? node.height : 0;
}

/**
 * Get balance factor of a node
 *
 * @param node Node to get balance factor for
 * @returns Balance factor
 */
function getBalanceFactor(node: IntervalTreeNode | null): number {
  if (!node) return 0;
  return getNodeHeight(node.left) - getNodeHeight(node.right);
}

/**
 * Check if interval is valid
 *
 * @param interval Interval to validate
 * @returns True if interval is valid
 */
function isValidInterval(interval: Interval): boolean {
  return (
    typeof interval.start === 'number' &&
    typeof interval.end === 'number' &&
    interval.start <= interval.end &&
    isFinite(interval.start) &&
    isFinite(interval.end)
  );
}

/**
 * Count total nodes in tree
 *
 * @param node Root node
 * @returns Number of nodes
 */
function countNodes(node: IntervalTreeNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

/**
 * Get height of tree
 *
 * @param node Root node
 * @returns Height of tree
 */
function getHeight(node: IntervalTreeNode | null): number {
  if (!node) return 0;
  return Math.max(getHeight(node.left), getHeight(node.right)) + 1;
}

/**
 * Calculate average interval length
 *
 * @param node Root node
 * @returns Average interval length
 */
function calculateAverageIntervalLength(node: IntervalTreeNode | null): number {
  if (!node) return 0;

  const intervals: Interval[] = [];
  collectIntervals(node, intervals);

  if (intervals.length === 0) return 0;

  const totalLength = intervals.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
  return totalLength / intervals.length;
}

/**
 * Collect all intervals from tree
 *
 * @param node Current node
 * @param intervals Array to store intervals
 */
function collectIntervals(node: IntervalTreeNode | null, intervals: Interval[]): void {
  if (!node) return;

  intervals.push({ ...node.interval });
  collectIntervals(node.left, intervals);
  collectIntervals(node.right, intervals);
}

/**
 * Emit event to handlers
 *
 * @param eventHandlers Array of event handlers
 * @param type Event type
 * @param data Event data
 */
function emitEvent(
  eventHandlers: IntervalTreeEventHandler[],
  type: IntervalTreeEventType,
  data: any
): void {
  for (const handler of eventHandlers) {
    try {
      handler({ type, data, timestamp: Date.now() });
    } catch (error) {
      // Ignore handler errors
    }
  }
}

