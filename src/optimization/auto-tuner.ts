/**
 * Auto-Tuning System
 * 
 * Provides machine-specific algorithm optimization through dynamic calibration
 * of thresholds and parameters. Uses machine fingerprinting to cache optimal
 * configurations and automatically tune algorithms for specific hardware.
 * 
 * @module algorithms/autoTuner
 */

import { performance } from 'perf_hooks';
import { getConfigManager, AlgorithmConfig, MachineFingerprint } from '../config/algorithm-config';
import { benchmarkUtils, BenchmarkReport } from '../__tests__/utils/benchmark-utils';

/**
 * Calibration test result for a specific threshold
 */
export interface CalibrationTestResult {
  /** Threshold value tested */
  threshold: number;
  /** Algorithm type tested */
  algorithm: 'naive' | 'spatial' | 'optimized';
  /** Average execution time */
  averageTime: number;
  /** Standard deviation */
  standardDeviation: number;
  /** Number of iterations run */
  iterations: number;
  /** Memory usage */
  memoryUsage: number;
  /** Whether this threshold performed well */
  isOptimal: boolean;
}

/**
 * Calibration result for a specific algorithm type
 */
export interface AlgorithmCalibrationResult {
  /** Algorithm type */
  algorithm: 'naive' | 'spatial' | 'optimized';
  /** Optimal threshold range */
  optimalThreshold: {
    min: number;
    max: number;
    recommended: number;
  };
  /** Performance characteristics */
  performance: {
    /** Best average execution time */
    bestTime: number;
    /** Worst average execution time */
    worstTime: number;
    /** Performance stability (coefficient of variation) */
    stability: number;
  };
  /** Test results for all thresholds */
  testResults: CalibrationTestResult[];
  /** Confidence level in the calibration */
  confidence: number;
}

/**
 * Complete calibration result
 */
export interface CalibrationResult {
  /** Machine fingerprint */
  machineFingerprint: MachineFingerprint;
  /** Calibration timestamp */
  timestamp: number;
  /** Total calibration time */
  calibrationTime: number;
  /** Algorithm calibration results */
  algorithms: AlgorithmCalibrationResult[];
  /** Recommended configuration */
  recommendedConfig: Partial<AlgorithmConfig>;
  /** Calibration metadata */
  metadata: {
    /** Number of test datasets used */
    testDatasets: number;
    /** Total iterations run */
    totalIterations: number;
    /** Calibration version */
    version: string;
  };
}

/**
 * Auto-tuner configuration
 */
export interface AutoTunerConfig {
  /** Whether to enable verbose logging */
  verbose: boolean;
  /** Maximum calibration time in milliseconds */
  maxCalibrationTime: number;
  /** Number of test datasets to generate */
  testDatasetCount: number;
  /** Size range for test datasets */
  datasetSizeRange: {
    min: number;
    max: number;
    step: number;
  };
  /** Whether to save calibration results */
  saveResults: boolean;
  /** Whether to load existing calibration if available */
  loadExisting: boolean;
}

/**
 * Auto-tuner class
 */
export class AutoTuner {
  private configManager = getConfigManager();
  private config: AlgorithmConfig;
  private autoTunerConfig: AutoTunerConfig;

  constructor(autoTunerConfig: Partial<AutoTunerConfig> = {}) {
    this.config = this.configManager.getConfig();
    this.autoTunerConfig = {
      verbose: false,
      maxCalibrationTime: this.config.autoTuning.calibration.maxCalibrationTime,
      testDatasetCount: 5,
      datasetSizeRange: {
        min: 10,
        max: 1000,
        step: 50,
      },
      saveResults: true,
      loadExisting: true,
      ...autoTunerConfig,
    };
  }

