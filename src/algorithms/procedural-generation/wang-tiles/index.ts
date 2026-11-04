/**
 * Wang Tiles
 *
 * Complete two-color Wang tiles: a constant-time tile per cell, with no solver
 * and no backtracking.
 *
 * @module algorithms/procedural-generation/wang-tiles
 */

export {
  WANG_ATLAS_SIDE,
  WANG_TILE_COUNT,
  colorEdges,
  edgeColor,
  fitsHorizontally,
  fitsVertically,
  generateWangMap,
  wangAtlasCell,
  wangIndex,
  wangTileAt,
  wangTileEdges,
} from "./wang-tiles-core";

export type {
  WangAtlasCell,
  WangColor,
  WangEdgeGrid,
  WangEdgeGridOptions,
  WangTileEdges,
} from "./wang-tiles-types";
