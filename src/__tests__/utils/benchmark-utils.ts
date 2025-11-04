/**
 * Statistical Benchmark Framework
 *
 * Provides comprehensive benchmarking utilities with statistical analysis,
 * outlier detection, and performance regression testing for the algorithms package.
 *
 * @module algorithms/benchmarkUtils
 */

import { performance } from "perf_hooks";
import { getAlgorithmConfig } from "../../config/algorithm-config";

/**
 * Benchmark result for a single run
 */
export interface BenchmarkResult {
  /** Execution time in milliseconds */
  executionTime: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Timestamp of the run */
  timestamp: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Statistical analysis of benchmark results
 */
export interface StatisticalAnalysis {
  /** Number of samples */
  sampleCount: number;
  /** Mean execution time */
  mean: number;
  /** Median execution time */
  median: number;
  /** Standard deviation */
  standardDeviation: number;
  /** Coefficient of variation (std dev / mean) */
  coefficientOfVariation: number;
  /** Minimum execution time */
  min: number;
  /** Maximum execution time */
  max: number;
  /** 25th percentile */
  q1: number;
  /** 75th percentile */
  q3: number;
  /** Interquartile range */
  iqr: number;
  /** Whether outliers were detected */
  hasOutliers: boolean;
  /** Number of outliers removed */
  outliersRemoved: number;
  /** Confidence interval (95%) */
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

/**
 * Comprehensive benchmark report
 */
export interface BenchmarkReport {
  /** Test name */
  testName: string;
  /** Statistical analysis */
  statistics: StatisticalAnalysis;
  /** Raw benchmark results */
  rawResults: BenchmarkResult[];
  /** Cleaned results (outliers removed) */
  cleanedResults: BenchmarkResult[];
  /** Performance assertions */
  assertions: {
    /** Whether performance is within acceptable range */
    withinTolerance: boolean;
    /** Whether coefficient of variation is acceptable */
    stablePerformance: boolean;
    /** Whether there are significant outliers */
    hasSignificantOutliers: boolean;
  };
  /** Benchmark metadata */
  metadata: {
    /** Start timestamp */
    startTime: number;
    /** End timestamp */
    endTime: number;
    /** Total duration */
    totalDuration: number;
    /** Configuration used */
    config: any;
  };
}

/**
 * Benchmark options
 */
export interface BenchmarkOptions {
  /** Number of samples to run */
  samples?: number;
  /** Whether to remove outliers */
  removeOutliers?: boolean;
  /** Outlier detection threshold (standard deviations) */
  outlierThreshold?: number;
  /** Warmup iterations before benchmarking */
  warmupIterations?: number;
  /** Whether to collect memory usage */
  collectMemory?: boolean;
  /** Custom timeout for each iteration */
  timeout?: number;
}

/**
 * Performance assertion options
 */
export interface PerformanceAssertionOptions {
  /** Maximum acceptable execution time */
  maxTime?: number;
  /** Maximum coefficient of variation */
  maxCoefficientOfVariation?: number;
  /** Tolerance factor for assertions */
  toleranceFactor?: number;
  /** Whether to fail on outliers */
  failOnOutliers?: boolean;
}

/**
 * Benchmark utility class
 */
export class BenchmarkUtils {
  private config = getAlgorithmConfig();

  /**
   * Run a function multiple times and collect statistical data
   * @param fn
   * @param options
   * @example
   */
  public async runBenchmark<T>(fn: () => T | Promise<T>, options: BenchmarkOptions = {}): Promise<BenchmarkResult[]> {
    const {
      samples = this.config.performance.statistics.sampleCount,
      warmupIterations = 2,
      collectMemory = false,
      timeout = 30000,
    } = options;

    const results: BenchmarkResult[] = [];

    // Warmup runs
    for (let i = 0; i < warmupIterations; i++) {
      try {
        await this.runWithTimeout(fn, timeout);
      } catch (error) {
        console.warn(`Warmup run ${i + 1} failed:`, error);
      }
    }

    // Actual benchmark runs
    for (let i = 0; i < samples; i++) {
      try {
        const result = await this.runWithTimeout(fn, timeout);
        results.push(result);
      } catch (error) {
        console.warn(`Benchmark run ${i + 1} failed:`, error);
      }
    }

    return results;
  }

