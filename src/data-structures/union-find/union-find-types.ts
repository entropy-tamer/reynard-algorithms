/**
 * Type definitions for Union-Find data structure
 *
 * @module algorithms/unionFindTypes
 */

export interface UnionFindNode {
  parent: number;
  rank: number;
}

export interface UnionFindStats {
  totalNodes: number;
  totalSets: number;
  maxRank: number;
  averageRank: number;
  compressionCount: number;
  unionCount: number;
}
