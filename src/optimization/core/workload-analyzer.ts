/**
 * Workload Analysis Module
 *
 * Analyzes workload characteristics to determine optimal algorithm selection.
 *
 * @module algorithms/optimization/workloadAnalyzer
 */

import type { WorkloadCharacteristics, WorkloadAnalysis, PerformanceRecord } from "./algorithm-selector-types";
import { ComplexityAnalyzer } from "./complexity-analyzer";
import { MemoryAnalyzer } from "./memory-analyzer";
import { PerformanceAnalyzer } from "./performance-analyzer";
import { RecommendationGenerator } from "./recommendation-generator";

/**
 * Analyzes workload characteristics for algorithm selection
 */
export class WorkloadAnalyzer {
  private complexityAnalyzer: ComplexityAnalyzer;
  private memoryAnalyzer: MemoryAnalyzer;
  private performanceAnalyzer: PerformanceAnalyzer;
  private recommendationGenerator: RecommendationGenerator;

  constructor() {
    this.complexityAnalyzer = new ComplexityAnalyzer();
    this.memoryAnalyzer = new MemoryAnalyzer();
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.recommendationGenerator = new RecommendationGenerator();
  }

  /**
   * Analyze workload characteristics
   */
  analyzeWorkload(workload: WorkloadCharacteristics): WorkloadAnalysis {
    const complexity = this.complexityAnalyzer.calculateComplexity(workload);
    const memoryPressure = this.memoryAnalyzer.calculateMemoryPressure(workload);
    const performanceProfile = this.performanceAnalyzer.getPerformanceProfile(workload);

    return {
      workload,
      complexity,
      memoryPressure,
      performanceProfile,
      recommendations: this.recommendationGenerator.generateRecommendations(workload, complexity, memoryPressure),
    };
  }

  /**
   * Set performance history for analysis
   */
  setPerformanceHistory(history: PerformanceRecord[]): void {
    this.performanceAnalyzer.setPerformanceHistory(history);
  }
}