  /**
   * Run a function with timeout and collect performance data
   * @param fn
   * @param timeout
   * @example
   */
  private async runWithTimeout<T>(fn: () => T | Promise<T>, timeout: number): Promise<BenchmarkResult> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const startMemory = process.memoryUsage();

      const timer = setTimeout(() => {
        reject(new Error(`Benchmark timeout after ${timeout}ms`));
      }, timeout);

      Promise.resolve(fn())
        .then(() => {
          clearTimeout(timer);
          const endTime = performance.now();
          const endMemory = process.memoryUsage();

          resolve({
            executionTime: endTime - startTime,
            memoryUsage: endMemory.heapUsed - startMemory.heapUsed,
            timestamp: Date.now(),
          });
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Perform statistical analysis on benchmark results
   * @param results
   * @param options
   * @example
   */
  public analyzeResults(results: BenchmarkResult[], options: BenchmarkOptions = {}): StatisticalAnalysis {
    const {
      removeOutliers = this.config.performance.statistics.removeOutliers,
      outlierThreshold = this.config.performance.statistics.outlierThreshold,
    } = options;

    let analysisResults = results;
    let outliersRemoved = 0;

    if (removeOutliers && results.length > 2) {
      const { cleaned, outliers } = this.removeOutliers(results, outlierThreshold);
      analysisResults = cleaned;
      outliersRemoved = outliers;
    }

    const times = analysisResults.map(r => r.executionTime);
    const sorted = [...times].sort((a, b) => a - b);

    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const median = this.calculateMedian(sorted);
    const standardDeviation = this.calculateStandardDeviation(times, mean);
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 0;

    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;

    const confidenceInterval = this.calculateConfidenceInterval(times, mean, standardDeviation);

    return {
      sampleCount: analysisResults.length,
      mean,
      median,
      standardDeviation,
      coefficientOfVariation,
      min: Math.min(...times),
      max: Math.max(...times),
      q1,
      q3,
      iqr,
      hasOutliers: outliersRemoved > 0,
      outliersRemoved,
      confidenceInterval,
    };
  }

  /**
   * Remove outliers from benchmark results
   * @param results
   * @param threshold
   * @example
   */
  private removeOutliers(
    results: BenchmarkResult[],
    threshold: number
  ): { cleaned: BenchmarkResult[]; outliers: number } {
    const times = results.map(r => r.executionTime);
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const stdDev = this.calculateStandardDeviation(times, mean);

    const cleaned: BenchmarkResult[] = [];
    let outliers = 0;

    for (const result of results) {
      const zScore = Math.abs((result.executionTime - mean) / stdDev);
      if (zScore <= threshold) {
        cleaned.push(result);
      } else {
        outliers++;
      }
    }

    return { cleaned, outliers };
  }

  /**
   * Calculate median of sorted array
   * @param sorted
   * @example
   */
  private calculateMedian(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  /**
   * Calculate standard deviation
   * @param values
   * @param mean
   * @example
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate percentile
   * @param sorted
   * @param percentile
   * @example
   */
  private calculatePercentile(sorted: number[], percentile: number): number {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (upper >= sorted.length) return sorted[sorted.length - 1];
    if (lower === upper) return sorted[lower];

    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * Calculate 95% confidence interval
   * @param values
   * @param mean
   * @param stdDev
   * @example
   */
  private calculateConfidenceInterval(
    values: number[],
    mean: number,
    stdDev: number
  ): { lower: number; upper: number } {
    const n = values.length;
    const tValue = 1.96; // 95% confidence interval
    const margin = tValue * (stdDev / Math.sqrt(n));

    return {
      lower: mean - margin,
      upper: mean + margin,
    };
  }

  /**
   * Create comprehensive benchmark report
   * @param testName
   * @param results
   * @param options
   * @example
   */
  public createReport(testName: string, results: BenchmarkResult[], options: BenchmarkOptions = {}): BenchmarkReport {
    const startTime = Math.min(...results.map(r => r.timestamp));
    const endTime = Math.max(...results.map(r => r.timestamp));
    const totalDuration = endTime - startTime;

    const statistics = this.analyzeResults(results, options);
    const cleanedResults =
      options.removeOutliers !== false
        ? this.removeOutliers(results, options.outlierThreshold || 2.0).cleaned
        : results;

    const assertions = this.evaluateAssertions(statistics, {});

    return {
      testName,
      statistics,
      rawResults: results,
      cleanedResults,
      assertions,
      metadata: {
        startTime,
        endTime,
        totalDuration,
        config: this.config,
      },
    };
  }

  /**
   * Evaluate performance assertions
   * @param statistics
   * @param options
   * @example
   */
  private evaluateAssertions(
    statistics: StatisticalAnalysis,
    options: PerformanceAssertionOptions = {}
  ): BenchmarkReport["assertions"] {
    const { maxCoefficientOfVariation = this.config.performance.statistics.maxCoefficientOfVariation } = options;

    return {
      withinTolerance: true, // Will be set by specific test assertions
      stablePerformance: statistics.coefficientOfVariation <= maxCoefficientOfVariation,
      hasSignificantOutliers: statistics.hasOutliers && statistics.outliersRemoved > 0,
    };
  }

  /**
   * Compare two benchmark reports
   * @param baseline
   * @param current
   * @example
   */
  public compareReports(
    baseline: BenchmarkReport,
    current: BenchmarkReport
  ): {
    performanceChange: number;
    stabilityChange: number;
    regression: boolean;
    improvement: boolean;
  } {
    const performanceChange = (current.statistics.median - baseline.statistics.median) / baseline.statistics.median;
    const stabilityChange = current.statistics.coefficientOfVariation - baseline.statistics.coefficientOfVariation;

    const regression = performanceChange > 0.1; // 10% slower
    const improvement = performanceChange < -0.05; // 5% faster

    return {
      performanceChange,
      stabilityChange,
      regression,
      improvement,
    };
  }

  /**
   * Save benchmark report to file
   * @param report
   * @param filePath
   * @example
   */
  public saveReport(report: BenchmarkReport, filePath: string): void {
    const fs = require("fs");
    const path = require("path");

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  }

  /**
   * Load benchmark report from file
   * @param filePath
   * @example
   */
  public loadReport(filePath: string): BenchmarkReport | null {
    try {
      const fs = require("fs");
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data) as BenchmarkReport;
    } catch (error) {
      console.warn(`Failed to load benchmark report from ${filePath}:`, error);
      return null;
    }
  }
}

/**
 * Global benchmark utils instance
 */
export const benchmarkUtils = new BenchmarkUtils();

/**
 * Convenience function to run a benchmark
 * @param testName
 * @param fn
 * @param options
 * @example
 */
export async function runBenchmark<T>(
  testName: string,
  fn: () => T | Promise<T>,
  options: BenchmarkOptions = {}
): Promise<BenchmarkReport> {
  const results = await benchmarkUtils.runBenchmark(fn, options);
  return benchmarkUtils.createReport(testName, results, options);
}

/**
 * Convenience function for performance assertions
 * @param report
 * @param options
 * @example
 */
export function assertPerformance(report: BenchmarkReport, options: PerformanceAssertionOptions = {}): void {
  const {
    maxTime = report.metadata.config.performance.baselines.largeDataset,
    maxCoefficientOfVariation = report.metadata.config.performance.statistics.maxCoefficientOfVariation,
    failOnOutliers = false,
  } = options;

  if (report.statistics.median > maxTime) {
    throw new Error(
      `Performance assertion failed: median time ${report.statistics.median.toFixed(3)}ms exceeds maximum ${maxTime}ms`
    );
  }

  if (report.statistics.coefficientOfVariation > maxCoefficientOfVariation) {
    throw new Error(
      `Stability assertion failed: coefficient of variation ${report.statistics.coefficientOfVariation.toFixed(3)} exceeds maximum ${maxCoefficientOfVariation}`
    );
  }

  if (failOnOutliers && report.assertions.hasSignificantOutliers) {
    throw new Error(`Outlier assertion failed: ${report.statistics.outliersRemoved} outliers detected`);
  }
}
