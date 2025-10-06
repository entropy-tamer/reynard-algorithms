/**
 * Optimized Collision Detection Adapter Module
 *
 * Barrel exports for all collision detection optimization components.
 *
 * @module algorithms/optimization/adapters
 */

// Main adapter
export { OptimizedCollisionAdapter } from "./optimized-collision-adapter";
export type { OptimizedCollisionConfig } from "./optimized-collision-adapter";

// Collision algorithms
export {
  checkCollision,
  createCollisionResult,
  executeNaiveCollisionDetection,
  executeSpatialCollisionDetection,
  executeOptimizedCollisionDetection,
} from "./collision-algorithms";

// Workload analysis utilities
export {
  analyzeWorkload,
  calculateSpatialDensity,
  calculateOverlapRatio,
  analyzeQueryPattern,
  getAlgorithmRecommendation,
} from "./workload-analyzer";
export type { WorkloadAnalysisResult } from "./workload-analyzer";

// Performance monitoring
export {
  PerformanceMonitor,
  type PerformanceRecord,
  type PerformanceThresholds,
  type CollisionPerformanceStats,
  type PerformanceReport,
} from "./performance-monitor";

// Re-export types from core modules
export type { MemoryPoolConfig, MemoryPoolStats, OptimizationRecommendation } from "../core/enhanced-memory-pool";
