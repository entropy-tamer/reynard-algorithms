/**
 * @module algorithms/data-structures/fenwick-tree
 * @description Provides the Fenwick Tree (Binary Indexed Tree) data structure and related utilities.
 */

export { FenwickTree } from "./fenwick-tree-core";
export type {
  FenwickTreeConfig,
  FenwickTreeQueryResult,
  FenwickTreeUpdateResult,
  FenwickTreeRangeUpdateResult,
  FenwickTreeStats,
  FenwickTreeEvent,
  FenwickTreeEventType,
  FenwickTreeEventHandler,
  FenwickTreeOptions,
  FenwickTreePerformanceMetrics,
  BatchOperationResult,
  FenwickTreeSerialization,
} from "./fenwick-tree-types";