  /**
   * Run complete calibration for all algorithms
   */
  public async calibrate(): Promise<CalibrationResult> {
    const startTime = performance.now();
    this.log('Starting algorithm calibration...');

    // Check for existing calibration
    if (this.autoTunerConfig.loadExisting) {
      const existing = this.loadExistingCalibration();
      if (existing) {
        this.log('Using existing calibration results');
        return existing;
      }
    }

    const machineFingerprint = this.configManager.getMachineFingerprint();
    if (!machineFingerprint) {
      throw new Error('Unable to generate machine fingerprint');
    }

    // Generate test datasets
    const testDatasets = this.generateTestDatasets();
    this.log(`Generated ${testDatasets.length} test datasets`);

    // Calibrate each algorithm type
    const algorithms: AlgorithmCalibrationResult[] = [];
    
    // Calibrate collision detection algorithms
    const collisionCalibration = await this.calibrateCollisionAlgorithms(testDatasets);
    algorithms.push(...collisionCalibration);

    // Calibrate pathfinding algorithms
    const pathfindingCalibration = await this.calibratePathfindingAlgorithms(testDatasets);
    algorithms.push(...pathfindingCalibration);

    // Generate recommended configuration
    const recommendedConfig = this.generateRecommendedConfig(algorithms);

    const calibrationTime = performance.now() - startTime;
    const result: CalibrationResult = {
      machineFingerprint,
      timestamp: Date.now(),
      calibrationTime,
      algorithms,
      recommendedConfig,
      metadata: {
        testDatasets: testDatasets.length,
        totalIterations: algorithms.reduce((sum, alg) => 
          sum + alg.testResults.reduce((s, test) => s + test.iterations, 0), 0),
        version: '1.0.0',
      },
    };

    // Save results if enabled
    if (this.autoTunerConfig.saveResults) {
      this.saveCalibrationResult(result);
    }

    this.log(`Calibration completed in ${calibrationTime.toFixed(2)}ms`);
    return result;
  }

  /**
   * Calibrate collision detection algorithms
   */
  private async calibrateCollisionAlgorithms(
    testDatasets: any[][]
  ): Promise<AlgorithmCalibrationResult[]> {
    this.log('Calibrating collision detection algorithms...');
    
    const algorithms: AlgorithmCalibrationResult[] = [];
    const thresholds = this.config.autoTuning.calibration.testThresholds;

    // Test naive algorithm
    const naiveResults = await this.testAlgorithmThresholds(
      'naive',
      testDatasets,
      thresholds,
      this.runNaiveCollisionTest
    );
    algorithms.push(this.analyzeAlgorithmResults('naive', naiveResults));

    // Test spatial algorithm
    const spatialResults = await this.testAlgorithmThresholds(
      'spatial',
      testDatasets,
      thresholds,
      this.runSpatialCollisionTest
    );
    algorithms.push(this.analyzeAlgorithmResults('spatial', spatialResults));

    // Test optimized algorithm
    const optimizedResults = await this.testAlgorithmThresholds(
      'optimized',
      testDatasets,
      thresholds,
      this.runOptimizedCollisionTest
    );
    algorithms.push(this.analyzeAlgorithmResults('optimized', optimizedResults));

    return algorithms;
  }

  /**
   * Calibrate pathfinding algorithms
   */
  private async calibratePathfindingAlgorithms(
    testDatasets: any[][]
  ): Promise<AlgorithmCalibrationResult[]> {
    this.log('Calibrating pathfinding algorithms...');
    
    // For now, we'll focus on collision detection
    // Pathfinding calibration can be added later
    return [];
  }

