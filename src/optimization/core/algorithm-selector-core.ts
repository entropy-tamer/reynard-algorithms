/**
 * Core Algorithm Selection Logic
 *
 * Contains the core algorithm selection algorithms for different types.
 *
 * @module algorithms/optimization/algorithmSelectorCore
 */

import type { WorkloadAnalysis, AlgorithmSelection } from "./algorithm-selector-types";
import { CollisionSelector } from "./collision-selector";
import { SpatialSelector } from "./spatial-selector";
import { UnionFindSelector } from "./union-find-selector";

/**
 * Core algorithm selection logic
 */
export class AlgorithmSelectorCore {
  private collisionSelector: CollisionSelector;
  private spatialSelector: SpatialSelector;
  private unionFindSelector: UnionFindSelector;

  constructor() {
    this.collisionSelector = new CollisionSelector();
    this.spatialSelector = new SpatialSelector();
    this.unionFindSelector = new UnionFindSelector();
  }

  /**
   * Select optimal collision detection algorithm
   */
  selectOptimalCollisionAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    return this.collisionSelector.selectOptimalCollisionAlgorithm(analysis, t);
  }

  /**
   * Select optimal spatial algorithm
   */
  selectOptimalSpatialAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    return this.spatialSelector.selectOptimalSpatialAlgorithm(analysis, t);
  }

  /**
   * Select optimal Union-Find algorithm
   */
  selectOptimalUnionFindAlgorithm(analysis: WorkloadAnalysis): AlgorithmSelection {
    return this.unionFindSelector.selectOptimalUnionFindAlgorithm(analysis);
  }
}
