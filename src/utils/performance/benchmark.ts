/**
 * Performance Benchmarking Utilities
 *
 * Benchmarking and measurement utilities for performance analysis.
 *
 * @module algorithms/performance/benchmark
 */

import { PerformanceTimer } from "./timer";
import { MemoryMonitor } from "../memory/memory";
import type { PerformanceMetrics, PerformanceBudget } from "./types";

/**
 * Performance benchmark runner
 */
export class PerformanceBenchmark {
  private timer = new PerformanceTimer();
  private memoryMonitor = new MemoryMonitor();

  /**
   *
   * @param fn
   * @param iterations
   * @param budget
   * @example
   */
  async run<T>(
    fn: () => T | Promise<T>,
    iterations: number = 1,
    budget?: PerformanceBudget
  ): Promise<PerformanceMetrics> {
    const times: number[] = [];
    const memoryBefore = this.memoryMonitor.measure();

    this.timer.start();

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);

      if (budget && end - start > budget.maxDuration) {
        console.warn(`Performance budget exceeded: ${end - start}ms > ${budget.maxDuration}ms`);
      }
    }

    const totalDuration = this.timer.stop();
    const memoryAfter = this.memoryMonitor.measure();

    const sortedTimes = times.sort((a, b) => a - b);
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = sortedTimes[0];
    const maxTime = sortedTimes[sortedTimes.length - 1];

    // Calculate standard deviation
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      duration: totalDuration,
      memoryBefore,
      memoryAfter,
      memoryDelta: memoryAfter - memoryBefore,
      timestamp: Date.now(),
      iterations,
      averageTime,
      minTime,
      maxTime,
      standardDeviation,
    };
  }
}

/**
 * Utility function to measure async operation performance
 * @param operation
 * @param name
 * @example
 */
export async function measureAsync<T>(
  operation: () => Promise<T>,
  name?: string
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const benchmark = new PerformanceBenchmark();
  const metrics = await benchmark.run(operation, 1);

  if (name) {
    console.log(`Performance measurement for ${name}:`, metrics);
  }

  return { result: await operation(), metrics };
}

/**
 * Utility function to measure sync operation performance
 * @param operation
 * @param name
 * @param iterations
 * @example
 */
export async function measureSync<T>(
  operation: () => T,
  name?: string,
  iterations: number = 1
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const benchmark = new PerformanceBenchmark();
  const metrics = await benchmark.run(operation, iterations);

  if (name) {
    console.log(`Performance measurement for ${name}:`, metrics);
  }

  return { result: operation(), metrics };
}
