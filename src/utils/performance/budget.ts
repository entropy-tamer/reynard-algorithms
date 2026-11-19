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
   * Registers or replaces the performance budget associated with `name`.
   *
   * @param name Identifier used by `checkBudget`.
   * @param budget Limits for duration, memory usage, and iterations.
   */
  setBudget(name: string, budget: PerformanceBudget): void {
    this.budgets.set(name, budget);
  }

  /**
   * Checks metrics against the named budget, warning on each exceeded limit.
   *
   * Names with no registered budget pass automatically.
   *
   * @param name Budget identifier to check against.
   * @param metrics Measured duration, memory delta, and iteration count.
   * @returns `true` when every limit is met or no budget is registered.
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
   * Removes the budget registered under `name`.
   *
   * @param name Identifier to forget.
   */
  clearBudget(name: string): void {
    this.budgets.delete(name);
  }

  /**
   * Removes every registered budget.
   */
  clearAllBudgets(): void {
    this.budgets.clear();
  }
}
