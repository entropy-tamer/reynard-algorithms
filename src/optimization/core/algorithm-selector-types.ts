/**
 * Type definitions for the Algorithm Selector system
 *
 * @module algorithms/optimization/algorithmSelectorTypes
 */

export interface WorkloadCharacteristics {
  objectCount: number;
  spatialDensity: number;
  overlapRatio: number;
  updateFrequency: number;
  queryPattern: "random" | "clustered" | "sequential";
  memoryConstraints?: {
    maxMemoryUsage: number;
    gcPressure: number;
  };
}

export interface PerformanceRecord {
  algorithm: string;
  workload: WorkloadCharacteristics;
  performance: {
    executionTime: number;
    memoryUsage: number;
    allocationCount: number;
    cacheHitRate: number;
  };
  timestamp: number;
}

export interface AlgorithmSelection {
  algorithm: string;
  confidence: number;
  expectedPerformance: {
    executionTime: number;
    memoryUsage: number;
  };
  reasoning: string[];
}

export interface SelectionStats {
  totalSelections: number;
  correctSelections: number;
  averageConfidence: number;
  performanceImprovement: number;
}

export interface WorkloadAnalysis {
  complexity: ComplexityAnalysis;
  memoryPressure: MemoryPressureAnalysis;
  performanceProfile: PerformanceProfile;
  recommendations: string[];
  workload: WorkloadCharacteristics;
}

export interface ComplexityAnalysis {
  naive: number;
  spatial: number;
  optimized: number;
  crossoverPoint: number;
  recommendation: string;
}

export interface MemoryPressureAnalysis {
  estimatedUsage: {
    naive: number;
    spatial: number;
    optimized: number;
  };
  pressure: number;
  recommendation: string;
}

export interface PerformanceProfile {
  confidence: number;
  expectedPerformance: PerformanceMetrics;
  historicalData: PerformanceRecord[];
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  allocationCount: number;
  cacheHitRate: number;
}
