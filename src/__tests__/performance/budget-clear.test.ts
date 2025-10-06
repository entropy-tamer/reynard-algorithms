/**
 * Performance Budget Clear Tests
 *
 * Tests for clearing and removing performance budgets.
 *
 * @module algorithms/performance/__tests__/budget-clear
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PerformanceBudgetChecker } from "../../performance/budget";
import { createTestBudget, createTestMetrics } from "../../performance/test-utils";

describe("PerformanceBudgetChecker - Clear", () => {
  let checker: PerformanceBudgetChecker;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    checker = new PerformanceBudgetChecker();
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("clearBudget", () => {
    it("should clear a specific budget", () => {
      const budget = createTestBudget();
      const metrics = createTestMetrics({
        duration: 150,
        memoryAfter: 2048,
        memoryDelta: 2048,
        iterations: 1500,
      });

      checker.setBudget("test-budget", budget);
      checker.clearBudget("test-budget");

      // Should return true since budget is cleared
      expect(checker.checkBudget("test-budget", metrics)).toBe(true);
    });

    it("should not affect other budgets when clearing one", () => {
      const budget1 = createTestBudget({ maxDuration: 100 });
      const budget2 = createTestBudget({ maxDuration: 200 });
      const metrics = createTestMetrics({ duration: 150 });

      checker.setBudget("budget1", budget1);
      checker.setBudget("budget2", budget2);
      checker.clearBudget("budget1");

      // budget1 should be cleared (returns true)
      expect(checker.checkBudget("budget1", metrics)).toBe(true);
      // budget2 should still be active (returns true because 150 <= 200)
      expect(checker.checkBudget("budget2", metrics)).toBe(true);
    });

    it("should handle clearing non-existent budget gracefully", () => {
      expect(() => {
        checker.clearBudget("non-existent-budget");
      }).not.toThrow();
    });

    it("should allow setting budget again after clearing", () => {
      const budget1 = createTestBudget({ maxDuration: 100 });
      const budget2 = createTestBudget({ maxDuration: 200 });
      const metrics = createTestMetrics({ duration: 150 });

      checker.setBudget("test-budget", budget1);
      checker.clearBudget("test-budget");
      checker.setBudget("test-budget", budget2);

      // Should use the new budget (150 <= 200)
      expect(checker.checkBudget("test-budget", metrics)).toBe(true);
    });
  });

  describe("clearAllBudgets", () => {
    it("should clear all budgets", () => {
      const budget1 = createTestBudget({ maxDuration: 100 });
      const budget2 = createTestBudget({ maxDuration: 200 });
      const metrics = createTestMetrics({ duration: 150 });

      checker.setBudget("budget1", budget1);
      checker.setBudget("budget2", budget2);
      checker.clearAllBudgets();

      // Both budgets should be cleared
      expect(checker.checkBudget("budget1", metrics)).toBe(true);
      expect(checker.checkBudget("budget2", metrics)).toBe(true);
    });

    it("should handle clearing when no budgets exist", () => {
      expect(() => {
        checker.clearAllBudgets();
      }).not.toThrow();
    });

    it("should allow setting budgets again after clearing all", () => {
      const budget1 = createTestBudget({ maxDuration: 100 });
      const budget2 = createTestBudget({ maxDuration: 200 });
      const metrics = createTestMetrics({ duration: 150 });

      checker.setBudget("budget1", budget1);
      checker.setBudget("budget2", budget2);
      checker.clearAllBudgets();

      // Set budgets again
      checker.setBudget("budget1", budget1);
      checker.setBudget("budget2", budget2);

      // Should work as expected
      expect(checker.checkBudget("budget1", metrics)).toBe(false); // 150 > 100
      expect(checker.checkBudget("budget2", metrics)).toBe(true); // 150 <= 200
    });
  });
});