  /**
   * Test algorithm performance at different thresholds
   */
  private async testAlgorithmThresholds(
    algorithm: string,
    testDatasets: any[][],
    thresholds: number[],
    testFunction: (dataset: any[], threshold: number) => Promise<BenchmarkReport>
  ): Promise<CalibrationTestResult[]> {
    const results: CalibrationTestResult[] = [];

    for (const threshold of thresholds) {
      this.log(`Testing ${algorithm} algorithm at threshold ${threshold}...`);
      
      const testResults: BenchmarkReport[] = [];
      
      for (const dataset of testDatasets) {
        try {
          const report = await testFunction(dataset, threshold);
          testResults.push(report);
        } catch (error) {
          this.log(`Error testing ${algorithm} at threshold ${threshold}: ${error}`);
        }
      }

      if (testResults.length > 0) {
        const averageTime = testResults.reduce((sum, r) => sum + r.statistics.median, 0) / testResults.length;
        const standardDeviation = Math.sqrt(
          testResults.reduce((sum, r) => sum + Math.pow(r.statistics.median - averageTime, 2), 0) / testResults.length
        );
        const totalIterations = testResults.reduce((sum, r) => sum + r.statistics.sampleCount, 0);
        const memoryUsage = testResults.reduce((sum, r) => sum + r.rawResults.reduce((s, res) => s + res.memoryUsage, 0), 0);

        results.push({
          threshold,
          algorithm: algorithm as 'naive' | 'spatial' | 'optimized',
          averageTime,
          standardDeviation,
          iterations: totalIterations,
          memoryUsage,
          isOptimal: false, // Will be set during analysis
        });
      }
    }

    return results;
  }

  /**
   * Analyze algorithm test results to find optimal thresholds
   */
  private analyzeAlgorithmResults(
    algorithm: string,
    results: CalibrationTestResult[]
  ): AlgorithmCalibrationResult {
    if (results.length === 0) {
      throw new Error(`No test results for ${algorithm} algorithm`);
    }

    // Sort by performance (lower is better)
    const sortedResults = [...results].sort((a, b) => a.averageTime - b.averageTime);
    
    // Find optimal threshold range
    const bestResult = sortedResults[0];
    const worstResult = sortedResults[sortedResults.length - 1];
    
    // Consider results within 10% of the best as optimal
    const optimalThreshold = bestResult.averageTime * 1.1;
    const optimalResults = sortedResults.filter(r => r.averageTime <= optimalThreshold);
    
    // Mark optimal results
    optimalResults.forEach(r => r.isOptimal = true);

    // Calculate performance characteristics
    const bestTime = bestResult.averageTime;
    const worstTime = worstResult.averageTime;
    const stability = bestResult.standardDeviation / bestResult.averageTime;

    // Calculate confidence based on consistency
    const confidence = Math.min(1.0, optimalResults.length / results.length);

    return {
      algorithm: algorithm as 'naive' | 'spatial' | 'optimized',
      optimalThreshold: {
        min: Math.min(...optimalResults.map(r => r.threshold)),
        max: Math.max(...optimalResults.map(r => r.threshold)),
        recommended: bestResult.threshold,
      },
      performance: {
        bestTime,
        worstTime,
        stability,
      },
      testResults: results,
      confidence,
    };
  }

  /**
   * Generate recommended configuration based on calibration results
   */
  private generateRecommendedConfig(
    algorithms: AlgorithmCalibrationResult[]
  ): Partial<AlgorithmConfig> {
    const config: Partial<AlgorithmConfig> = {};

    // Find collision detection thresholds
    const naiveResult = algorithms.find(a => a.algorithm === 'naive');
    const spatialResult = algorithms.find(a => a.algorithm === 'spatial');
    const optimizedResult = algorithms.find(a => a.algorithm === 'optimized');

    if (naiveResult && spatialResult) {
      // Find crossover point between naive and spatial
      const crossoverPoint = this.findCrossoverPoint(naiveResult, spatialResult);
      config.thresholds = {
        ...this.config.thresholds,
        naiveToSpatial: crossoverPoint,
      };
    }

    if (spatialResult && optimizedResult) {
      // Find crossover point between spatial and optimized
      const crossoverPoint = this.findCrossoverPoint(spatialResult, optimizedResult);
      config.thresholds = {
        ...config.thresholds,
        ...this.config.thresholds,
        spatialToOptimized: crossoverPoint,
      };
    }

    return config;
  }

