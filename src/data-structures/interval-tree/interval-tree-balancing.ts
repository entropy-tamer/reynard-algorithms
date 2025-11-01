/**
 * Interval Tree Balancing Operations
 *
 * Handles AVL tree balancing and rotation operations
 * for the Interval Tree data structure.
 *
 * @module algorithms/data-structures/interval-tree
 */

import type {
  IntervalTreeNode,
  IntervalTreeEventHandler,
} from "./interval-tree-types";
import { IntervalTreeEventType } from "./interval-tree-types";

/**
 * Balance a node using AVL rotations
 *
 * @param node Node to balance
 * @param eventHandlers Event handlers
 * @returns Balanced node
 */
export function balanceNode(
  node: IntervalTreeNode,
  eventHandlers: IntervalTreeEventHandler[] = []
): IntervalTreeNode {
  const balance = getBalanceFactor(node);

  // Left heavy
  if (balance > 1) {
    if (getBalanceFactor(node.left!) < 0) {
      // Left-Right case
      node.left = leftRotate(node.left!, eventHandlers);
    }
    // Left-Left case
    return rightRotate(node, eventHandlers);
  }

  // Right heavy
  if (balance < -1) {
    if (getBalanceFactor(node.right!) > 0) {
      // Right-Left case
      node.right = rightRotate(node.right!, eventHandlers);
    }
    // Right-Right case
    return leftRotate(node, eventHandlers);
  }

  return node;
}

/**
 * Right rotation for AVL balancing
 *
 * @param y Node to rotate
 * @param eventHandlers Event handlers
 * @returns New root of subtree
 */
export function rightRotate(
  y: IntervalTreeNode,
  eventHandlers: IntervalTreeEventHandler[] = []
): IntervalTreeNode {
  const x = y.left!;
  const T2 = x.right;

  // Perform rotation
  x.right = y;
  y.left = T2;

  // Update heights
  updateNodeHeight(y);
  updateNodeHeight(x);

  // Emit event
  emitEvent(eventHandlers, IntervalTreeEventType.ROTATION_PERFORMED, {
    rotationType: "right",
    pivotNode: y.interval,
    newRoot: x.interval,
  });

  return x;
}

/**
 * Left rotation for AVL balancing
 *
 * @param x Node to rotate
 * @param eventHandlers Event handlers
 * @returns New root of subtree
 */
export function leftRotate(
  x: IntervalTreeNode,
  eventHandlers: IntervalTreeEventHandler[] = []
): IntervalTreeNode {
  const y = x.right!;
  const T2 = y.left;

  // Perform rotation
  y.left = x;
  x.right = T2;

  // Update heights
  updateNodeHeight(x);
  updateNodeHeight(y);

  // Emit event
  emitEvent(eventHandlers, IntervalTreeEventType.ROTATION_PERFORMED, {
    rotationType: "left",
    pivotNode: x.interval,
    newRoot: y.interval,
  });

  return y;
}

/**
 * Get height of a node
 *
 * @param node Node to get height for
 * @returns Height of node
 */
export function getNodeHeight(node: IntervalTreeNode | null): number {
  return node ? node.height : 0;
}

/**
 * Get balance factor of a node
 *
 * @param node Node to get balance factor for
 * @returns Balance factor
 */
export function getBalanceFactor(node: IntervalTreeNode | null): number {
  if (!node) return 0;
  return getNodeHeight(node.left) - getNodeHeight(node.right);
}

/**
 * Update node height
 *
 * @param node Node to update
 */
export function updateNodeHeight(node: IntervalTreeNode): void {
  node.height = Math.max(getNodeHeight(node.left), getNodeHeight(node.right)) + 1;
}

/**
 * Update node properties after modification
 *
 * @param node Node to update
 */
