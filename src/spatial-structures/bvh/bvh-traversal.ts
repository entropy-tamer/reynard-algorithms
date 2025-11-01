/**
 * BVH Traversal Operations
 *
 * Handles tree traversal, node visiting, and iteration logic
 * for the BVH data structure.
 *
 * @module algorithms/spatial-structures/bvh
 */

import type {
  BVHNode,
  BVHStats,
} from "./bvh-types";

/**
 * Traverse BVH tree and visit all nodes
 *
 * @param root Root node of the BVH
 * @param visitor Function to call for each node
 * @param stats Statistics object to update
 * @returns Number of nodes visited
 */
export function traverseTree(
  root: BVHNode | null,
  visitor: (node: BVHNode, depth: number) => void,
  stats: BVHStats
): number {
  if (!root) return 0;

  let nodesVisited = 0;
  traverseRecursive(root, visitor, 0, () => nodesVisited++);
  return nodesVisited;
}

/**
 * Traverse BVH tree and collect all primitives
 *
 * @param root Root node of the BVH
 * @param stats Statistics object to update
 * @returns Array of all primitives
 */
export function collectAllPrimitives(root: BVHNode | null, stats: BVHStats): any[] {
  const primitives: any[] = [];
  
  if (!root) return primitives;

  traverseRecursive(root, (node) => {
    if (node.isLeaf) {
      primitives.push(...node.primitives);
    }
  }, 0, () => {});

  return primitives;
}

/**
 * Find leaf nodes in BVH tree
 *
 * @param root Root node of the BVH
 * @param stats Statistics object to update
 * @returns Array of leaf nodes
 */
export function findLeafNodes(root: BVHNode | null, stats: BVHStats): BVHNode[] {
  const leafNodes: BVHNode[] = [];
  
  if (!root) return leafNodes;

  traverseRecursive(root, (node) => {
    if (node.isLeaf) {
      leafNodes.push(node);
    }
  }, 0, () => {});

  return leafNodes;
}

/**
 * Calculate tree depth
 *
 * @param root Root node of the BVH
 * @param stats Statistics object to update
 * @returns Maximum depth of the tree
 */
export function calculateTreeDepth(root: BVHNode | null, stats: BVHStats): number {
  if (!root) return 0;

  let maxDepth = 0;
  traverseRecursive(root, (node, depth) => {
    maxDepth = Math.max(maxDepth, depth);
  }, 0, () => {});

  return maxDepth;
}

/**
 * Count nodes by type
 *
 * @param root Root node of the BVH
 * @param stats Statistics object to update
 * @returns Object with node counts
 */
export function countNodes(root: BVHNode | null, stats: BVHStats): { total: number; leaf: number; internal: number } {
  const counts = { total: 0, leaf: 0, internal: 0 };
  
  if (!root) return counts;

  traverseRecursive(root, (node) => {
    counts.total++;
    if (node.isLeaf) {
      counts.leaf++;
    } else {
      counts.internal++;
    }
  }, 0, () => {});

  return counts;
}

/**
 * Find nodes at specific depth
 *
 * @param root Root node of the BVH
 * @param targetDepth Target depth
 * @param stats Statistics object to update
 * @returns Array of nodes at target depth
 */
export function findNodesAtDepth(
  root: BVHNode | null,
  targetDepth: number,
  stats: BVHStats
): BVHNode[] {
  const nodes: BVHNode[] = [];
  
  if (!root) return nodes;

  traverseRecursive(root, (node, depth) => {
    if (depth === targetDepth) {
      nodes.push(node);
    }
  }, 0, () => {});

  return nodes;
}

/**
 * Recursively traverse BVH tree
 *
 * @param node Current node
 * @param visitor Function to call for each node
 * @param depth Current depth
 * @param onVisit Function to call when visiting a node
 */
function traverseRecursive(
  node: BVHNode,
  visitor: (node: BVHNode, depth: number) => void,
  depth: number,
  onVisit: () => void
): void {
  onVisit();
  visitor(node, depth);

  if (!node.isLeaf) {
    if (node.left) {
      traverseRecursive(node.left, visitor, depth + 1, onVisit);
    }
    if (node.right) {
      traverseRecursive(node.right, visitor, depth + 1, onVisit);
    }
  }
}

/**
 * Breadth-first traversal of BVH tree
 *
 * @param root Root node of the BVH
 * @param visitor Function to call for each node
 * @param stats Statistics object to update
 * @returns Number of nodes visited
 */
export function breadthFirstTraversal(
  root: BVHNode | null,
  visitor: (node: BVHNode, depth: number) => void,
  stats: BVHStats
): number {
  if (!root) return 0;

  const queue: Array<{ node: BVHNode; depth: number }> = [{ node: root, depth: 0 }];
  let nodesVisited = 0;

  while (queue.length > 0) {
    const { node, depth } = queue.shift()!;
    nodesVisited++;
    visitor(node, depth);

    if (!node.isLeaf) {
      if (node.left) {
        queue.push({ node: node.left, depth: depth + 1 });
      }
      if (node.right) {
        queue.push({ node: node.right, depth: depth + 1 });
      }
    }
  }

  return nodesVisited;
}

/**
 * Find nodes with specific criteria
 *
 * @param root Root node of the BVH
 * @param predicate Function to test each node
 * @param stats Statistics object to update
 * @returns Array of nodes matching criteria
 */
export function findNodes(
  root: BVHNode | null,
  predicate: (node: BVHNode, depth: number) => boolean,
  stats: BVHStats
): BVHNode[] {
  const matchingNodes: BVHNode[] = [];
  
  if (!root) return matchingNodes;

  traverseRecursive(root, (node, depth) => {
    if (predicate(node, depth)) {
      matchingNodes.push(node);
    }
  }, 0, () => {});

  return matchingNodes;
}