  /**
   * Find crossover point between two algorithm results
   */
  private findCrossoverPoint(
    algorithm1: AlgorithmCalibrationResult,
    algorithm2: AlgorithmCalibrationResult
  ): number {
    // Find the threshold where algorithm2 becomes better than algorithm1
    const commonThresholds = algorithm1.testResults
      .filter(r1 => algorithm2.testResults.some(r2 => r2.threshold === r1.threshold))
      .map(r1 => r1.threshold)
      .sort((a, b) => a - b);

    for (const threshold of commonThresholds) {
      const result1 = algorithm1.testResults.find(r => r.threshold === threshold);
      const result2 = algorithm2.testResults.find(r => r.threshold === threshold);
      
      if (result1 && result2 && result2.averageTime < result1.averageTime) {
        return threshold;
      }
    }

    // If no crossover found, use the recommended threshold from algorithm2
    return algorithm2.optimalThreshold.recommended;
  }

  /**
   * Generate test datasets for calibration
   */
  private generateTestDatasets(): any[][] {
    const datasets: any[][] = [];
    const { min, max, step } = this.autoTunerConfig.datasetSizeRange;

    for (let size = min; size <= max; size += step) {
      for (let i = 0; i < this.autoTunerConfig.testDatasetCount; i++) {
        datasets.push(this.generateRandomAABBs(size));
      }
    }

    return datasets;
  }

  /**
   * Generate random AABBs for testing
   */
  private generateRandomAABBs(count: number): any[] {
    const aabbs: any[] = [];
    const rng = this.createSeededRng(42 + count);

    for (let i = 0; i < count; i++) {
      aabbs.push({
        x: rng() * 1000,
        y: rng() * 1000,
        width: 10 + rng() * 20,
        height: 10 + rng() * 20,
      });
    }

    return aabbs;
  }

  /**
   * Create seeded random number generator
   */
  private createSeededRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  /**
   * Test functions for different algorithms
   */
  private async runNaiveCollisionTest(dataset: any[], threshold: number): Promise<BenchmarkReport> {
    // Mock implementation - would use actual naive collision detection
    return benchmarkUtils.createReport('naive-test', [{
      executionTime: Math.random() * 10 + 1,
      memoryUsage: 1024,
      timestamp: Date.now(),
    }]);
  }

  private async runSpatialCollisionTest(dataset: any[], threshold: number): Promise<BenchmarkReport> {
    // Mock implementation - would use actual spatial collision detection
    return benchmarkUtils.createReport('spatial-test', [{
      executionTime: Math.random() * 5 + 0.5,
      memoryUsage: 2048,
      timestamp: Date.now(),
    }]);
  }

  private async runOptimizedCollisionTest(dataset: any[], threshold: number): Promise<BenchmarkReport> {
    // Mock implementation - would use actual optimized collision detection
    return benchmarkUtils.createReport('optimized-test', [{
      executionTime: Math.random() * 3 + 0.2,
      memoryUsage: 1536,
      timestamp: Date.now(),
    }]);
  }

  /**
   * Load existing calibration results
   */
  private loadExistingCalibration(): CalibrationResult | null {
    try {
      const machineFingerprint = this.configManager.getMachineFingerprint();
      if (!machineFingerprint) return null;

      const cacheDir = this.config.autoTuning.calibrationCacheDir;
      const fs = require('fs');
      const path = require('path');
      
      const calibrationFile = path.join(cacheDir, `calibration-${machineFingerprint.hash}.json`);
      
      if (fs.existsSync(calibrationFile)) {
        const data = fs.readFileSync(calibrationFile, 'utf-8');
        return JSON.parse(data) as CalibrationResult;
      }
    } catch (error) {
      this.log(`Failed to load existing calibration: ${error}`);
    }
    
    return null;
  }

  /**
   * Save calibration results
   */
  private saveCalibrationResult(result: CalibrationResult): void {
    try {
      const cacheDir = this.config.autoTuning.calibrationCacheDir;
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      
      const calibrationFile = path.join(cacheDir, `calibration-${result.machineFingerprint.hash}.json`);
      fs.writeFileSync(calibrationFile, JSON.stringify(result, null, 2));
      
      this.log(`Calibration results saved to ${calibrationFile}`);
    } catch (error) {
      this.log(`Failed to save calibration results: ${error}`);
    }
  }

