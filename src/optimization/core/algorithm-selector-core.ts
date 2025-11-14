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
import { ProceduralSelector } from "./procedural-selector";

/**
 * Core algorithm selection logic
 */
export class AlgorithmSelectorCore {
  private collisionSelector: CollisionSelector;
  private spatialSelector: SpatialSelector;
  private unionFindSelector: UnionFindSelector;
  private proceduralSelector: ProceduralSelector;

  /**
   *
   * @example
   */
  constructor() {
    this.collisionSelector = new CollisionSelector();
    this.spatialSelector = new SpatialSelector();
    this.unionFindSelector = new UnionFindSelector();
    this.proceduralSelector = new ProceduralSelector();
  }

  /**
   * Select optimal collision detection algorithm
   * @param analysis
   * @param t
   * @example
   */
  selectOptimalCollisionAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    return this.collisionSelector.selectOptimalCollisionAlgorithm(analysis, t);
  }

  /**
   * Select optimal spatial algorithm
   * @param analysis
   * @param t
   * @example
   */
  selectOptimalSpatialAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    return this.spatialSelector.selectOptimalSpatialAlgorithm(analysis, t);
  }

  /**
   * Select optimal Union-Find algorithm
   * @param analysis
   * @example
   */
  selectOptimalUnionFindAlgorithm(analysis: WorkloadAnalysis): AlgorithmSelection {
    return this.unionFindSelector.selectOptimalUnionFindAlgorithm(analysis);
  }

  /**
   * Select optimal procedural generation algorithm
   * @param analysis
   * @param t
   * @example
   */
  selectOptimalProceduralAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection {
    return this.proceduralSelector.selectOptimalProceduralAlgorithm(analysis, t);
  }
}
