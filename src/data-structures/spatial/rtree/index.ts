/**
 * @module algorithms/spatial-structures/rtree
 * @description Provides the R-Tree spatial data structure for efficient spatial queries.
 */

export { RTree } from "./rtree-core";
export type {
  Point,
  Rectangle,
  RTreeEntry,
  RTreeNode,
  RTreeConfig,
  RTreeStats,
  RTreeQueryResult,
  RTreeQueryOptions,
  RTreeInsertResult,
  RTreeDeleteResult,
} from "./rtree-types";
