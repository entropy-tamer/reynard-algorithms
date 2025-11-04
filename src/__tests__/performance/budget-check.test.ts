/**
 * Performance Budget Check Tests
 *
 * Tests for checking performance metrics against budgets.
 *
 * @module algorithms/performance/__tests__/budget-check
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PerformanceBudgetChecker } from "../../utils/performance/budget";
import {
  createTestBudget,
  createTestMetrics,
  createExceedingMetrics,
  createAtLimitMetrics,
} from "../../utils/performance/test-utils";

describe("PerformanceBudgetChecker - Check", () => {
  let checker: PerformanceBudgetChecker;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    checker = new PerformanceBudgetChecker();
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("checkBudget", () => {
    it("should return true when no budget is set", () => {
      const metrics = createTestMetrics({
        duration: 1000,
        memoryAfter: 10000,
        memoryDelta: 10000,
        iterations: 10000,
      });

      expect(checker.checkBudget("nonexistent-budget", metrics)).toBe(true);
    });

    it("should return true when all metrics are within budget", () => {
      const budget = createTestBudget();
      const metrics = createTestMetrics();

      checker.setBudget("test-budget", budget);
      expect(checker.checkBudget("test-budget", metrics)).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should return false and warn when duration exceeds budget", () => {
      const budget = createTestBudget();
      const metrics = createTestMetrics({ duration: 150 });

      checker.setBudget("test-budget", budget);
      expect(checker.checkBudget("test-budget", metrics)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Performance budget violation for test-budget:",
        "Duration: 150ms > 100ms"
      );
    });

    it("should return false and warn when memory usage exceeds budget", () => {
      const budget = createTestBudget();
      const metrics = createTestMetrics({
        memoryAfter: 2048,
        memoryDelta: 2048,
      });

      checker.setBudget("test-budget", budget);
      expect(checker.checkBudget("test-budget", metrics)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Performance budget violation for test-budget:",
        "Memory: 2048 bytes > 1024 bytes"
      );
    });

    it("should return false and warn when iterations exceed budget", () => {
      const budget = createTestBudget();
      const metrics = createTestMetrics({ iterations: 1500 });

      checker.setBudget("test-budget", budget);
      expect(checker.checkBudget("test-budget", metrics)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Performance budget violation for test-budget:",
        "Iterations: 1500 > 1000"
      );
    });

    it("should return false and warn about multiple violations", () => {
      const budget = createTestBudget();
      const metrics = createExceedingMetrics();

      checker.setBudget("test-budget", budget);
      expect(checker.checkBudget("test-budget", metrics)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Performance budget violation for test-budget:",
        "Duration: 150ms > 100ms, Memory: 2048 bytes > 1024 bytes, Iterations: 1500 > 1000"
      );
    });

    it("should handle edge case values exactly at budget limits", () => {
      const budget = createTestBudget();
      const metrics = createAtLimitMetrics();

      checker.setBudget("test-budget", budget);
      expect(checker.checkBudget("test-budget", metrics)).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should handle zero values in metrics", () => {
      const budget = createTestBudget({
        maxDuration: 0,
        maxMemoryUsage: 0,
        maxIterations: 0,
      });
      const metrics = createTestMetrics({
        duration: 0,
        memoryDelta: 0,
        iterations: 0,
      });

      checker.setBudget("test-budget", budget);
      expect(checker.checkBudget("test-budget", metrics)).toBe(true);
    });

    it("should handle very large values", () => {
      const budget = createTestBudget({
        maxDuration: Number.MAX_SAFE_INTEGER,
        maxMemoryUsage: Number.MAX_SAFE_INTEGER,
        maxIterations: Number.MAX_SAFE_INTEGER,
      });
      const metrics = createTestMetrics({
        duration: 1000000,
        memoryDelta: 1000000,
        iterations: 1000000,
      });

      checker.setBudget("test-budget", budget);
      expect(checker.checkBudget("test-budget", metrics)).toBe(true);
    });
  });
});
