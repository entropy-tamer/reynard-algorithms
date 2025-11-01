import type {
  Interval,
  IntervalTreeNode,
  IntervalTreeStats,
  IntervalTreePerformanceMetrics,
} from "./interval-tree-types";

export function getTreeSize(root: IntervalTreeNode | null): number {
  return countNodes(root);
}

export function isTreeEmpty(root: IntervalTreeNode | null): boolean {
  return root === null;
}

export function getTreeHeight(root: IntervalTreeNode | null): number {
  return getHeight(root);
}

export function calculateTreeStats(root: IntervalTreeNode | null, stats: IntervalTreeStats): void {
  stats.totalNodes = countNodes(root);
  stats.height = getHeight(root);
  stats.averageIntervalLength = calculateAverageIntervalLength(root);
}

export function getPerformanceMetrics(stats: IntervalTreeStats): IntervalTreePerformanceMetrics {
  return {
    totalOperations: stats.totalSearches + stats.totalInserts + stats.totalDeletes,
    averageSearchTime: stats.averageSearchTime,
    averageInsertTime: stats.averageInsertTime,
    averageDeleteTime: stats.averageDeleteTime,
    performanceScore: 0,
    memoryUsage: stats.memoryUsage,
    treeHeight: stats.height,
    nodeCount: stats.totalNodes,
    totalIntervals: stats.totalIntervals,
    averageIntervalLength: stats.averageIntervalLength,
    balanceFactor: 0,
  };
}

export function resetStats(stats: IntervalTreeStats): void {
  stats.totalIntervals = 0;
  stats.totalNodes = 0;
  stats.height = 0;
  stats.averageIntervalLength = 0;
  stats.totalSearches = 0;
  stats.totalInserts = 0;
  stats.totalDeletes = 0;
  stats.averageSearchTime = 0;
  stats.memoryUsage = 0;
}

export function updateAverageTime(currentAverage: number, newTime: number, count: number): number {
  return (currentAverage * (count - 1) + newTime) / count;
}

function countNodes(node: IntervalTreeNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

function getHeight(node: IntervalTreeNode | null): number {
  if (!node) return 0;
  return Math.max(getHeight(node.left), getHeight(node.right)) + 1;
}

function calculateAverageIntervalLength(node: IntervalTreeNode | null): number {
  if (!node) return 0;

  const intervals: Interval[] = [];
  collectIntervals(node, intervals);

  if (intervals.length === 0) return 0;

  const totalLength = intervals.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
  return totalLength / intervals.length;
}

function collectIntervals(node: IntervalTreeNode | null, intervals: Interval[]): void {
  if (!node) return;

  intervals.push({ ...node.interval });
  collectIntervals(node.left, intervals);
  collectIntervals(node.right, intervals);
}