  /**
   * Log message if verbose mode is enabled
   */
  private log(message: string): void {
    if (this.autoTunerConfig.verbose) {
      console.log(`[AutoTuner] ${message}`);
    }
  }
}

/**
 * Global auto-tuner instance
 */
export const autoTuner = new AutoTuner();

/**
 * Convenience function to run calibration
 */
export async function calibrateAlgorithms(
  options: Partial<AutoTunerConfig> = {}
): Promise<CalibrationResult> {
  const tuner = new AutoTuner(options);
  return await tuner.calibrate();
}

/**
 * CLI command for calibration
 */
export async function runCalibrationCLI(): Promise<void> {
  console.log('Starting algorithm calibration...');
  
  try {
    const result = await calibrateAlgorithms({ verbose: true });
    
    console.log('\nCalibration Results:');
    console.log(`Machine: ${result.machineFingerprint.cpuModel} (${result.machineFingerprint.cores} cores)`);
    console.log(`Calibration Time: ${result.calibrationTime.toFixed(2)}ms`);
    console.log(`Algorithms Tested: ${result.algorithms.length}`);
    
    for (const algorithm of result.algorithms) {
      console.log(`\n${algorithm.algorithm.toUpperCase()}:`);
      console.log(`  Optimal Threshold: ${algorithm.optimalThreshold.recommended}`);
      console.log(`  Range: ${algorithm.optimalThreshold.min} - ${algorithm.optimalThreshold.max}`);
      console.log(`  Best Time: ${algorithm.performance.bestTime.toFixed(3)}ms`);
      console.log(`  Stability: ${(algorithm.performance.stability * 100).toFixed(1)}%`);
      console.log(`  Confidence: ${(algorithm.confidence * 100).toFixed(1)}%`);
    }
    
    if (result.recommendedConfig.thresholds) {
      console.log('\nRecommended Configuration:');
      console.log(JSON.stringify(result.recommendedConfig, null, 2));
    }
    
    console.log('\nCalibration completed successfully!');
  } catch (error) {
    console.error('Calibration failed:', error);
    process.exit(1);
  }
}

// Memo tuning integration (placeholder for PAW ingestion)
export interface MemoTuningSnapshot {
  functionName: string;
  hitRate: number;
  avgFnMs: number;
  avgOverheadMs: number;
  enabled: boolean;
}

export interface MemoTuningPolicy {
  name?: string; // Optional name for the policy
  minHitRate: number;
  overheadBudgetMs: number;
  minSamples: number;
  windowSize: number;
  maxSize?: number; // Optional max size
}

export function analyzeMemoStats(snapshots: MemoTuningSnapshot[], policy: MemoTuningPolicy) {
  // PAW analyzer: evaluate snapshots and adjust policies
  const results: Array<{ functionName: string; recommendation: string; newPolicy?: Partial<MemoTuningPolicy> }> = [];
  
  for (const snapshot of snapshots) {
    let recommendation = "no_change";
    let newPolicy: Partial<MemoTuningPolicy> | undefined;
    
    if (snapshot.hitRate < policy.minHitRate) {
      recommendation = "disable_or_reduce_cache";
      newPolicy = { maxSize: Math.floor(snapshot.hitRate * 1000) };
    } else if (snapshot.avgOverheadMs > policy.overheadBudgetMs) {
      recommendation = "increase_hit_threshold";
      newPolicy = { minHitRate: Math.min(0.9, snapshot.hitRate + 0.1) };
    } else if (snapshot.hitRate > 0.8 && snapshot.avgOverheadMs < policy.overheadBudgetMs * 0.5) {
      recommendation = "increase_cache_size";
      newPolicy = { maxSize: Math.min(8192, 2048 * 2) };
    }
    
    results.push({ functionName: snapshot.functionName, recommendation, newPolicy });
  }
  
  return results;
}