export function updateNode(node: IntervalTreeNode): void {
  // Update height
  updateNodeHeight(node);

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
 * Check if tree is balanced
 *
 * @param node Root node
 * @returns True if tree is balanced
 */
export function isTreeBalanced(node: IntervalTreeNode | null): boolean {
  if (!node) return true;

  const balance = getBalanceFactor(node);
  if (Math.abs(balance) > 1) {
    return false;
  }

  return isTreeBalanced(node.left) && isTreeBalanced(node.right);
}

/**
 * Get tree balance statistics
 *
 * @param node Root node
 * @returns Balance statistics
 */
export function getBalanceStats(node: IntervalTreeNode | null): {
  isBalanced: boolean;
  maxBalanceFactor: number;
  minBalanceFactor: number;
  averageBalanceFactor: number;
  unbalancedNodes: number;
} {
  const balanceFactors: number[] = [];
  const unbalancedNodes: number[] = [];

  collectBalanceFactors(node, balanceFactors, unbalancedNodes);

  const isBalanced = unbalancedNodes.length === 0;
  const maxBalanceFactor = balanceFactors.length > 0 ? Math.max(...balanceFactors) : 0;
  const minBalanceFactor = balanceFactors.length > 0 ? Math.min(...balanceFactors) : 0;
  const averageBalanceFactor = balanceFactors.length > 0 
    ? balanceFactors.reduce((sum, factor) => sum + factor, 0) / balanceFactors.length 
    : 0;

  return {
    isBalanced,
    maxBalanceFactor,
    minBalanceFactor,
    averageBalanceFactor,
    unbalancedNodes: unbalancedNodes.length,
  };
}

/**
 * Collect balance factors from all nodes
 *
 * @param node Current node
 * @param balanceFactors Array to store balance factors
 * @param unbalancedNodes Array to store unbalanced node indices
 */
function collectBalanceFactors(
  node: IntervalTreeNode | null,
  balanceFactors: number[],
  unbalancedNodes: number[]
): void {
  if (!node) return;

  const balance = getBalanceFactor(node);
  balanceFactors.push(balance);

  if (Math.abs(balance) > 1) {
    unbalancedNodes.push(balanceFactors.length - 1);
  }

  collectBalanceFactors(node.left, balanceFactors, unbalancedNodes);
  collectBalanceFactors(node.right, balanceFactors, unbalancedNodes);
}

/**
 * Perform double rotation (left-right or right-left)
 *
 * @param node Node to rotate
 * @param direction Rotation direction
 * @param eventHandlers Event handlers
 * @returns New root of subtree
 */
export function performDoubleRotation(
  node: IntervalTreeNode,
  direction: "left-right" | "right-left",
  eventHandlers: IntervalTreeEventHandler[] = []
): IntervalTreeNode {
  if (direction === "left-right") {
    // Left-Right case: first left rotate the left child, then right rotate the node
    node.left = leftRotate(node.left!, eventHandlers);
    return rightRotate(node, eventHandlers);
  } else {
    // Right-Left case: first right rotate the right child, then left rotate the node
    node.right = rightRotate(node.right!, eventHandlers);
    return leftRotate(node, eventHandlers);
  }
}

/**
 * Rebalance entire tree
 *
 * @param node Root node
 * @param eventHandlers Event handlers
 * @returns Rebalanced root node
 */
export function rebalanceTree(
  node: IntervalTreeNode | null,
  eventHandlers: IntervalTreeEventHandler[] = []
): IntervalTreeNode | null {
  if (!node) return null;

  // Rebalance subtrees first
  node.left = rebalanceTree(node.left, eventHandlers);
  node.right = rebalanceTree(node.right, eventHandlers);

  // Update node properties
  updateNode(node);

  // Balance current node
  return balanceNode(node, eventHandlers);
}

/**
 * Check if rotation is needed
 *
 * @param node Node to check
 * @returns True if rotation is needed
 */
export function needsRotation(node: IntervalTreeNode): boolean {
  const balance = getBalanceFactor(node);
  return Math.abs(balance) > 1;
}

/**
 * Get rotation type needed for a node
 *
 * @param node Node to check
 * @returns Rotation type or null if no rotation needed
 */
export function getRotationType(node: IntervalTreeNode): "left" | "right" | "left-right" | "right-left" | null {
  const balance = getBalanceFactor(node);

  if (balance > 1) {
    // Left heavy
    if (getBalanceFactor(node.left!) < 0) {
      return "left-right";
    }
    return "right";
  }

  if (balance < -1) {
    // Right heavy
    if (getBalanceFactor(node.right!) > 0) {
      return "right-left";
    }
    return "left";
  }

  return null;
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

