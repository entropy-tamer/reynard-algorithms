/**
 * Performance Budget Management
 *
 * Performance budget checking and validation utilities.
 *
 * @module algorithms/performance/budget
 */

import type { PerformanceBudget, PerformanceMetrics } from "./types";

/**
 * Performance budget checker
 */
export class PerformanceBudgetChecker {
  private budgets = new Map<string, PerformanceBudget>();

  /**
   *
   * @param name
   * @param budget
   * @example
   */
  setBudget(name: string, budget: PerformanceBudget): void {
    this.budgets.set(name, budget);
  }

  /**
   *
   * @param name
   * @param metrics
   * @example
   */
  checkBudget(name: string, metrics: PerformanceMetrics): boolean {
    const budget = this.budgets.get(name);
    if (!budget) return true;

    const violations = [];

    if (metrics.duration > budget.maxDuration) {
      violations.push(`Duration: ${metrics.duration}ms > ${budget.maxDuration}ms`);
    }

    if (metrics.memoryDelta > budget.maxMemoryUsage) {
      violations.push(`Memory: ${metrics.memoryDelta} bytes > ${budget.maxMemoryUsage} bytes`);
    }

    if (metrics.iterations > budget.maxIterations) {
      violations.push(`Iterations: ${metrics.iterations} > ${budget.maxIterations}`);
    }

    if (violations.length > 0) {
      console.warn(`Performance budget violation for ${name}:`, violations.join(", "));
      return false;
    }

    return true;
  }

  /**
   *
   * @param name
   * @example
   */
  clearBudget(name: string): void {
    this.budgets.delete(name);
  }

  /**
   *
   * @example
   */
  clearAllBudgets(): void {
    this.budgets.clear();
  }
}
